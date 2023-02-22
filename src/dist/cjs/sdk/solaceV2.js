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
exports.SolaceV2 = exports.SoalceConfig = void 0;
const types_1 = require("../solace/types");
const anchor = __importStar(require("anchor-rn"));
const bs58_1 = __importDefault(require("bs58"));
class SoalceConfig {
}
exports.SoalceConfig = SoalceConfig;
class SolaceV2 {
    constructor(wallet, config) {
        this.wallet = wallet;
        this.signTransaction = async function (transaction, payer, noOwner) {
            const x = await anchor.getProvider().connection.getLatestBlockhash();
            const tx = new anchor.web3.Transaction({
                ...x,
                feePayer: payer,
            });
            tx.add(transaction);
            let signature;
            if (!noOwner) {
                await this.wallet.signTransaction(tx);
                // tx.partialSign(this.owner);
                signature = tx.signatures[1].signature;
            }
            return {
                signature: noOwner ? null : bs58_1.default.encode(signature),
                publicKey: noOwner ? null : this.ownerPublicKey.toString(),
                message: tx.compileMessage().serialize().toString("base64"),
                blockHash: {
                    blockhash: x.blockhash,
                    lastValidBlockHeight: x.lastValidBlockHeight,
                },
            };
        };
        const provider = new anchor.Provider(new anchor.web3.Connection(config.rpcEndpoint), new anchor.Wallet(anchor.web3.Keypair.generate()), anchor.Provider.defaultOptions());
        this.program = new anchor.Program(
        // @ts-ignore
        types_1.IDL, config.programId, provider);
        anchor.setProvider(provider);
        wallet.requestAccounts().then((accounts) => {
            this.ownerPublicKey = new anchor.web3.PublicKey(accounts[0]);
        });
    }
    async createWallet(name, feePayer) {
        const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync([Buffer.from("SOLACE"), Buffer.from(name, "utf8")], this.program.programId);
        console.log("Owner Address", this.ownerPublicKey.toString());
        const tx = this.program.transaction.createWallet(this.ownerPublicKey, // Owner
        [], // Guardian
        // 0, // Guardian Approval Threshold
        name, {
            accounts: {
                signer: this.ownerPublicKey,
                rentPayer: feePayer,
                wallet: walletAddress,
                systemProgram: anchor.web3.SystemProgram.programId,
            },
        });
        this.solaceWalletPublicKey = walletAddress;
        return await this.signTransaction(tx, feePayer);
    }
    async addGuardian(guardianPublicKey, feePayer) {
        const tx = this.program.transaction.addGuardians(guardianPublicKey, {
            accounts: {
                wallet: this.solaceWalletPublicKey,
                owner: this.ownerPublicKey,
            },
        });
        const signedTx = await this.wallet.signTransaction(tx);
        return await this.signTransaction(signedTx, feePayer);
    }
}
exports.SolaceV2 = SolaceV2;
