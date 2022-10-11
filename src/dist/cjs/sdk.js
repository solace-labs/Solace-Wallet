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
const bn_js_1 = require("bn.js");
const idl_json_1 = __importDefault(require("./solace/idl.json"));
const bs58_1 = __importDefault(require("bs58"));
const spl_token_1 = require("@solana/spl-token");
const spl_util_1 = require("./utils/spl-util");
const { web3, Provider, Wallet, setProvider, getProvider, Program } = anchor;
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
    /**
     * Get the associated token account for the current wallet instance
     */
    async getTokenAccount(mint) {
        var _a;
        let tokenAccount = (_a = this.tokenAccounts.find((x) => x.mint.equals(mint))) === null || _a === void 0 ? void 0 : _a.tokenAccount;
        if (!tokenAccount) {
            tokenAccount = await (0, spl_token_1.getAssociatedTokenAddress)(mint, this.wallet, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
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
    async getAnyAssociatedTokenAccount(mint, owner) {
        return await (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
    }
    /**
     * Get the PDA associated token account of any public key and mint
     *
     */
    async getPDAAssociatedTokenAccount(mint, owner) {
        return await (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
    }
    /**
     * Get the token account info if available, otherwise return null
     * Caches token accounts for quicker access
     */
    async getTokenAccountInfo(mint) {
        const tokenAccount = await this.getTokenAccount(mint);
        const info = await this.provider.connection.getAccountInfo(tokenAccount);
        if (!info) {
            return null;
        }
        const data = Buffer.from(info.data);
        const accountInfo = spl_token_1.AccountLayout.decode(data);
        return accountInfo;
    }
    async signTransaction(transaction, payer, noOwner) {
        const x = await getProvider().connection.getLatestBlockhash();
        const tx = new anchor.web3.Transaction({
            ...x,
            feePayer: payer,
        });
        tx.add(transaction);
        let signature;
        if (!noOwner) {
            tx.partialSign(this.owner);
            signature = tx.signatures[1].signature;
        }
        return {
            signature: noOwner ? null : bs58_1.default.encode(signature),
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
    static async getAccountInfo(buffer) {
        const data = Buffer.from(buffer);
        const accountInfo = spl_token_1.AccountLayout.decode(data);
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
    static async retrieveFromName(name, data) {
        const sdk = new this(data);
        sdk.wallet = SolaceSDK.getWalletFromName(data.programAddress, name);
        return sdk;
    }
    /**
     * @param data {RequestWalletInformationData} data required to init the program and fetch guardian info
     * Static helper method to get only the guardian information of a particular wallet, given the address of the wallet. This method is helpful to know if a particular guardian is guarding any addresses. The data obtained by this function is on-chain and un-modifiable without program calls
     *
     */
    static async getWalletGuardianInfo(data) {
        const provider = new Provider(data.network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new Wallet(exports.KeyPair.generate()), Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const wallet = await program.account.wallet.fetch(new exports.PublicKey(data.solaceWalletAddress));
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
    async createFromName(name, feePayer) {
        const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("SOLACE"), Buffer.from(name, "utf8")], this.program.programId);
        console.log("Owner Address", this.owner.publicKey.toString());
        const tx = this.program.transaction.createWallet(this.owner.publicKey, // Owner
        [], // Guardian
        0, // Guardian Approval Threshold
        name, {
            accounts: {
                signer: this.owner.publicKey,
                rentPayer: feePayer,
                wallet: walletAddress,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        });
        this.wallet = walletAddress;
        return this.signTransaction(tx, feePayer);
    }
    /**
     * Check if the wallet is in incubation mode or not
     *
     */
    async checkIncubation(data) {
        const incubationEnd = new Date(data.createdAt.toNumber());
        incubationEnd.setHours(incubationEnd.getHours() + 12);
        const now = new Date().getTime() / 1000;
        if (now < incubationEnd.getTime()) {
            return data.incubationMode;
        }
        return false;
    }
    /**
     * Check if the given pubkey is trusted or not
     */
    async isPubkeyTrusted(data, pubkey) {
        return data.trustedPubkeys.includes(pubkey);
    }
    /**
     * Should send some amount of SOL to the `toAddress`
     */
    async sendSol(toAddress, lamports, feePayer) {
        const walletState = await this.fetchWalletData();
        // Check if instant transfer can be called or not
        const incubation = await this.checkIncubation(walletState);
        if (incubation) {
            // Instant transfer
        }
        else {
            // Check if trusted
            if (this.isPubkeyTrusted(walletState, toAddress)) {
                // Instant transfer
            }
        }
        // const tx = this.program.transaction.sendSol([new BN(lamports)], {
        //   accounts: {
        //     toAccount: toAddress,
        //     wallet: this.wallet,
        //     owner: this.owner.publicKey,
        //   },
        //   signers: [this.owner],
        // });
        // return this.signTransaction(tx, feePayer);
    }
    /**
     * Add a guardian to the wallet, signed by the owner
     * @param {anchor.web3.PublicKey} guardianPublicKey
     */
    async addGuardian(guardianPublicKey, payer) {
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
    static approveGuardianshipTx(data) {
        const provider = new Provider(data.network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new Wallet(exports.KeyPair.generate()), Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        return program.transaction.approveGuardianship({
            accounts: {
                wallet: new exports.PublicKey(data.solaceWalletAddress),
            },
        });
        // In this case, the owner is assumed to be the guardian
    }
    /**
     * FOR - User to remove a guardian
     */
    async removeGuardian(guardianAdress, payer) {
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
    async isInRecovery(wallet) {
        return (await SolaceSDK.fetchDataForWallet(wallet, this.program))
            .recoveryMode;
    }
    /**
     * Approve recovery with a solace wallet
     * @param data
     * @param guardianAddress
     * @returns
     */
    static async approveRecoveryByKeypairTx(data, guardianAddress) {
        const provider = new Provider(data.network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new Wallet(exports.KeyPair.generate()), Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const walletToRecover = SolaceSDK.getWalletFromName(data.programAddress, data.username);
        try {
            const walletData = await SolaceSDK.fetchDataForWallet(walletToRecover, program);
            const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync([
                walletToRecover.toBuffer(),
                // new BN(walletData.walletRecoverySequence).toBuffer("le", 8),
                new bn_js_1.BN(walletData.walletRecoverySequence).toArrayLike(Buffer, "le", 8),
            ], program.programId);
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
        }
        catch (e) {
            throw e;
        }
    }
    /**
     * Create an account, just to recover an existing one
     * @param data
     * @param feePayer
     */
    async recoverWallet(username, feePayer) {
        const addressToRecover = SolaceSDK.getWalletFromName(this.program.programId.toString(), username);
        this.wallet = addressToRecover;
        const walletData = await SolaceSDK.fetchDataForWallet(addressToRecover, this.program);
        if (!walletData) {
            throw "Invalid solace wallet address";
        }
        const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync([
            addressToRecover.toBuffer(),
            new bn_js_1.BN(walletData.walletRecoverySequence).toArrayLike(Buffer, "le", 8),
        ], this.program.programId);
        const tx = this.program.transaction.initiateWalletRecovery(this.owner.publicKey, {
            accounts: {
                wallet: addressToRecover,
                recovery: recoveryAddress,
                proposer: this.owner.publicKey,
                systemProgram: anchor.web3.SystemProgram.programId,
                rentPayer: feePayer,
            },
        });
        return this.signTransaction(tx, feePayer);
    }
    /**
     * Check if a token account is valid. Should use try-catch around this method to check for the same.
     * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
     */
    checkTokenAccount(tokenAccount) {
        return (0, spl_util_1.checkAccountExist)(this.provider.connection, tokenAccount);
    }
    /**
     * Create a token account for a given mint. Only create if it doesn't already exists
     */
    async createTokenAccount(data, feePayer) {
        const transaction = new anchor.web3.Transaction().add((0, spl_token_1.createAssociatedTokenAccountInstruction)(feePayer, data.tokenAccount, this.wallet, data.tokenMint, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
        const tx = await this.signTransaction(transaction, feePayer, true);
        return tx;
    }
    async getTransferAddress(random) {
        return anchor.web3.PublicKey.findProgramAddress([this.wallet.toBytes(), random.toBytes()], this.program.programId);
    }
    async requestSplTransfer(data, feePayer) {
        const walletState = await this.fetchWalletData();
        const guardedTransfer = async () => {
            const random = anchor.web3.Keypair.generate().publicKey;
            const transferAccount = (await this.getTransferAddress(random))[0];
            return this.program.transaction.requestGuardedSplTransfer({
                toBase: data.reciever,
                to: data.recieverTokenAccount,
                mint: data.mint,
                fromTokenAccount: await this.getTokenAccount(data.mint),
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                random: random,
                amount: new bn_js_1.BN(data.amount),
            }, {
                accounts: {
                    wallet: this.wallet,
                    owner: this.owner.publicKey,
                    rentPayer: feePayer,
                    transfer: transferAccount,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
            });
        };
        const instantTransfer = async () => {
            return this.program.transaction.requestInstantSplTransfer(new bn_js_1.BN(data.amount), {
                accounts: {
                    wallet: this.wallet,
                    owner: this.owner.publicKey,
                    tokenAccount: await this.getTokenAccount(data.mint),
                    recieverAccount: data.recieverTokenAccount,
                    recieverBase: data.reciever,
                    tokenMint: data.mint,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
            });
        };
        // Check if instant transfer can be called or not
        const incubation = await this.checkIncubation(walletState);
        console.log({ incubation });
        if (incubation) {
            // Instant transfer
            return this.signTransaction(await instantTransfer(), feePayer);
        }
        else {
            // Check if trusted
            if (await this.isPubkeyTrusted(walletState, data.recieverTokenAccount)) {
                // Instant transfer
                return this.signTransaction(await instantTransfer(), feePayer);
            }
            else {
                return this.signTransaction(await guardedTransfer(), feePayer);
            }
        }
    }
    /**
     *
     * Fetch any ongoing transfer and populate the data for the same
     */
    async fetchOngoingTransfers() {
        const walletData = await this.fetchWalletData();
        const promises = [];
        for (const transfer of walletData.ongoingTransfers) {
            promises.push(this.program.account.guardedTransfer.fetch(transfer));
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
                senderTokenAccount: transfer.fromTokenAccount,
                guardianApprovals: (_a = transfer.approvers) === null || _a === void 0 ? void 0 : _a.map((g, i) => ({
                    guardian: g,
                    isApproved: transfer.approvals[i],
                })),
            });
        });
    }
    /// Approve a guarded transfer
    static async approveGuardedTransfer(data) {
        const provider = new Provider(data.network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new Wallet(exports.KeyPair.generate()), Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const wallet = new anchor.web3.PublicKey(data.solaceWalletAddress);
        const transferSeed = new anchor.web3.PublicKey(data.transferKeyAddress);
        const [transferAddress, __] = await anchor.web3.PublicKey.findProgramAddress([wallet.toBytes(), transferSeed.toBytes()], program.programId);
        const tx = program.transaction.approveTransfer({
            accounts: {
                wallet,
                transfer: transferAddress,
                guardian: new anchor.web3.PublicKey(data.guardianAddress),
            },
        });
        return tx;
    }
    static async approveAndExecuteGuardedTransfer(data) {
        const provider = new Provider(data.network == "local"
            ? SolaceSDK.localConnection
            : SolaceSDK.testnetConnection, new Wallet(exports.KeyPair.generate()), Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const wallet = new anchor.web3.PublicKey(data.solaceWalletAddress);
        const transferSeed = new anchor.web3.PublicKey(data.transferKeyAddress);
        const [transferAddress, __] = await anchor.web3.PublicKey.findProgramAddress([wallet.toBytes(), transferSeed.toBytes()], program.programId);
        const transferData = await program.account.guardedTransfer.fetch(transferAddress);
        const tx = program.transaction.approveAndExecuteSplTransfer(transferSeed, {
            accounts: {
                wallet,
                tokenMint: transferData.tokenMint,
                transfer: transferAddress,
                guardian: new anchor.web3.PublicKey(data.guardianAddress),
                tokenAccount: transferData.fromTokenAccount,
                recieverBase: transferData.toBase,
                recieverAccount: transferData.to,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        });
        return tx;
    }
    endIncubation(feePayer) {
        const tx = this.program.transaction.endIncubation({
            accounts: {
                wallet: this.wallet,
                owner: this.owner.publicKey,
            },
        });
        return this.signTransaction(tx, feePayer);
    }
    addTrustedPubkey(pubkey, feePayer) {
        const tx = this.program.transaction.addTrustedPubkey(pubkey, {
            accounts: {
                wallet: this.wallet,
                owner: this.owner.publicKey,
            },
        });
        return this.signTransaction(tx, feePayer);
    }
}
exports.SolaceSDK = SolaceSDK;
SolaceSDK.localConnection = new anchor.web3.Connection("http://127.0.0.1:8899");
SolaceSDK.testnetConnection = new anchor.web3.Connection("https://api.testnet.solana.com");
/**
 * Fetch the state of any other given wallet
 */
SolaceSDK.fetchDataForWallet = (wallet, program) => program.account.wallet.fetch(wallet);
