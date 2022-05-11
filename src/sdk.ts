import { AnchorProvider, Program } from "@project-serum/anchor";
import { Solace } from "../target/types/solace";
import { ApiProvider } from "./api/api-provider";
import * as anchor from "@project-serum/anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { Utils } from "./utils";
const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;
const { BN } = anchor;

export class SolaceSDK {
  wallet: anchor.web3.PublicKey;
  helper: Utils;

  constructor(
    private readonly anchorProvider: AnchorProvider,
    private readonly apiProvider: ApiProvider,
    private readonly program: Program<Solace>,
    private readonly owner: anchor.web3.Keypair
  ) {
    this.helper = new Utils(anchorProvider, program);
  }

  fetchWalletData = () => this.program.account.wallet.fetch(this.wallet);

  /**
   * Create a new Solace wallet
   * @param {anchor.web3.Keypair} signer
   */
  async createWalletWithSigner(signer: anchor.web3.Keypair) {
    const seedBase = Keypair.generate();
    const [walletAddress, walletBump] = findProgramAddressSync(
      [Buffer.from("SOLACE"), seedBase.publicKey.toBuffer()],
      this.program.programId
    );
    await this.program.methods
      .createWallet(this.owner.publicKey, [], 0, walletBump)
      .accounts({
        signer: signer.publicKey,
        base: seedBase.publicKey,
        wallet: walletAddress,
        systemProgram: anchor.web3.SystemProgram,
      })
      .signers([signer])
      .rpc();
    this.wallet = walletAddress;
  }

  /**
   * Add a guardian to the wallet, signed by the owner
   * @param {anchor.web3.PublicKey} guardianPublicKey
   */
  async addGuardian(guardianPublicKey: anchor.web3.PublicKey) {
    const walletData = await this.fetchWalletData();
    await this.program.methods
      .addGuardians(
        [guardianPublicKey],
        walletData.approvedGuardians.length + 1
      )
      .accounts({
        wallet: this.wallet,
        owner: this.owner.publicKey,
      })
      .signers([this.owner])
      .rpc();
  }

  async getAllGuardianship() {}

  async approveGuardianship() {}
}
