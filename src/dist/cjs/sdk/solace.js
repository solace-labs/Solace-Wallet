"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolaceSDK = exports.KeyPair = exports.PublicKey = void 0;
const anchor = __importStar(require("anchor-rn"));
const idl_json_1 = __importDefault(require("../solace/idl.json"));
const spl_token_1 = require("@solana/spl-token");
const spl_util_1 = require("../utils/spl-util");
const transfers_1 = require("./transfers");
const sol_1 = require("./transfers/sol");
const spl_1 = require("./transfers/spl");
const incubation_1 = require("./setup/incubation");
const guardian_1 = require("./setup/guardian");
const helper_1 = require("./helper");
const create_1 = require("./setup/create");
const recovery_1 = require("./setup/recovery");
const { web3, Provider, Wallet, setProvider, Program } = anchor;
exports.PublicKey = anchor.web3.PublicKey;
exports.KeyPair = anchor.web3.Keypair;
// The SDK to interface with the client
class SolaceSDK {
    /**
     * Create a wallet instance. Should be used in conjuncture with an initializer
     * @param {SolaceSDKData} data
     */
    constructor(data) {
        this.tokenAccounts = new Array();
        this.createFromName = create_1.createFromName.bind(this);
        this.getTokenAccount = helper_1.getTokenAccount.bind(this);
        this.getAnyAssociatedTokenAccount = helper_1.getAnyAssociatedTokenAccount.bind(this);
        this.getPDAAssociatedTokenAccount = helper_1.getPDAAssociatedTokenAccount.bind(this);
        this.getTokenAccountInfo = helper_1.getTokenAccountInfo.bind(this);
        this.signTransaction = helper_1.signTransaction.bind(this);
        this.fetchGuardianData = guardian_1.fetchGuardianData.bind(this);
        this.isPubkeyTrusted = helper_1.isPubkeyTrusted.bind(this);
        this.addGuardian = guardian_1.addGuardian.bind(this);
        this.removeGuardian = guardian_1.removeGuardian.bind(this);
        this.setGuardianThreshold = guardian_1.setGuardianThreshold.bind(this);
        this.createTokenAccount = helper_1.createTokenAccount.bind(this);
        this.getTransferAddress = helper_1.getTransferAddress.bind(this);
        this.requestSolTransfer = sol_1.requestSolTransfer.bind(this);
        this.requestSolTransferByName = sol_1.requestSolTransferByName.bind(this);
        this.requestSplTransfer = spl_1.requestSplTransfer.bind(this);
        this.fetchOngoingTransfers = transfers_1.fetchOngoingTransfers.bind(this);
        this.endIncubation = incubation_1.endIncubation.bind(this);
        this.checkIncubation = incubation_1.checkIncubation.bind(this);
        this.addTrustedPubkey = helper_1.addTrustedPubkey.bind(this);
        /**
         * Create a token account for a given mint.
         */
        this.createAnyTokenAccount = (baseAddress, tokenAccount, mint, feePayer) => {
            const transaction = new anchor.web3.Transaction().add((0, spl_token_1.createAssociatedTokenAccountInstruction)(feePayer, tokenAccount, baseAddress, mint, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
            return this.signTransaction(transaction, feePayer, true);
        };
        /**
         * Fetch the wallet data for the current wallet
         */
        this.fetchWalletData = () => {
            if (!this.wallet)
                throw "Wallet not found. Please initialize the SDK with one of the given initializers, before using";
            return SolaceSDK.fetchDataForWallet(this.wallet, this.program);
        };
        /** Helper to confirm transactions */
        this.confirmTx = (tx) => this.program.provider.connection.confirmTransaction(tx);
        this.recoverWallet = recovery_1.recoverWallet.bind(this);
        const provider = new Provider(data.network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new Wallet(data.owner), Provider.defaultOptions());
        setProvider(provider);
        this.provider = provider;
        const programId = new anchor.web3.PublicKey(data.programAddress);
        // @ts-ignore
        this.program = new Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        this.owner = data.owner;
    }
    /// Generate a new key pair
    static newKeyPair() {
        return anchor.web3.Keypair.generate();
    }
    static fromSeed(seed, data) {
        const sdk = new this({
            ...data,
        });
        sdk.seed = new anchor.web3.PublicKey(seed);
        return this;
    }
    static getWalletFromName(programAddress, name) {
        const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("SOLACE"), Buffer.from(name, "utf8")], new anchor.web3.PublicKey(programAddress));
        return walletAddress;
    }
    static async getWalletFromNameAsync(programAddress, name) {
        const [walletAddress, _] = await anchor.web3.PublicKey.findProgramAddress([Buffer.from("SOLACE"), Buffer.from(name, "utf8")], new anchor.web3.PublicKey(programAddress));
        return walletAddress;
    }
    static async getAccountInfo(buffer) {
        const data = Buffer.from(buffer);
        const accountInfo = spl_token_1.AccountLayout.decode(data);
        return accountInfo;
    }
    /// Fetch the ongoing transfers of any wallet
    static async fetchOngoingTransfers(walletName, network, programAddress) {
        const provider = new anchor.Provider(network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new anchor.Wallet(exports.KeyPair.generate()), anchor.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(programAddress);
        const program = new anchor.Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const walletAddress = await SolaceSDK.getWalletFromNameAsync(programAddress.toString(), walletName);
        const walletData = await SolaceSDK.fetchDataForWallet(walletAddress, program);
        const promises = [];
        for (const transfer of walletData.ongoingTransfers) {
            promises.push(program.account.guardedTransfer.fetch(transfer));
        }
        const transfers = await Promise.all(promises);
        return transfers.map((transfer) => {
            var _a;
            return ({
                mint: transfer.tokenMint,
                amount: transfer.amount.toNumber(),
                reciever: transfer.to,
                seedKey: transfer.random,
                isSplTransfer: false,
                threshold: transfer.threshold,
                totalApprovals: transfer.approvals.filter((a) => a).length,
                senderTokenAccount: transfer.fromTokenAccount,
                guardianApprovals: (_a = transfer.approvers) === null || _a === void 0 ? void 0 : _a.map((g, i) => ({
                    guardian: g,
                    isApproved: transfer.approvals[i],
                })),
            });
        });
    }
    /**
     *
     * @param {string} name UserName of the user, which was initialized while creating the wallet
     * @param {SolaceSDKData} data Wallet meta data
     * @returns {SolaceSDK} instance of the sdk
     * Should be used only on users who have already created wallets. Features will fail if the user
     * has not created a wallet under this name, but is trying to retrieve it
     */
    static async retrieveFromName(name, data) {
        const sdk = new this(data);
        sdk.wallet = SolaceSDK.getWalletFromName(data.programAddress, name);
        return sdk;
    }
    /**
     * Checks if the given wallet address is in recovery mode
     * @param wallet The wallet to be checked
     * @returns
     */
    async isInRecovery(wallet) {
        return (await SolaceSDK.fetchDataForWallet(wallet, this.program))
            .recoveryMode;
    }
    /**
     * Check if a token account is valid. Should use try-catch around this method to check for the same.
     * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
     */
    checkTokenAccount(tokenAccount) {
        return (0, spl_util_1.checkAccountExist)(this.provider.connection, tokenAccount);
    }
}
exports.SolaceSDK = SolaceSDK;
SolaceSDK.localConnection = new anchor.web3.Connection("http://127.0.0.1:8899");
SolaceSDK.testnetConnection = new anchor.web3.Connection("https://api.testnet.solana.com");
/**
 * Fetch the state of any other given wallet
 */
SolaceSDK.fetchDataForWallet = (wallet, program) => program.account.wallet.fetch(wallet);
