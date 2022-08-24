import * as anchor from "../src/anchor";
import { assert } from "chai";
import { SolaceSDK } from "../src/sdk";
import { relayTransaction } from "../src/relayer";

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

  before(async () => {
    owner = Keypair.generate();
    seedBase = Keypair.generate();
    signer = Keypair.generate();
    guardian1 = Keypair.generate();
    guardian2 = Keypair.generate();
    newOwner = Keypair.generate();
    relayPair = Keypair.generate();
    await Promise.all([
      airdrop(signer.publicKey),
      airdrop(relayPair.publicKey),
    ]);
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
    walletAddress = solaceSdk.wallet;
  });

  it("should fetch an existing wallet, and should have the same addr", async () => {
    const _sdk = SolaceSDK.retrieveFromName("name.solace.io", {
      programAddress: PROGRAM_ADDRESS,
      owner,
      network: "local",
    });
    assert((await _sdk).wallet.equals(solaceSdk.wallet));
  });

  it("should fetch an existing wallet, and should not have the same addr", async () => {
    const _sdk = SolaceSDK.retrieveFromName("random.solace.io", {
      programAddress: PROGRAM_ADDRESS,
      owner,
      network: "local",
    });
    assert(!(await _sdk).wallet.equals(solaceSdk.wallet));
  });

  // it("should send 500 lamports to a random address", async () => {
  //   let randomWallet = anchor.web3.Keypair.generate();
  //   await airdrop(randomWallet.publicKey);
  //   await airdrop(walletAddress);
  //
  //   let beforeBalance = await solaceSdk.program.provider.connection.getBalance(
  //     randomWallet.publicKey
  //   );
  //
  //   const tx = await solaceSdk.sendSol(
  //     randomWallet.publicKey,
  //     10,
  //     relayPair.publicKey
  //   );
  //   await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  //   let afterBalance = await solaceSdk.program.provider.connection.getBalance(
  //     randomWallet.publicKey
  //   );
  //
  //   assert(afterBalance === beforeBalance + 10, "SOL Not transferred");
  // });

  it("should request for guardianship", async () => {
    let wallet = await getWallet();
    const tx = await solaceSdk.addGuardian(
      guardian1.publicKey,
      relayPair.publicKey
    );
    await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
    assert(wallet.owner.equals(signer.publicKey), "Wallet not owned by owner");
    await airdrop(guardian1.publicKey);
    // await solaceSdk.createWalletToRequestRecovery(newOwner, walletAddress);
    // wallet = await getWallet();
    // assert(wallet.recoveryMode, "The wallet should be in recovery mode");
  });

  it("should accept the request for guardianship", async () => {
    let wallet = await solaceSdk.fetchWalletData();
    assert(wallet.approvedGuardians.length === 0);
    assert(wallet.pendingGuardians.length === 1);
    assert(wallet.pendingGuardians[0].equals(guardian1.publicKey));
    const tx = SolaceSDK.approveGuardianshipTx({
      guardianAddress: guardian1.publicKey.toString(),
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: solaceSdk.program.programId.toString(),
      network: "local",
    });
    const confs = await solaceSdk.program.provider.connection.sendTransaction(
      tx,
      [guardian1]
    );
    await solaceSdk.program.provider.connection.confirmTransaction(confs);
    wallet = await solaceSdk.fetchWalletData();
    assert(wallet.approvedGuardians.length === 1);
    assert(wallet.pendingGuardians.length === 0);
    assert(wallet.approvedGuardians[0].equals(guardian1.publicKey));
  });

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
