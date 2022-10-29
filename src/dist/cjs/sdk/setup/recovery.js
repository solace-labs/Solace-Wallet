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
exports.recoverWallet = void 0;
const anchor = __importStar(require("anchor-rn"));
const bn_js_1 = require("bn.js");
const solace_1 = require("../solace");
/**
 * Create an account, just to recover an existing one
 * @param feePayer
 */
async function recoverWallet(username, feePayer) {
    const addressToRecover = solace_1.SolaceSDK.getWalletFromName(this.program.programId.toString(), username);
    this.wallet = addressToRecover;
    const walletData = await solace_1.SolaceSDK.fetchDataForWallet(addressToRecover, this.program);
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
exports.recoverWallet = recoverWallet;
