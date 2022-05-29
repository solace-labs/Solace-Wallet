import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { assert } from "chai";
import SolaceIdl from "../target/idl/solace.json";
import { SolaceSDK } from "../src/sdk";
import { ApiProvider } from "../src/api";
import { Solace } from "../src/solace/types";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;
const { BN } = anchor;

describe("solace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.local());

  const program = anchor.workspace.Solace as Program<Solace>;
  // const program = new Program(SolaceIdl, this.programId) as Program<Solace>;
  let owner: anchor.web3.Keypair;
  let signer: anchor.web3.Keypair;
  let seedBase: anchor.web3.Keypair;
  let walletAddress: anchor.web3.PublicKey;
  let walletBump: number;

  let guardian1: anchor.web3.Keypair;
  let guardian2: anchor.web3.Keypair;
  let newOwner: anchor.web3.Keypair;

  const getWallet = () => program.account.wallet.fetch(walletAddress);
  const getRecoveryAccount = (address: anchor.web3.PublicKey) =>
    program.account.recoveryAttempt.fetch(address);
  const airdrop = async (address: anchor.web3.PublicKey) => {
    const sg = await program.provider.connection.requestAirdrop(
      address,
      1 * LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(sg);
  };

  let solaceSdk: SolaceSDK;

  before(async () => {
    owner = Keypair.generate();
    seedBase = Keypair.generate();
    signer = Keypair.generate();
    guardian1 = Keypair.generate();
    guardian2 = Keypair.generate();
    newOwner = Keypair.generate();
    [walletAddress, walletBump] = findProgramAddressSync(
      [Buffer.from("SOLACE"), seedBase.publicKey.toBuffer()],
      program.programId
    );
    const sg = await program.provider.connection.requestAirdrop(
      signer.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(sg);
    solaceSdk = new SolaceSDK({
      apiProvider: new ApiProvider("http://localhost:3000"),
      program,
      owner,
    });
  });

  it("should create a solace wallet", async () => {
    await solaceSdk.createWalletWithName(signer, "name.solace.io");
    walletAddress = solaceSdk.wallet;
  });

  it("should add a guardian", async () => {
    await solaceSdk.addGuardian(guardian1.publicKey);
    const wallet = await solaceSdk.fetchWalletData();
    assert(
      wallet.approvedGuardians.length === 1,
      "The number of approved guardians should be 1"
    );
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
      program.programId
    );
    await solaceSdk.createWalletToRequestRecovery(newOwner, walletAddress);
    wallet = await getWallet();
    assert(wallet.recoveryMode, "The wallet should be in recovery mode");
  });

  it("guardian should approve the recovery, and the wallet should be recovered to the new owner", async () => {
    let sdk2 = new SolaceSDK({
      apiProvider: new ApiProvider(""),
      owner: guardian1,
      program,
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
