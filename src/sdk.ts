import { Solace } from "./solace/types";
import * as anchor from "anchor-rn";
import { BN } from "bn.js";
import IDL from "./solace/idl.json";
import { RelayerIxData, relayTransaction } from "./relayer";
import bs58 from "bs58";
import {
  AccountLayout,
  RawAccount,
  TOKEN_PROGRAM_ID,
  createTransferInstruction,
  createAssociatedTokenAccount,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { checkAccountExist } from "./utils/spl-util";

const { web3, Provider, Wallet, setProvider, getProvider, Program } = anchor;

type SendSPLTokenData = {
  mint: anchor.web3.PublicKey;
  recieverTokenAccount: anchor.web3.PublicKey;
  reciever: anchor.web3.PublicKey;
  amount: number;
};

type SolaceTokenAccount = {
  mint: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
};

type RecoverWalletData = {
  network: "local" | "testnet";
  programAddress: string;
  username: string;
};

type RequestWalletInformationData = {
  network: "local" | "testnet";
  programAddress: string;
  solaceWalletAddress: string;
};

type ApproveGuardianshipData = {
  network: "local" | "testnet";
  programAddress: string;
  solaceWalletAddress: string;
  guardianAddress: string;
};

type SolaceSDKData = {
  owner: anchor.web3.Keypair;
  network: "local" | "testnet";
  programAddress: string;
};

type ATAData = {
  tokenMint: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
};

export const PublicKey = anchor.web3.PublicKey;
export const KeyPair = anchor.web3.Keypair;

// The SDK to interface with the client
export class SolaceSDK {
  static localConnection = new anchor.web3.Connection("http://127.0.0.1:8899");
  static testnetConnection = new anchor.web3.Connection(
    "https://api.testnet.solana.com"
  );
  tokenAccounts: SolaceTokenAccount[] = new Array<SolaceTokenAccount>();
  wallet: anchor.web3.PublicKey;
  owner: anchor.web3.Keypair;
  program: anchor.Program<Solace>;
  seed: anchor.web3.PublicKey;
  provider: anchor.Provider;

  /**
   * Create a wallet instance. Should be used in conjuncture with an initializer
   * @param {SolaceSDKData} data
   */
  constructor(data: SolaceSDKData) {
    const provider = new Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new Wallet(data.owner),
      Provider.defaultOptions()
    );
    setProvider(provider);
    this.provider = provider;
    const programId = new anchor.web3.PublicKey(data.programAddress);
    // @ts-ignore
    this.program = new Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    this.owner = data.owner;
  }

  /**
   * Get the associated token account for the current wallet instance
   */
  async getTokenAccount(mint: anchor.web3.PublicKey) {
    let tokenAccount = this.tokenAccounts.find((x) =>
      x.mint.equals(mint)
    )?.tokenAccount;
    if (!tokenAccount) {
      tokenAccount = await getAssociatedTokenAddress(
        mint,
        this.wallet,
        true,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      this.tokenAccounts.push({
        mint,
        tokenAccount,
      });
    }
    return tokenAccount;
  }

  /**
   * Get the associated token account of any public key and mint
   *
   */
  async getAnyAssociatedTokenAccount(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    return await getAssociatedTokenAddress(
      mint,
      owner,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }

  /**
   * Get the PDA associated token account of any public key and mint
   *
   */
  async getPDAAssociatedTokenAccount(
    mint: anchor.web3.PublicKey,
    owner: anchor.web3.PublicKey
  ) {
    return await getAssociatedTokenAddress(
      mint,
      owner,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
  }
  /**
   * Get the token account info if available, otherwise return null
   * Caches token accounts for quicker access
   */
  async getTokenAccountInfo(mint: anchor.web3.PublicKey): Promise<RawAccount> {
    const tokenAccount = await this.getTokenAccount(mint);
    const info = await this.provider.connection.getAccountInfo(tokenAccount);
    if (!info) {
      return null;
    }
    const data = Buffer.from(info.data);
    const accountInfo = AccountLayout.decode(data);
    return accountInfo;
  }

  async signTransaction(
    transaction: anchor.web3.Transaction,
    payer: anchor.web3.PublicKey,
    noOwner?: boolean
  ): Promise<RelayerIxData> {
    const x = await getProvider().connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      ...x,
      feePayer: payer,
    });
    tx.add(transaction);
    let signature: any;
    if (!noOwner) {
      tx.partialSign(this.owner);
      signature = tx.signatures[1].signature;
    }
    return {
      signature: noOwner ? null : bs58.encode(signature),
      publicKey: noOwner ? null : this.owner.publicKey.toString(),
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

  static getWalletFromName(programAddress: string, name: string) {
    const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("SOLACE"), Buffer.from(name, "utf8")],
      new anchor.web3.PublicKey(programAddress)
    );
    return walletAddress;
  }

  static async getAccountInfo(buffer) {
    const data = Buffer.from(buffer);
    const accountInfo = AccountLayout.decode(data);
    return accountInfo;
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
    const sdk = new this(data);
    sdk.wallet = SolaceSDK.getWalletFromName(data.programAddress, name);
    return sdk;
  }

  /**
   * @param data {RequestWalletInformationData} data required to init the program and fetch guardian info
   * Static helper method to get only the guardian information of a particular wallet, given the address of the wallet. This method is helpful to know if a particular guardian is guarding any addresses. The data obtained by this function is on-chain and un-modifiable without program calls
   *
   */
  static async getWalletGuardianInfo(data: RequestWalletInformationData) {
    const provider = new Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new Wallet(KeyPair.generate()),
      Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    const wallet = await program.account.wallet.fetch(
      new PublicKey(data.solaceWalletAddress)
    );
    if (!wallet) {
      throw "Invalid solace wallet address. The SDK could not find a Solace wallet with the given address, on the selected connection cluster";
    }
    return {
      pendingGuardians: wallet.pendingGuardians,
      approvedGuardians: wallet.approvedGuardians,
    };
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
    const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
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
          rentPayer: feePayer,
          wallet: walletAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );
    this.wallet = walletAddress;
    return this.signTransaction(tx, feePayer);
  }

  /**
   * Fetch the wallet data for the current wallet
   */
  fetchWalletData = () => {
    if (!this.wallet)
      throw "Wallet not found. Please initialize the SDK with one of the given initializers, before using";
    return SolaceSDK.fetchDataForWallet(this.wallet, this.program);
  };

  /**
   * Fetch the state of any other given wallet
   */
  static fetchDataForWallet = (
    wallet: anchor.web3.PublicKey,
    program: anchor.Program<Solace>
  ) => program.account.wallet.fetch(wallet);

  /** Helper to confirm transactions */
  confirmTx = (tx) => this.program.provider.connection.confirmTransaction(tx);

  /**
   * Should send some amount of SOL to the `toAddress`
   */
  // async sendSol(
  //   toAddress: anchor.web3.PublicKey,
  //   lamports: number,
  //   feePayer: anchor.web3.PublicKey
  // ) {
  //   const tx = this.program.transaction.sendSol([new BN(lamports)], {
  //     accounts: {
  //       toAccount: toAddress,
  //       wallet: this.wallet,
  //       owner: this.owner.publicKey,
  //     },
  //     signers: [this.owner],
  //   });
  //   return this.signTransaction(tx, feePayer);
  // }

  /**
   * Add a guardian to the wallet, signed by the owner
   * @param {anchor.web3.PublicKey} guardianPublicKey
   */
  async addGuardian(
    guardianPublicKey: anchor.web3.PublicKey,
    payer: anchor.web3.PublicKey
  ): Promise<RelayerIxData> {
    const tx = this.program.transaction.addGuardians(guardianPublicKey, {
      accounts: {
        wallet: this.wallet,
        owner: this.owner.publicKey,
      },
      signers: [this.owner],
    });
    return await this.signTransaction(tx, payer);
  }

  /**
   * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet
   * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
   */
  static approveGuardianshipTx(
    data: ApproveGuardianshipData
  ): anchor.web3.Transaction {
    const provider = new Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new Wallet(KeyPair.generate()),
      Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    return program.transaction.approveGuardianship({
      accounts: {
        wallet: new PublicKey(data.solaceWalletAddress),
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
    return (await SolaceSDK.fetchDataForWallet(wallet, this.program))
      .recoveryMode as boolean;
  }

  /**
   * Approve recovery with a solace wallet
   * @param data
   * @param guardianAddress
   * @returns
   */
  static async approveRecoveryByKeypairTx(
    data: RecoverWalletData,
    guardianAddress: string
  ) {
    const provider = new Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new Wallet(KeyPair.generate()),
      Provider.defaultOptions()
    );

    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    const walletToRecover = SolaceSDK.getWalletFromName(
      data.programAddress,
      data.username
    );
    try {
      const walletData = await SolaceSDK.fetchDataForWallet(
        walletToRecover,
        program
      );
      const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          walletToRecover.toBuffer(),
          // new BN(walletData.walletRecoverySequence).toBuffer("le", 8),
          new BN(walletData.walletRecoverySequence).toArrayLike(
            Buffer,
            "le",
            8
          ),
        ],
        program.programId
      );
      const tx = program.transaction.approveRecoveryByKeypair({
        accounts: {
          walletToRecover: walletToRecover,
          guardian: new anchor.web3.PublicKey(guardianAddress),
          recoveryAttempt: recoveryAddress,
        },
      });
      return {
        tx,
        recoveryAddress,
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * Create an account, just to recover an existing one
   * @param data
   * @param feePayer
   */
  async recoverWallet(username: string, feePayer: anchor.web3.PublicKey) {
    const addressToRecover = SolaceSDK.getWalletFromName(
      this.program.programId.toString(),
      username
    );

    this.wallet = addressToRecover;

    const walletData = await SolaceSDK.fetchDataForWallet(
      addressToRecover,
      this.program
    );

    if (!walletData) {
      throw "Invalid solace wallet address";
    }

    const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        addressToRecover.toBuffer(),
        new BN(walletData.walletRecoverySequence).toArrayLike(Buffer, "le", 8),
      ],
      this.program.programId
    );

    const tx = this.program.transaction.initiateWalletRecovery(
      this.owner.publicKey,
      {
        accounts: {
          wallet: addressToRecover,
          recovery: recoveryAddress,
          proposer: this.owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
          rentPayer: feePayer,
        },
      }
    );
    return this.signTransaction(tx, feePayer);
  }

  /**
   * Check if a token account is valid. Should use try-catch around this method to check for the same.
   * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
   */
  checkTokenAccount(tokenAccount: anchor.web3.PublicKey) {
    return checkAccountExist(this.provider.connection, tokenAccount);
  }

  /**
   * Create a token account for a given mint. Only create if it doesn't already exists
   */
  async createTokenAccount(data: ATAData, feePayer: anchor.web3.PublicKey) {
    const transaction = new anchor.web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        feePayer,
        data.tokenAccount,
        this.wallet,
        data.tokenMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    );
    const tx = await this.signTransaction(transaction, feePayer, true);
    return tx;
  }

  // async requestSplTransfer(
  //   data: SendSPLTokenData,
  //   feePayer: anchor.web3.PublicKey
  // ) {
  //   const tx1 = this.program.transaction.requestTransaction(
  //     new BN(data.amount),
  //     {
  //       accounts: {
  //         owner: this.owner.publicKey,
  //         wallet: this.wallet,
  //         recieverAccount: data.recieverTokenAccount,
  //         recieverBase: data.reciever,
  //         tokenMint: data.mint,
  //         tokenAccount: await this.getTokenAccount(data.mint),
  //         tokenProgram: TOKEN_PROGRAM_ID,
  //         systemProgram: anchor.web3.SystemProgram.programId,
  //       },
  //     }
  //   );
  //   return this.signTransaction(tx1, feePayer, false);
  // }

  // async executeSplTransfer(feePayer: anchor.web3.PublicKey) {
  //   const transfer = (await this.fetchWalletData()).ongoingTransfer;
  //   const tx = this.program.transaction.executeTransfer({
  //     accounts: {
  //       wallet: this.wallet,
  //       recieverBase: transfer.toBase,
  //       recieverAccount: transfer.to,
  //       tokenMint: transfer.tokenMint,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       tokenAccount: transfer.from,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //     },
  //   });
  //   return this.signTransaction(tx, feePayer);
  // }

  // static async approveSplTransfer(
  //   data: ApproveGuardianshipData
  // ): Promise<anchor.web3.Transaction> {
  //   const provider = new Provider(
  //     data.network == "local"
  //       ? SolaceSDK.localConnection
  //       : SolaceSDK.testnetConnection,
  //     new Wallet(KeyPair.generate()),
  //     Provider.defaultOptions()
  //   );
  //   const programId = new anchor.web3.PublicKey(data.programAddress);
  //   const program = new Program<Solace>(
  //     // @ts-ignore
  //     IDL,
  //     programId,
  //     provider
  //   );
  //   const walletData = await SolaceSDK.fetchDataForWallet(
  //     new anchor.web3.PublicKey(data.solaceWalletAddress),
  //     // @ts-ignore
  //     program
  //   );
  //   if (!walletData) {
  //     throw "Solace wallet not found with the address";
  //   }
  //   const { ongoingTransfer } = walletData;
  //   return program.transaction.approveAndExecuteTransfer({
  //     accounts: {
  //       wallet: new anchor.web3.PublicKey(data.solaceWalletAddress),
  //       tokenAccount: ongoingTransfer.from,
  //       tokenProgram: TOKEN_PROGRAM_ID,
  //       tokenMint: ongoingTransfer.tokenMint,
  //       recieverAccount: ongoingTransfer.to,
  //       recieverBase: ongoingTransfer.toBase,
  //       systemProgram: anchor.web3.SystemProgram.programId,
  //       guardian: new PublicKey(data.guardianAddress),
  //     },
  //   });
  // }
  //
  endIncubation(feePayer: anchor.web3.PublicKey) {
    const tx = this.program.transaction.endIncubation({
      accounts: {
        wallet: this.wallet,
        owner: this.owner.publicKey,
      },
    });
    return this.signTransaction(tx, feePayer);
  }

  addTrustedPubkey(
    pubkey: anchor.web3.PublicKey,
    feePayer: anchor.web3.PublicKey
  ) {
    const tx = this.program.transaction.addTrustedPubkey(pubkey, {
      accounts: {
        wallet: this.wallet,
        owner: this.owner.publicKey,
      },
    });
    return this.signTransaction(tx, feePayer);
  }
}
