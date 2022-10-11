import { Solace } from "../solace/types";
import * as anchor from "anchor-rn";
import IDL from "../solace/idl.json";
import { AccountLayout } from "@solana/spl-token";
import { checkAccountExist } from "../utils/spl-util";
import { fetchOngoingTransfers } from "./transfers";
import { requestSolTransfer } from "./transfers/sol";
import { requestSplTransfer } from "./transfers/spl";
import { checkIncubation, endIncubation } from "./setup/incubation";
import {
  addGuardian,
  removeGuardian,
  setGuardianThreshold,
} from "./setup/guardian";
import {
  addTrustedPubkey,
  createTokenAccount,
  getAnyAssociatedTokenAccount,
  getPDAAssociatedTokenAccount,
  getTokenAccount,
  getTokenAccountInfo,
  getTransferAddress,
  isPubkeyTrusted,
  signTransaction,
} from "./helper";
import { createFromName } from "./setup/create";
import { recoverWallet } from "./setup/recovery";
import { SolaceSDKData, SolaceTokenAccount } from "./types";

const { web3, Provider, Wallet, setProvider, Program } = anchor;

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

  createFromName: typeof createFromName = createFromName.bind(this);

  getTokenAccount: typeof getTokenAccount = getTokenAccount.bind(this);
  getAnyAssociatedTokenAccount: typeof getAnyAssociatedTokenAccount =
    getAnyAssociatedTokenAccount.bind(this);
  getPDAAssociatedTokenAccount: typeof getPDAAssociatedTokenAccount =
    getPDAAssociatedTokenAccount.bind(this);
  getTokenAccountInfo: typeof getTokenAccountInfo =
    getTokenAccountInfo.bind(this);
  signTransaction: typeof signTransaction = signTransaction.bind(this);

  isPubkeyTrusted: typeof isPubkeyTrusted = isPubkeyTrusted.bind(this);
  addGuardian: typeof addGuardian = addGuardian.bind(this);
  removeGuardian: typeof removeGuardian = removeGuardian.bind(this);
  setGuardianThreshold: typeof setGuardianThreshold =
    setGuardianThreshold.bind(this);

  createTokenAccount: typeof createTokenAccount = createTokenAccount.bind(this);
  getTransferAddress: typeof getTransferAddress = getTransferAddress.bind(this);
  requestSolTransfer: typeof requestSolTransfer = requestSolTransfer.bind(this);
  requestSplTransfer: typeof requestSolTransfer = requestSplTransfer.bind(this);
  fetchOngoingTransfers: typeof fetchOngoingTransfers =
    fetchOngoingTransfers.bind(this);
  endIncubation: typeof endIncubation = endIncubation.bind(this);
  checkIncubation: typeof checkIncubation = checkIncubation.bind(this);
  addTrustedPubkey: typeof addTrustedPubkey = addTrustedPubkey.bind(this);
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
   * Checks if the given wallet address is in recovery mode
   * @param wallet The wallet to be checked
   * @returns
   */
  async isInRecovery(wallet: anchor.web3.PublicKey): Promise<boolean> {
    return (await SolaceSDK.fetchDataForWallet(wallet, this.program))
      .recoveryMode as boolean;
  }

  recoverWallet: typeof recoverWallet = recoverWallet.bind(this);

  /**
   * Check if a token account is valid. Should use try-catch around this method to check for the same.
   * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
   */
  checkTokenAccount(tokenAccount: anchor.web3.PublicKey) {
    return checkAccountExist(this.provider.connection, tokenAccount);
  }
}
