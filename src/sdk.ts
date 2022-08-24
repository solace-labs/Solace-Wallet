import { Program } from "@project-serum/anchor";
import { Solace } from "./solace/types";
import * as anchor from "./anchor";
import { findProgramAddressSync } from "./anchor/dist/cjs/utils/pubkey";
import { BN } from "bn.js";
import IDL from "./solace/idl.json";
import { RelayerIxData } from "./relayer";
import * as bs58 from "bs58";
const { LAMPORTS_PER_SOL } = anchor.web3;

interface ApproveGuardianshipData {
  network: "local" | "testnet";
  programAddress: string;
  solaceWalletAddress: string;
  guardianAddress: string;
}

interface SolaceSDKData {
  owner: anchor.web3.Keypair;
  network: "local" | "testnet";
  programAddress: string;
}

export const PublicKey = anchor.web3.PublicKey;
export const KeyPair = anchor.web3.Keypair;

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
  provider: anchor.Provider;

  /**
   * Create a wallet instance. Should be used in conjuncture with an initializer
   * @param {SolaceSDKData} data
   */
  constructor(data: SolaceSDKData) {
    const provider = new anchor.Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new anchor.Wallet(data.owner),
      anchor.Provider.defaultOptions()
    );
    anchor.setProvider(provider);
    this.provider = provider;
    const programId = new anchor.web3.PublicKey(data.programAddress);
    this.program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    this.owner = data.owner;
  }

  async signTransaction(
    transaction: anchor.web3.Transaction,
    payer: anchor.web3.PublicKey
  ): Promise<RelayerIxData> {
    const x = await anchor.getProvider().connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      ...x,
      feePayer: payer,
    });
    tx.add(transaction);
    tx.partialSign(this.owner);
    const signature = tx.signatures[1].signature;
    return {
      signature: bs58.encode(signature),
      publicKey: this.owner.publicKey.toString(),
      message: tx.compileMessage().serialize().toString("base64"),
      blockHash: {
        blockhash: x.blockhash,
        lastValidBlockHeight: x.lastValidBlockHeight,
      },
    };
  }

  /// Generate a new key pair
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

  /**
   *
   * @param {string} name UserName of the user, which was initialized while creating the wallet
   * @param {SolaceSDKData} data Wallet meta data
   * @returns {SolaceSDK} instance of the sdk
   * Should be used only on users who have already created wallets. Features will fail if the user
   * has not created a wallet under this name, but is trying to retrieve it
   */
  static async retrieveFromName(
    name: string,
    data: SolaceSDKData
  ): Promise<SolaceSDK> {
    const [walletAddress, _] = findProgramAddressSync(
      [Buffer.from("SOLACE"), Buffer.from(name, "utf8")],
      new anchor.web3.PublicKey(data.programAddress)
    );
    const sdk = new this(data);
    sdk.wallet = walletAddress;
    return sdk;
  }

  /**
   * Create a wallet for the first time
   * @param {string} name Name of the user
   * @returns {Promise<RelayerIxData>} return the transaction that can be relayed
   */
  async createFromName(
    name: string,
    feePayer: anchor.web3.PublicKey
  ): Promise<RelayerIxData> {
    const [walletAddress, _] = findProgramAddressSync(
      [Buffer.from("SOLACE"), Buffer.from(name, "utf8")],
      this.program.programId
    );

    console.log("Owner Address", this.owner.publicKey.toString());

    const tx = this.program.transaction.createWallet(
      this.owner.publicKey, // Owner
      [], // Guardian
      0, // Guardian Approval Threshold
      name,
      {
        accounts: {
          signer: this.owner.publicKey,
          wallet: walletAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );
    this.wallet = walletAddress;
    return this.signTransaction(tx, feePayer);
  }

  /**
   * Return the wallet state for the user's wallet, if any
   * @returns {Solace}
   */
  fetchWalletData = () => {
    if (!this.wallet)
      throw "Wallet not found. Please initialize the SDK with one of the given initializers, before using";
    return this.fetchDataForWallet(this.wallet);
  };

  /**
   * Fetch the state of any other given wallet
   * @param {anchor.web3.PublicKey} wallet
   * @returns {Solace}
   */
  fetchDataForWallet = (wallet: anchor.web3.PublicKey) =>
    this.program.account.wallet.fetch(wallet);
  confirmTx = (tx) => this.program.provider.connection.confirmTransaction(tx);

  /**
   * Should send some amount of SOL to the `toAddress`
   */
  async sendSol(
    toAddress: anchor.web3.PublicKey,
    lamports: number,
    feePayer: anchor.web3.PublicKey
  ) {
    const tx = this.program.transaction.sendSol(new anchor.BN(lamports), {
      accounts: {
        toAccount: toAddress,
        wallet: this.wallet,
        owner: this.owner.publicKey,
      },
      signers: [this.owner],
    });
    return this.signTransaction(tx, feePayer);
  }

  /**
   * Add a guardian to the wallet, signed by the owner
   * @param {anchor.web3.PublicKey} guardianPublicKey
   */
  async addGuardian(
    guardianPublicKey: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey
  ): Promise<RelayerIxData> {
    const walletData = await this.fetchWalletData();
    const tx = this.program.transaction.addGuardians(
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

    return await this.signTransaction(tx, payer);
  }

  /**
   * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet
   * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
   */
  static approveGuardianshipTx(
    data: ApproveGuardianshipData
  ): anchor.web3.Transaction {
    const provider = new anchor.Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new anchor.Wallet(KeyPair.generate()),
      anchor.Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    return program.transaction.approveGuardianship({
      accounts: {
        wallet: new PublicKey(data.solaceWalletAddress),
        guardian: new PublicKey(data.guardianAddress),
      },
    });
    // In this case, the owner is assumed to be the guardian
  }

  /**
   * FOR - User to remove a guardian
   */
  async removeGuardian(
    guardianAdress: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey
  ): Promise<RelayerIxData> {
    const tx = this.program.transaction.removeGuardians({
      accounts: {
        wallet: this.wallet,
        guardian: guardianAdress,
        owner: this.owner.publicKey,
      },
      signers: [this.owner],
    });
    return await this.signTransaction(tx, payer);
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
   * @param addressToRecover
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
