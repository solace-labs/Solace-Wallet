import { Program } from "@project-serum/anchor";
import { Solace } from "./solace/types";
import * as anchor from "./anchor";
import { findProgramAddressSync } from "@project-serum/anchor/dist/cjs/utils/pubkey";
import { BN } from "bn.js";
import IDL from "./solace/idl.json";
const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

interface SolaceSDKData {
  owner: anchor.web3.Keypair;
  network: "local" | "testnet";
}

// The SDK to interface with the client
export class SolaceSDK {
  static localConnection = new anchor.web3.Connection("http://127.0.0.1:8899");
  static testnetConnection = new anchor.web3.Connection(
    "https://api.testnet.solana.com"
  );
  wallet: anchor.web3.PublicKey;
  owner: anchor.web3.Keypair;
  program: Program<Solace>;
  seed: anchor.web3.PublicKey;

  static newKeyPair() {
    return anchor.web3.Keypair.generate();
  }

  static fromSeed(seed: string, data: SolaceSDKData) {
    const sdk = new this({
      ...data,
    });
    sdk.seed = new anchor.web3.PublicKey(seed);
    return this;
  }

  constructor(data: SolaceSDKData) {
    anchor.setProvider(
      new anchor.Provider(
        data.network == "local"
          ? SolaceSDK.localConnection
          : SolaceSDK.testnetConnection,
        new anchor.Wallet(data.owner),
        anchor.Provider.defaultOptions()
      )
    );
    this.program = anchor.workspace.Solace as Program<Solace>;
    const programId = new anchor.web3.PublicKey(
      "8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U"
    );
    this.program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      anchor.getProvider()
    );
    this.owner = data.owner;
  }

  fetchWalletData = () => this.fetchDataForWallet(this.wallet);
  fetchDataForWallet = (wallet: anchor.web3.PublicKey) =>
    this.program.account.wallet.fetch(wallet);
  confirmTx = (tx) => this.program.provider.connection.confirmTransaction(tx);

  /**
   * Create a new Solace wallet
   * @param {anchor.web3.Keypair} signer
   */
  async createWalletWithName(
    signer: anchor.web3.Keypair,
    name: string,
    requestAirdrop: boolean
  ) {
    const seedBase = Keypair.generate();
    const [walletAddress, walletBump] = findProgramAddressSync(
      [Buffer.from("SOLACE"), seedBase.publicKey.toBuffer()],
      this.program.programId
    );

    // await this.apiProvider.requestAirdrop(this.owner.publicKey);
    if (requestAirdrop) {
      await this.program.provider.connection.confirmTransaction(
        await this.program.provider.connection.requestAirdrop(
          this.owner.publicKey,
          1 * LAMPORTS_PER_SOL
        )
      );
    }

    console.log("Owner Address", this.owner.publicKey.toString());

    const tx = await this.program.rpc.createWallet(
      this.owner.publicKey,
      [],
      0,
      {
        accounts: {
          signer: this.owner.publicKey,
          base: seedBase.publicKey,
          wallet: walletAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [this.owner],
      }
    );
    this.wallet = walletAddress;
    // Instead of confirming transaction here, send it via an API
    // this.program.provider.connection.sendTransaction
    await this.confirmTx(tx);
  }

  /**
   * Should send some amount of SOL to the `toAddress`
   */
  async sendSol(toAddress: anchor.web3.PublicKey, lamports: number) {
    await this.program.rpc.sendSol(new anchor.BN(lamports), {
      accounts: {
        toAccount: toAddress,
        wallet: this.wallet,
        owner: this.owner.publicKey,
      },
      signers: [this.owner],
    });
  }

  /**
   * Add a guardian to the wallet, signed by the owner
   * @param {anchor.web3.PublicKey} guardianPublicKey
   */
  async addGuardian(
    guardianPublicKey: anchor.web3.PublicKey
  ): Promise<boolean> {
    try {
      const walletData = await this.fetchWalletData();
      const tx = await this.program.rpc.addGuardians(
        [guardianPublicKey],
        walletData.approvedGuardians.length + 1,
        {
          accounts: {
            wallet: this.wallet,
            owner: this.owner.publicKey,
          },
          signers: [this.owner],
        }
      );

      await this.confirmTx(tx);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * FOR - User to remove a guardian
   */
  async removeGuardian(
    guardianAdress: anchor.web3.PublicKey
  ): Promise<boolean> {
    try {
      const tx = await this.program.rpc.removeGuardians({
        accounts: {
          wallet: this.wallet,
          guardian: guardianAdress,
          owner: this.owner.publicKey,
        },
        signers: [this.owner],
      });
      await this.confirmTx(tx);
      // await this.apiProvider.removeGuardian(this.wallet, guardianAdress);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Checks if the given wallet address is in recovery mode
   * @param wallet The wallet to be checked
   * @returns
   */
  async isInRecovery(wallet: anchor.web3.PublicKey): Promise<boolean> {
    return (await this.fetchDataForWallet(wallet)).recoveryMode as boolean;
  }

  /**
   * Approve recovery with a solace wallet
   * @param addressToRecover
   * @returns
   */
  async approveRecoveryByKeypair(addressToRecover: anchor.web3.PublicKey) {
    try {
      const walletData = await this.fetchDataForWallet(addressToRecover);
      const [recoveryAddress, bump] = findProgramAddressSync(
        [
          addressToRecover.toBuffer(),
          new BN(walletData.walletRecoverySequence).toBuffer("le", 8),
        ],
        this.program.programId
      );
      const tx = await this.program.rpc.approveRecoveryByKeypair({
        accounts: {
          walletToRecover: addressToRecover,
          guardian: this.owner.publicKey,
          recoveryAttempt: recoveryAddress,
        },
        signers: [this.owner],
      });
      await this.confirmTx(tx);
      return recoveryAddress;
    } catch (e) {
      return false;
    }
  }

  /**
   * Create an account, just to recover an existing one
   * @param newOwner
   * @param addressToRecovery
   */
  async createWalletToRequestRecovery(
    newOwner: anchor.web3.Keypair,
    addressToRecover: anchor.web3.PublicKey
  ) {
    // await this.apiProvider.requestAirdrop(newOwner.publicKey);
    await this.program.provider.connection.confirmTransaction(
      await this.program.provider.connection.requestAirdrop(
        newOwner.publicKey,
        1 * LAMPORTS_PER_SOL
      )
    );
    const walletData = await this.fetchDataForWallet(addressToRecover);
    const [recoveryAddress, bump] = findProgramAddressSync(
      [
        addressToRecover.toBuffer(),
        new BN(walletData.walletRecoverySequence).toBuffer("le", 8),
      ],
      this.program.programId
    );
    const tx = await this.program.rpc.initiateWalletRecovery(
      newOwner.publicKey,
      {
        accounts: {
          wallet: addressToRecover,
          recovery: recoveryAddress,
          proposer: newOwner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [newOwner],
      }
    );
    await this.confirmTx(tx);
  }
}
