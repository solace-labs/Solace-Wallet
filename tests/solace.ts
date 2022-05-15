import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { assert } from "chai";
import { Solace } from "../target/types/solace";
import SolaceIdl from "../target/idl/solace.json";
import { SolaceSDK } from "../src/sdk";
import { ApiProvider } from "../src/api";

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

  const getWallet = () => program.account.wallet.fetch(walletAddress);
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
    assert(wallet.pendingGuardians.length === 1);
  });

  it("should remove a pending guardian", async () => {
    await solaceSdk.removeGuardian(guardian1.publicKey);
    const wallet = await getWallet();
    assert(wallet.approvedGuardians.length === 0);
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
    console.log(newOwner.publicKey.toString());
    console.log(newOwner.secretKey);
    await solaceSdk.createWalletToRequestRecovery(newOwner, walletAddress);
    wallet = await getWallet();
    assert(wallet.owner.equals(newOwner.publicKey), "Wallet owner unchanged");
  });

  it("should get guardian data", async () => {
    const res = await solaceSdk.getGuardianData();
    console.log(res);
  });
});
