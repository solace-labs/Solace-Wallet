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
exports.createTokenAccount = exports.isPubkeyTrusted = exports.getTransferAddress = exports.addTrustedPubkey = exports.signTransaction = exports.getTokenAccountInfo = exports.getPDAAssociatedTokenAccount = exports.getAnyAssociatedTokenAccount = exports.getTokenAccount = void 0;
const spl_token_1 = require("@solana/spl-token");
const anchor = __importStar(require("anchor-rn"));
const bs58_1 = __importDefault(require("bs58"));
/**
 * Get the associated token account for the current wallet instance
 */
async function getTokenAccount(mint) {
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
exports.getTokenAccount = getTokenAccount;
/**
 * Get the associated token account of any public key and mint
 *
 */
async function getAnyAssociatedTokenAccount(mint, owner) {
    return await (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, false, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
}
exports.getAnyAssociatedTokenAccount = getAnyAssociatedTokenAccount;
/**
 * Get the PDA associated token account of any public key and mint
 *
 */
async function getPDAAssociatedTokenAccount(mint, owner) {
    return await (0, spl_token_1.getAssociatedTokenAddress)(mint, owner, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
}
exports.getPDAAssociatedTokenAccount = getPDAAssociatedTokenAccount;
/**
 * Get the token account info if available, otherwise return null
 * Caches token accounts for quicker access
 */
async function getTokenAccountInfo(mint) {
    const tokenAccount = await this.getTokenAccount(mint);
    const info = await this.provider.connection.getAccountInfo(tokenAccount);
    if (!info) {
        return null;
    }
    const data = Buffer.from(info.data);
    const accountInfo = spl_token_1.AccountLayout.decode(data);
    return accountInfo;
}
exports.getTokenAccountInfo = getTokenAccountInfo;
async function signTransaction(transaction, payer, noOwner) {
    const x = await anchor.getProvider().connection.getLatestBlockhash();
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
exports.signTransaction = signTransaction;
/**
 * For User
 * Add a trusted pubkey to the smart wallet
 */
async function addTrustedPubkey(pubkey, feePayer) {
    const tx = this.program.transaction.addTrustedPubkey(pubkey, {
        accounts: {
            wallet: this.wallet,
            owner: this.owner.publicKey,
        },
    });
    return this.signTransaction(tx, feePayer);
}
exports.addTrustedPubkey = addTrustedPubkey;
async function getTransferAddress(random) {
    return anchor.web3.PublicKey.findProgramAddress([this.wallet.toBytes(), random.toBytes()], this.program.programId);
}
exports.getTransferAddress = getTransferAddress;
/**
 * Check if the given pubkey is trusted or not
 */
async function isPubkeyTrusted(data, pubkey) {
    return data.trustedPubkeys.includes(pubkey);
}
exports.isPubkeyTrusted = isPubkeyTrusted;
/**
 * Create a token account for a given mint. Only create if it doesn't already exists
 */
async function createTokenAccount(data, feePayer) {
    const transaction = new anchor.web3.Transaction().add((0, spl_token_1.createAssociatedTokenAccountInstruction)(feePayer, data.tokenAccount, this.wallet, data.tokenMint, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID));
    const tx = await this.signTransaction(transaction, feePayer, true);
    return tx;
}
exports.createTokenAccount = createTokenAccount;
