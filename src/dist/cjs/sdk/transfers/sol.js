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
exports.requestSolTransfer = exports.requestSolTransferByName = void 0;
const solace_1 = require("../solace");
const anchor = __importStar(require("anchor-rn"));
const bn_js_1 = require("bn.js");
async function requestSolTransferByName(recieverName, amount, feePayer) {
    const walletAddress = await solace_1.SolaceSDK.getWalletFromNameAsync(this.program.programId.toString(), recieverName);
    const walletData = await solace_1.SolaceSDK.fetchDataForWallet(walletAddress, this.program);
    console.log(walletData);
    if (!walletData) {
        throw "Wallet doesn't exist with this name";
    }
    return this.requestSolTransfer({
        reciever: walletAddress,
        amount,
    }, feePayer);
}
exports.requestSolTransferByName = requestSolTransferByName;
async function requestSolTransfer(data, feePayer) {
    const walletState = await this.fetchWalletData();
    const guardedTransfer = async () => {
        console.log("guarded SOL transfer");
        const random = anchor.web3.Keypair.generate().publicKey;
        const transfer = (await this.getTransferAddress(random))[0];
        return this.program.transaction.requestGuardedSolTransfer({
            to: data.reciever,
            random: random,
            amount: new bn_js_1.BN(data.amount),
        }, {
            accounts: {
                wallet: this.wallet,
                owner: this.owner.publicKey,
                rentPayer: this.owner.publicKey,
                transfer: transfer,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
            signers: [this.owner],
        });
    };
    const instantTransfer = async () => {
        console.log("instant SOL transfer");
        return this.program.transaction.requestInstantSolTransfer(new bn_js_1.BN(data.amount), {
            accounts: {
                wallet: this.wallet,
                owner: this.owner.publicKey,
                toAccount: data.reciever,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        });
    };
    // Check if instant transfer can be called or not
    const incubation = await this.checkIncubation(walletState);
    // return this.signTransaction(await instantTransfer(), feePayer);
    if (incubation) {
        // Instant transfer
        return {
            transaction: await this.signTransaction(await instantTransfer(), feePayer),
            isGuarded: true,
        };
    }
    else {
        // Check if trusted
        if (await this.isPubkeyTrusted(walletState, data.reciever)) {
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
exports.requestSolTransfer = requestSolTransfer;
