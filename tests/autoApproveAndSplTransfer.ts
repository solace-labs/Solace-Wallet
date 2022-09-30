import * as anchor from "anchor-rn";
import { assert } from "chai";
import { KeyPair, SolaceSDK } from "../src/sdk";
import { relayTransaction } from "../src/relayer";
import { TokenMint } from "../src/utils/spl-util";
import {
  AccountLayout,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

const PROGRAM_ADDRESS = "55K8C3FfgRr6Nuwzw5gXV79hQUj3bVRpEPSjoF18HKfh";

const walletName = "name.solace.io1111111";

describe("auto approve and transfer spl after incubation is disabled", () => {
  let owner: anchor.web3.Keypair;
  let signer: anchor.web3.Keypair;
  let seedBase: anchor.web3.Keypair;
  let walletAddress: anchor.web3.PublicKey;

  let guardian1: anchor.web3.Keypair;
  let guardian2: anchor.web3.Keypair;
  let newOwner: anchor.web3.Keypair;
  let relayPair: anchor.web3.Keypair;
  let usdcOwner: anchor.web3.Keypair;

  const getWallet = () => solaceSdk.program.account.wallet.fetch(walletAddress);
  const getRecoveryAccount = (address: anchor.web3.PublicKey) =>
    solaceSdk.program.account.recoveryAttempt.fetch(address);
  const airdrop = async (address: anchor.web3.PublicKey) => {
    const sg = await SolaceSDK.localConnection.requestAirdrop(
      address,

      10 * LAMPORTS_PER_SOL
    );
    const confirmation = await SolaceSDK.localConnection.confirmTransaction(sg);
  };

  let solaceSdk: SolaceSDK;
  let USDC: TokenMint;

  // Create a USDC Mint
  const createMint = async () => {
    USDC = await TokenMint.init(SolaceSDK.localConnection, usdcOwner);
    console.log("USDC Mint created", USDC.token.toString());
  };

  before(async () => {
    owner = Keypair.generate();
    seedBase = Keypair.generate();
    signer = Keypair.generate();
    guardian1 = Keypair.generate();
    guardian2 = Keypair.generate();
    newOwner = Keypair.generate();
    relayPair = Keypair.generate();
    usdcOwner = KeyPair.generate();
    await Promise.all([
      airdrop(signer.publicKey),
      airdrop(relayPair.publicKey),
      airdrop(newOwner.publicKey),
      airdrop(usdcOwner.publicKey),
      airdrop(guardian1.publicKey),
    ]);
    await createMint();
    // Configure the client to use the local cluster.
  });

  it("should create a solace wallet", async () => {
    solaceSdk = new SolaceSDK({
      owner: signer,
      network: "local",
      programAddress: PROGRAM_ADDRESS,
    });
    const tx = await solaceSdk.createFromName(walletName, relayPair.publicKey);
    const res = await relayTransaction(
      tx,
      relayPair,
      SolaceSDK.localConnection
    );
    await SolaceSDK.localConnection.confirmTransaction(res);
    walletAddress = solaceSdk.wallet;
  });

  it("should mint USDC to the smart contract wallet", async () => {
    const tokenAccount = await USDC.getAssociatedTokenAccount(solaceSdk.wallet);
    const tokenAccountInfo = await solaceSdk.getTokenAccountInfo(USDC.token);
    assert(tokenAccountInfo === null);
    const tx = await solaceSdk.createTokenAccount(
      { tokenAccount, tokenMint: USDC.token },
      relayPair.publicKey
    );
    const sig1 = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig1);
    const res = await USDC.mintInto(tokenAccount, 10000000);
    await SolaceSDK.localConnection.confirmTransaction(res);
  });

  it("should get all token accounts owned by the wallet", async () => {
    const tokenAccounts =
      await solaceSdk.provider.connection.getTokenAccountsByOwner(
        solaceSdk.wallet,
        {
          programId: TOKEN_PROGRAM_ID,
        }
      );
    console.log(tokenAccounts);
  });

  it("should request for guardianship and be auto-approved", async () => {
    const tx = await solaceSdk.addGuardian(
      guardian1.publicKey,
      relayPair.publicKey
    );
    const sig = await relayTransaction(
      tx,
      relayPair,
      SolaceSDK.localConnection
    );
    await SolaceSDK.localConnection.confirmTransaction(sig);
    let wallet = await getWallet();
    assert(wallet.owner.equals(signer.publicKey), "Wallet not owned by owner");
    await airdrop(guardian1.publicKey);

    // it can be auto - approved because it is in incubation mode.
    const guardianInfo = await SolaceSDK.getWalletGuardianInfo({
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: solaceSdk.program.programId.toString(),
      network: "local",
    });
    assert(guardianInfo.approvedGuardians[0].equals(guardian1.publicKey));
    solaceSdk.fetchWalletData();
    // await solaceSdk.createWalletToRequestRecovery(newOwner, walletAddress);
    // wallet = await getWallet();
    // assert(wallet.recoveryMode, "The wallet should be in recovery mode");
  });

  it("should end incubation", async () => {
    const tx = await solaceSdk.endIncubation(relayPair.publicKey);
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  it("2 should send USDC to someone random", async () => {
    const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);

    const tx = await solaceSdk.requestSplTransfer(
      {
        mint: USDC.token,
        recieverTokenAccount: recieverTA,
        reciever: newOwner.publicKey,
        amount: 1,
      },
      relayPair.publicKey
    );
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  it("should approve & execute a guarded transfer", async () => {
    const ongoingTransfers = await solaceSdk.fetchOngoingTransfers();
    assert(ongoingTransfers.length === 1, "should have one ongoing transfer");
    console.log(
      "ongoing transfer",
      ongoingTransfers[0].guardianApprovals[0].guardian.toString()
    );
    console.log("guardian", guardian1.publicKey.toString());

    console.log({
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: PROGRAM_ADDRESS,
      guardianAddress: guardian1.publicKey.toString(),
      transferKeyAddress: ongoingTransfers[0].seedKey.toString(),
      network: "local",
    });

    const tx = await SolaceSDK.approveAndExecuteGuardedTransfer({
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: PROGRAM_ADDRESS,
      guardianAddress: guardian1.publicKey.toString(),
      transferKeyAddress: ongoingTransfers[0].seedKey.toString(),
      network: "local",
    });
    const sig = await SolaceSDK.localConnection.sendTransaction(tx, [
      guardian1,
    ]);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
    const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
    const data = Buffer.from(info.data);
    const accountInfo = AccountLayout.decode(data);
    assert(accountInfo.amount.toString() === "1", "Amount mismatch");
  });
});
