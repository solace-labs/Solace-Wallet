import * as anchor from "../src/anchor";
import { Provider } from "@project-serum/anchor";
import { assert } from "chai";
import { Program, workspace } from "../src/anchor/src";
import { SolaceSDK } from "../src/sdk";
import { Solace } from "../src/solace/types";
import { findProgramAddressSync } from "../src/anchor/src/utils/pubkey";
import { , relayTransaction } from "../src/relayer";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;
const { BN } = anchor;

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
      1 * LAMPORTS_PER_SOL
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
    const tx = await solaceSdk.createFromName("name.solace.io");
    const res = await relayTransaction(tx, relayPair, solaceSdk.);
    walletAddress = solaceSdk.wallet;
    [walletAddress, walletBump] = findProgramAddressSync(
      [Buffer.from("SOLACE"), seedBase.publicKey.toBuffer()],
      solaceSdk.program.programId
    );
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

  it("should send 500 lamports to a random address", async () => {
    let randomWallet = anchor.web3.Keypair.generate();
    await airdrop(randomWallet.publicKey);
    await airdrop(walletAddress);

    let walletBalance = await solaceSdk.program.provider.connection.getBalance(
      randomWallet.publicKey
    );

    let beforeBalance = await solaceSdk.program.provider.connection.getBalance(
      randomWallet.publicKey
    );
    await solaceSdk.sendSol(randomWallet.publicKey, 10);
    let afterBalance = await solaceSdk.program.provider.connection.getBalance(
      randomWallet.publicKey
    );

    assert(afterBalance === beforeBalance + 10, "SOL Not transferred");
  });

  it("should remove an approved guardian", async () => {
    await solaceSdk.removeGuardian(guardian1.publicKey);
    const wallet = await getWallet();
    assert(
      wallet.approvedGuardians.length === 0,
      "The number of approved guardians should be 0"
    );
  });

  it("should add guardian and initiate wallet recovery", async () => {
    let wallet = await getWallet();
    await solaceSdk.addGuardian(guardian1.publicKey);
    assert(wallet.owner.equals(owner.publicKey), "Wallet not owned by owner");
    await airdrop(guardian1.publicKey);
    const [recoveryAddress, bump] = findProgramAddressSync(
      [
        walletAddress.toBuffer(),
        new BN(wallet.walletRecoverySequence).toBuffer("le", 8),
      ],
      solaceSdk.program.programId
    );
    await solaceSdk.createWalletToRequestRecovery(newOwner, walletAddress);
    wallet = await getWallet();
    assert(wallet.recoveryMode, "The wallet should be in recovery mode");
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
});
