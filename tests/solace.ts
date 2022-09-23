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

const PROGRAM_ADDRESS = "8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U";

describe("solace", () => {
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
      // airdrop(signer.publicKey),
      airdrop(relayPair.publicKey),
      airdrop(newOwner.publicKey),
      airdrop(usdcOwner.publicKey),
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
    const tx = await solaceSdk.createFromName(
      "name.solace.io",
      relayPair.publicKey
    );
    const res = await relayTransaction(
      tx,
      relayPair,
      SolaceSDK.localConnection
    );
    await SolaceSDK.localConnection.confirmTransaction(res);
    walletAddress = solaceSdk.wallet;
  });

  // it("should fetch an existing wallet, and should have the same addr", async () => {
  //   const _sdk = SolaceSDK.retrieveFromName("name.solace.io", {
  //     programAddress: PROGRAM_ADDRESS,
  //     owner,
  //     network: "local",
  //   });
  //   assert((await _sdk).wallet.equals(solaceSdk.wallet));
  // });
  //
  // it("should fetch an existing wallet, and should not have the same addr", async () => {
  //   const _sdk = SolaceSDK.retrieveFromName("random.solace.io", {
  //     programAddress: PROGRAM_ADDRESS,
  //     owner,
  //     network: "local",
  //   });
  //   assert(!(await _sdk).wallet.equals(solaceSdk.wallet));
  // });
  //

  // //99
  //

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

  // it("should send USDC to someone random", async () => {
  //   const recieverTA = await USDC.createAssociatedTokenAccount(
  //     newOwner.publicKey
  //   );
  //
  //   const tx = await solaceSdk.requestSplTransfer(
  //     {
  //       mint: USDC.token,
  //       recieverTokenAccount: recieverTA,
  //       reciever: newOwner.publicKey,
  //       amount: 101,
  //     },
  //     relayPair.publicKey
  //   );
  //   const sig = await relayTransaction(tx, relayPair);
  //   await SolaceSDK.localConnection.confirmTransaction(sig);
  //   const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
  //   const data = Buffer.from(info.data);
  //   const accountInfo = AccountLayout.decode(data);
  //   assert(accountInfo.amount.toString() === "101");
  // });

  it("should end incubation", async () => {
    const tx = await solaceSdk.endIncubation(relayPair.publicKey);
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  // it("should initate a non-incubated SPL transfer - without guardians", async () => {
  //   const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
  //
  //   const tx = await solaceSdk.requestSplTransfer(
  //     {
  //       mint: USDC.token,
  //       recieverTokenAccount: recieverTA,
  //       reciever: newOwner.publicKey,
  //       amount: 101,
  //     },
  //     relayPair.publicKey
  //   );
  //   const sig = await relayTransaction(tx, relayPair);
  //   await SolaceSDK.localConnection.confirmTransaction(sig);
  //
  //   const walletData = await solaceSdk.fetchWalletData();
  //   assert(
  //     walletData.ongoingTransfer.isComplete,
  //     "Ongoing transfer should be complete"
  //   );
  //   const info = await SolaceSDK.localConnection.getAccountInfo(
  //     walletData.ongoingTransfer.to
  //   );
  //   const data = Buffer.from(info.data);
  //   const accountInfo = AccountLayout.decode(data);
  //   assert(accountInfo.amount.toString() === "202", "Amount mismatch");
  // });

  it("should request for guardianship and be auto-approved", async () => {
    let wallet = await getWallet();
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
    assert(wallet.owner.equals(signer.publicKey), "Wallet not owned by owner");
    await airdrop(guardian1.publicKey);
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

  // it("should initiate a non-incubated SPL transfer - with guardians", async () => {
  //   const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
  //
  //   const tx = await solaceSdk.requestSplTransfer(
  //     {
  //       mint: USDC.token,
  //       recieverTokenAccount: recieverTA,
  //       reciever: newOwner.publicKey,
  //       amount: 101,
  //     },
  //     relayPair.publicKey
  //   );
  //   const sig = await relayTransaction(tx, relayPair);
  //   await SolaceSDK.localConnection.confirmTransaction(sig);
  //
  //   const walletData = await solaceSdk.fetchWalletData();
  //   assert(
  //     !walletData.ongoingTransfer.isComplete,
  //     "Ongoing transfer should not be complete"
  //   );
  // });

  // it("should approve transfer from guardian and USDC should be transferred", async () => {
  //   const tx = await SolaceSDK.approveSplTransfer({
  //     guardianAddress: guardian1.publicKey.toString(),
  //     solaceWalletAddress: solaceSdk.wallet.toString(),
  //     programAddress: solaceSdk.program.programId.toString(),
  //     network: "local",
  //   });
  //   const sig = await solaceSdk.program.provider.connection.sendTransaction(
  //     tx,
  //     [guardian1]
  //   );
  //   await SolaceSDK.localConnection.confirmTransaction(sig);
  //   const walletData = await solaceSdk.fetchWalletData();
  //   assert(
  //     walletData.ongoingTransfer.isComplete,
  //     "Ongoing transfer should be complete"
  //   );
  //   const info = await SolaceSDK.localConnection.getAccountInfo(
  //     walletData.ongoingTransfer.to
  //   );
  //   const data = Buffer.from(info.data);
  //   const accountInfo = AccountLayout.decode(data);
  //   assert(accountInfo.amount.toString() === "303", "Amount mismatch");
  // });

  it("should add a trusted pubkey", async () => {
    const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
    const tx = await solaceSdk.addTrustedPubkey(
      recieverTA,
      relayPair.publicKey
    );
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  // it("should transfer USDC being non-incubation - with guardians - to a trusted pubkey", async () => {
  //   const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
  //
  //   const tx = await solaceSdk.requestSplTransfer(
  //     {
  //       mint: USDC.token,
  //       recieverTokenAccount: recieverTA,
  //       reciever: newOwner.publicKey,
  //       amount: 101,
  //     },
  //     relayPair.publicKey
  //   );
  //   const sig = await relayTransaction(tx, relayPair);
  //   await SolaceSDK.localConnection.confirmTransaction(sig);
  //   const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
  //   const data = Buffer.from(info.data);
  //   const accountInfo = AccountLayout.decode(data);
  //   assert(accountInfo.amount.toString() === "404");
  // });

  it("should initiate wallet recovery", async () => {
    let wallet = await getWallet();
    const sdk2 = new SolaceSDK({
      network: "local",
      programAddress: PROGRAM_ADDRESS,
      owner: newOwner,
    });
    const tx = await sdk2.recoverWallet("name.solace.io", relayPair.publicKey);
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
        username: "name.solace.io",
      },
      guardian1.publicKey.toString()
    );
    const sig = await SolaceSDK.localConnection.sendTransaction(tx.tx, [
      guardian1,
    ]);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    const data = await SolaceSDK.fetchDataForWallet(
      SolaceSDK.getWalletFromName(PROGRAM_ADDRESS, "name.solace.io"),
      solaceSdk.program
    );
    assert(data.owner.equals(newOwner.publicKey));
  });

  // // it("should accept the request for guardianship", async () => {
  // //   let wallet = await solaceSdk.fetchWalletData();
  // //   assert(wallet.approvedGuardians.length === 0);
  // //   assert(wallet.pendingGuardians.length === 1);
  // //   assert(wallet.pendingGuardians[0].equals(guardian1.publicKey));
  // //   const tx = SolaceSDK.approveGuardianshipTx({
  // //     guardianAddress: guardian1.publicKey.toString(),
  // //     solaceWalletAddress: solaceSdk.wallet.toString(),
  // //     programAddress: solaceSdk.program.programId.toString(),
  // //     network: "local",
  // //   });
  // //   const confs = await solaceSdk.program.provider.connection.sendTransaction(
  // //     tx,
  // //     [guardian1]
  // //   );
  // //   await solaceSdk.program.provider.connection.confirmTransaction(confs);
  // //   wallet = await solaceSdk.fetchWalletData();
  // //   assert(wallet.approvedGuardians.length === 1);
  // //   assert(wallet.pendingGuardians.length === 0);
  // //   assert(wallet.approvedGuardians[0].equals(guardian1.publicKey));
  // // });

  /**

  it("should remove an approved guardian", async () => {
    await solaceSdk.removeGuardian(guardian1.publicKey, relayPair.publicKey);
    const wallet = await getWallet();
    assert(
      wallet.approvedGuardians.length === 0,
      "The number of approved guardians should be 0"
    );
  });

  it("guardian should approve the recovery, and the wallet should be recovered to the new owner", async () => {
    let sdk2 = new SolaceSDK({
      owner: guardian1,
      network: "local",
      programAddress: "8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U",
    });
    let wallet = await getWallet();
    await sdk2.approveRecoveryByKeypair(walletAddress);
    wallet = await getWallet();
    assert(
      wallet.owner.toString() === newOwner.publicKey.toString(),
      "The owner of the wallet should be the new owner"
    );
  });
  */
});
