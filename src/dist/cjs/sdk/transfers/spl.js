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
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestSplTransfer = void 0;
const anchor = __importStar(require("anchor-rn"));
const bn_js_1 = require("bn.js");
const spl_token_1 = require("@solana/spl-token");
async function requestSplTransfer(data, feePayer) {
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
                tokenMint: data.mint,
                tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [this.owner],
        });
    };
    // Check if instant transfer can be called or not
    const incubation = await this.checkIncubation(walletState);
    if (incubation) {
        // Instant transfer
        // return await instantTransfer();
        return {
            transaction: await this.signTransaction(await instantTransfer(), feePayer),
            isGuarded: false,
        };
    }
    else {
        // Check if trusted
        if (await this.isPubkeyTrusted(walletState, data.recieverTokenAccount)) {
            // Instant transfer
            return {
                transaction: await this.signTransaction(await instantTransfer(), feePayer),
                isGuarded: false,
            };
        }
        else {
            return {
                transaction: await this.signTransaction(await guardedTransfer(), feePayer),
                isGuarded: true,
            };
        }
    }
}
exports.requestSplTransfer = requestSplTransfer;
