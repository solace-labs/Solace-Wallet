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

const walletName = "name.solace.io14111";

describe("recover wallet", () => {
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

  it("should initiate wallet recovery", async () => {
    let wallet = await getWallet();
    const sdk2 = new SolaceSDK({
      network: "local",
      programAddress: PROGRAM_ADDRESS,
      owner: newOwner,
    });
    const tx = await sdk2.recoverWallet(walletName, relayPair.publicKey);
    const sig = await relayTransaction(
      tx,
      relayPair,
      SolaceSDK.localConnection
    );
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  it("should accept wallet recovery and the new owner should have access to the current wallet", async () => {
    const tx = await SolaceSDK.approveRecoveryByKeypairTx(
      {
        network: "local",
        programAddress: PROGRAM_ADDRESS,
        username: walletName,
      },
      guardian1.publicKey.toString()
    );
    const sig = await SolaceSDK.localConnection.sendTransaction(tx.tx, [
      guardian1,
    ]);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    const data = await SolaceSDK.fetchDataForWallet(
      SolaceSDK.getWalletFromName(PROGRAM_ADDRESS, walletName),
      solaceSdk.program
    );
    assert(data.owner.equals(newOwner.publicKey));
  });
});
