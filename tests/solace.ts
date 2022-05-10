import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { assert } from "chai";
import { Solace } from "../target/types/solace";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

describe("solace", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Solace as Program<Solace>;
  let owner: anchor.web3.Keypair;
  let signer: anchor.web3.Keypair;
  let seedBase: anchor.web3.Keypair;
  let walletAddress: anchor.web3.PublicKey;
  let walletBump: number;

  let guardian1: anchor.web3.Keypair;
  let guardian2: anchor.web3.Keypair;

  const getWallet = () => program.account.wallet.fetch(walletAddress);

  before(async () => {
    owner = Keypair.generate();
    seedBase = Keypair.generate();
    signer = Keypair.generate();
    guardian1 = Keypair.generate();
    guardian2 = Keypair.generate();
    [walletAddress, walletBump] = findProgramAddressSync(
      [Buffer.from("SOLACE"), seedBase.publicKey.toBuffer()],
      program.programId
    );
    const sg = await program.provider.connection.requestAirdrop(
      signer.publicKey,
      10 * LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(sg);
  });

  it("should create a solace wallet", async () => {
    await program.methods
      .createWallet(owner.publicKey, [], 0, walletBump)
      .accounts({
        signer: signer.publicKey,
        base: seedBase.publicKey,
        wallet: walletAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([signer])
      .rpc();
  });

  it("should add a guardian", async () => {
    await program.methods
      .addGuardians([guardian1.publicKey, guardian2.publicKey], 2)
      .accounts({
        wallet: walletAddress,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();
    const wallet = await getWallet();
    assert(wallet.pendingGuardians.length === 2);
  });

  it("should approve a guardian", async () => {
    await program.methods
      .approveGuardian()
      .accounts({
        wallet: walletAddress,
        guardian: guardian1.publicKey,
      })
      .signers([guardian1])
      .rpc();
    const wallet = await getWallet();
    assert(wallet.pendingGuardians.length === 1);
    assert(wallet.approvedGuardians.length === 1);
  });

  it("should remove a pending guardian", async () => {
    await program.methods
      .removeGuardians()
      .accounts({
        wallet: walletAddress,
        guardian: guardian2.publicKey,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();
    const wallet = await getWallet();
    assert(wallet.pendingGuardians.length === 0);
    assert(wallet.approvedGuardians.length === 1);
  });

  it("should remove an approved guardian", async () => {
    await program.methods
      .removeGuardians()
      .accounts({
        wallet: walletAddress,
        guardian: guardian1.publicKey,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();
    const wallet = await getWallet();
    assert(wallet.pendingGuardians.length === 0);
    assert(wallet.approvedGuardians.length === 0);
  });
});
