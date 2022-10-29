"use strict";
/// For Guardian
/// Approve a Guarded Transfer without executing it
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
exports.SolaceApprovals = void 0;
const anchor_rn_1 = require("anchor-rn");
const anchor = __importStar(require("anchor-rn"));
const solace_1 = require("../solace");
const spl_token_1 = require("@solana/spl-token");
const idl_json_1 = __importDefault(require("../../solace/idl.json"));
class SolaceApprovals {
    /// Will throw an error if the transfer data is incorrect or alreayd executed
    static async approveGuardedTransfer(data) {
        const provider = new anchor_rn_1.Provider(data.network == "local"
            ? solace_1.SolaceSDK.localConnection
            : solace_1.SolaceSDK.testnetConnection, new anchor_rn_1.Wallet(solace_1.KeyPair.generate()), anchor_rn_1.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new anchor_rn_1.Program(
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
    /// For Guardian
    /// Approve a specific transfer as a Guardian and execute it
    /// Throws an error if the transfer data is incorrect or transfer is already executed
    static async approveAndExecuteGuardedTransfer(data) {
        const provider = new anchor_rn_1.Provider(data.network == "local"
            ? solace_1.SolaceSDK.localConnection
            : solace_1.SolaceSDK.testnetConnection, new anchor_rn_1.Wallet(solace_1.KeyPair.generate()), anchor_rn_1.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new anchor_rn_1.Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const wallet = new anchor.web3.PublicKey(data.solaceWalletAddress);
        const transferSeed = new anchor.web3.PublicKey(data.transferKeyAddress);
        const [transferAddress, __] = await anchor.web3.PublicKey.findProgramAddress([wallet.toBytes(), transferSeed.toBytes()], program.programId);
        const transferData = await program.account.guardedTransfer.fetch(transferAddress);
        if (transferData.isSplTransfer) {
            const tx = program.transaction.approveAndExecuteSplTransfer(transferSeed, {
                accounts: {
                    wallet,
                    tokenMint: transferData.tokenMint,
                    transfer: transferAddress,
                    guardian: new anchor.web3.PublicKey(data.guardianAddress),
                    tokenAccount: transferData.fromTokenAccount,
                    recieverAccount: transferData.to,
                    tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
            });
            return tx;
        }
        else {
            const tx = program.transaction.approveAndExecuteSolTransfer({
                accounts: {
                    wallet,
                    transfer: transferAddress,
                    guardian: new anchor.web3.PublicKey(data.guardianAddress),
                    toAccount: transferData.to,
                    systemProgram: anchor.web3.SystemProgram.programId,
                },
            });
            return tx;
        }
    }
}
exports.SolaceApprovals = SolaceApprovals;
