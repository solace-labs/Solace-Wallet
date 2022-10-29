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
exports.SolaceGuardian = exports.setGuardianThreshold = exports.removeGuardian = exports.addGuardian = exports.fetchGuardianData = void 0;
const anchor = __importStar(require("anchor-rn"));
const solace_1 = require("../solace");
const bn_js_1 = __importDefault(require("bn.js"));
const idl_json_1 = __importDefault(require("../../solace/idl.json"));
const solace_2 = require("../solace");
async function fetchGuardianData() {
    const walletData = await this.fetchWalletData();
    const pendingGuardianData = [];
    walletData.pendingGuardians.forEach((guardian, i) => {
        pendingGuardianData.push({
            guardian,
            time: walletData.pendingGuardiansApprovalFrom[i].toNumber(),
        });
    });
    const removingGuardianData = [];
    walletData.guardiansToRemove.forEach((guardian, i) => {
        removingGuardianData.push({
            guardian,
            time: walletData.guardiansToRemoveFrom[i].toNumber(),
        });
    });
    return {
        approvedGuardians: walletData.approvedGuardians,
        pendingGuardianData,
        removingGuardianData,
    };
}
exports.fetchGuardianData = fetchGuardianData;
/**
 * Add a guardian to the wallet, signed by the owner
 * @param {anchor.web3.PublicKey} guardianPublicKey
 */
async function addGuardian(guardianPublicKey, payer) {
    const tx = this.program.transaction.addGuardians(guardianPublicKey, {
        accounts: {
            wallet: this.wallet,
            owner: this.owner.publicKey,
        },
        signers: [this.owner],
    });
    return await this.signTransaction(tx, payer);
}
exports.addGuardian = addGuardian;
/**
 * FOR - User to remove a guardian
 */
async function removeGuardian(guardianAdress, payer) {
    const tx = this.program.transaction.requestRemoveGuardian(guardianAdress, {
        accounts: {
            wallet: this.wallet,
            owner: this.owner.publicKey,
        },
        signers: [this.owner],
    });
    return await this.signTransaction(tx, payer);
}
exports.removeGuardian = removeGuardian;
/**
 * For user
 * Set the guardian threshold
 * The guardian threshold should be lesser than the total number of guardians
 */
async function setGuardianThreshold(threshold, feePayer) {
    const tx = this.program.transaction.setGuardianThreshold(threshold, {
        accounts: {
            wallet: this.wallet,
            owner: this.owner.publicKey,
        },
        signers: [this.owner],
    });
    return this.signTransaction(tx, feePayer);
}
exports.setGuardianThreshold = setGuardianThreshold;
class SolaceGuardian {
    /**
     * Approve recovery with a solace wallet
     * @param data
     * @param guardianAddress
     * @returns
     */
    static async approveRecoveryByKeypairTx(data, guardianAddress) {
        const provider = new anchor.Provider(data.network == "local"
            ? solace_1.SolaceSDK.localConnection
            : solace_1.SolaceSDK.testnetConnection, new anchor.Wallet(solace_2.KeyPair.generate()), anchor.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new anchor.Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const walletToRecover = solace_1.SolaceSDK.getWalletFromName(data.programAddress, data.username);
        try {
            const walletData = await solace_1.SolaceSDK.fetchDataForWallet(walletToRecover, program);
            const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync([
                walletToRecover.toBuffer(),
                // new BN(walletData.walletRecoverySequence).toBuffer("le", 8),
                new bn_js_1.default(walletData.walletRecoverySequence).toArrayLike(Buffer, "le", 8),
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
     * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet after the wait time has passed
     * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
     */
    static approveGuardianshipTx(data) {
        const provider = new anchor.Provider(data.network == "local"
            ? solace_1.SolaceSDK.localConnection
            : solace_1.SolaceSDK.testnetConnection, new anchor.Wallet(solace_2.KeyPair.generate()), anchor.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new anchor.Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        return program.transaction.approveGuardianship({
            accounts: {
                wallet: new anchor.web3.PublicKey(data.solaceWalletAddress),
            },
        });
        // In this case, the owner is assumed to be the guardian
    }
    /**
     * @param data {RequestWalletInformationData} data required to init the program and fetch guardian info
     * Static helper method to get only the guardian information of a particular wallet, given the address of the wallet. This method is helpful to know if a particular guardian is guarding any addresses. The data obtained by this function is on-chain and un-modifiable without program calls
     *
     */
    static async getWalletGuardianInfo(data) {
        const provider = new anchor.Provider(data.network == "local"
            ? solace_1.SolaceSDK.localConnection
            : solace_1.SolaceSDK.testnetConnection, new anchor.Wallet(solace_2.KeyPair.generate()), anchor.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new anchor.Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const wallet = await program.account.wallet.fetch(new anchor.web3.PublicKey(data.solaceWalletAddress));
        if (!wallet) {
            throw "Invalid solace wallet address. The SDK could not find a Solace wallet with the given address, on the selected connection cluster";
        }
        return {
            pendingGuardians: wallet.pendingGuardians,
            approvedGuardians: wallet.approvedGuardians,
        };
    }
    static async confirmRemoval(data) {
        const provider = new anchor.Provider(data.network == "local"
            ? solace_1.SolaceSDK.localConnection
            : solace_1.SolaceSDK.testnetConnection, new anchor.Wallet(solace_2.KeyPair.generate()), anchor.Provider.defaultOptions());
        const programId = new anchor.web3.PublicKey(data.programAddress);
        const program = new anchor.Program(
        // @ts-ignore
        idl_json_1.default, programId, provider);
        const wallet = await program.account.wallet.fetch(new anchor.web3.PublicKey(data.solaceWalletAddress));
        if (!wallet) {
            throw "Invalid solace wallet address. The SDK could not find a Solace wallet with the given address, on the selected connection cluster";
        }
        return program.instruction.confirmGuardianRemoval(new anchor.web3.PublicKey(data.guardianAddress), {
            accounts: {
                wallet: new anchor.web3.PublicKey(data.solaceWalletAddress),
            },
        });
    }
}
exports.SolaceGuardian = SolaceGuardian;
