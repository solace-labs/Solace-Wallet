import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { assert } from "chai";
import { Solace } from "../target/types/solace";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;
const { BN } = anchor;

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
  const airdrop = async (address: anchor.web3.PublicKey) => {
    const sg = await program.provider.connection.requestAirdrop(
      address,
      1 * LAMPORTS_PER_SOL
    );
    await program.provider.connection.confirmTransaction(sg);
  };

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
      .addGuardians([guardian1.publicKey, guardian2.publicKey], 1)
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

  it("should add and approve guardian", async () => {
    await program.methods
      .addGuardians([guardian1.publicKey, guardian2.publicKey], 1)
      .accounts({
        wallet: walletAddress,
        owner: owner.publicKey,
      })
      .signers([owner])
      .rpc();
    await program.methods
      .approveGuardian()
      .accounts({
        wallet: walletAddress,
        guardian: guardian1.publicKey,
      })
      .signers([guardian1])
      .rpc();
  });

  it("should initiate wallet recovery and recover wallet", async () => {
    let wallet = await getWallet();
    assert(wallet.owner.equals(owner.publicKey), "Wallet not owned by owner");
    await airdrop(guardian1.publicKey);
    const newOwner = Keypair.generate();
    const [recoveryAddress, bump] = findProgramAddressSync(
      [
        walletAddress.toBuffer(),
        new BN(wallet.walletRecoverySequence).toBuffer("le", 8),
      ],
      program.programId
    );
    await program.methods
      .initiateWalletRecovery(newOwner.publicKey, bump)
      .accounts({
        wallet: walletAddress,
        recovery: recoveryAddress,
        guardian: guardian1.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([guardian1])
      .rpc();
    wallet = await getWallet();
    assert(wallet.owner.equals(newOwner.publicKey), "Wallet owner unchanged");
  });
});
