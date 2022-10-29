import { Solace } from "../solace/types";
import * as anchor from "anchor-rn";
import { fetchOngoingTransfers } from "./transfers";
import { requestSolTransfer, requestSolTransferByName } from "./transfers/sol";
import { requestSplTransfer } from "./transfers/spl";
import { checkIncubation, endIncubation } from "./setup/incubation";
import { addGuardian, fetchGuardianData, removeGuardian, setGuardianThreshold } from "./setup/guardian";
import { addTrustedPubkey, createTokenAccount, getAnyAssociatedTokenAccount, getPDAAssociatedTokenAccount, getTokenAccount, getTokenAccountInfo, getTransferAddress, isPubkeyTrusted, signTransaction } from "./helper";
import { createFromName } from "./setup/create";
import { recoverWallet } from "./setup/recovery";
import { SolaceSDKData, SolaceTokenAccount } from "./types";
export declare const PublicKey: typeof anchor.web3.PublicKey;
export declare const KeyPair: typeof anchor.web3.Keypair;
export declare class SolaceSDK {
    static localConnection: anchor.web3.Connection;
    static testnetConnection: anchor.web3.Connection;
    tokenAccounts: SolaceTokenAccount[];
    wallet: anchor.web3.PublicKey;
    owner: anchor.web3.Keypair;
    program: anchor.Program<Solace>;
    seed: anchor.web3.PublicKey;
    provider: anchor.Provider;
    /**
     * Create a wallet instance. Should be used in conjuncture with an initializer
     * @param {SolaceSDKData} data
     */
    constructor(data: SolaceSDKData);
    createFromName: typeof createFromName;
    getTokenAccount: typeof getTokenAccount;
    getAnyAssociatedTokenAccount: typeof getAnyAssociatedTokenAccount;
    getPDAAssociatedTokenAccount: typeof getPDAAssociatedTokenAccount;
    getTokenAccountInfo: typeof getTokenAccountInfo;
    signTransaction: typeof signTransaction;
    fetchGuardianData: typeof fetchGuardianData;
    isPubkeyTrusted: typeof isPubkeyTrusted;
    addGuardian: typeof addGuardian;
    removeGuardian: typeof removeGuardian;
    setGuardianThreshold: typeof setGuardianThreshold;
    createTokenAccount: typeof createTokenAccount;
    getTransferAddress: typeof getTransferAddress;
    requestSolTransfer: typeof requestSolTransfer;
    requestSolTransferByName: typeof requestSolTransferByName;
    requestSplTransfer: typeof requestSplTransfer;
    fetchOngoingTransfers: typeof fetchOngoingTransfers;
    endIncubation: typeof endIncubation;
    checkIncubation: typeof checkIncubation;
    addTrustedPubkey: typeof addTrustedPubkey;
    static newKeyPair(): anchor.web3.Keypair;
    static fromSeed(seed: string, data: SolaceSDKData): typeof SolaceSDK;
    static getWalletFromName(programAddress: string, name: string): anchor.web3.PublicKey;
    static getWalletFromNameAsync(programAddress: string, name: string): Promise<anchor.web3.PublicKey>;
    static getAccountInfo(buffer: any): Promise<import("@solana/spl-token").RawAccount>;
    static fetchOngoingTransfers(walletName: string, network: "local" | "testnet", programAddress: string): Promise<{
        mint: anchor.web3.PublicKey;
        amount: number;
        reciever: anchor.web3.PublicKey;
        seedKey: anchor.web3.PublicKey;
        isSplTransfer: boolean;
        threshold: number;
        totalApprovals: number;
        senderTokenAccount: anchor.web3.PublicKey;
        guardianApprovals: {
            guardian: anchor.web3.PublicKey;
            isApproved: any;
        }[];
    }[]>;
    /**
     *
     * @param {string} name UserName of the user, which was initialized while creating the wallet
     * @param {SolaceSDKData} data Wallet meta data
     * @returns {SolaceSDK} instance of the sdk
     * Should be used only on users who have already created wallets. Features will fail if the user
     * has not created a wallet under this name, but is trying to retrieve it
     */
    static retrieveFromName(name: string, data: SolaceSDKData): Promise<SolaceSDK>;
    /**
     * Create a token account for a given mint.
     */
    createAnyTokenAccount: (baseAddress: anchor.web3.PublicKey, tokenAccount: anchor.web3.PublicKey, mint: anchor.web3.PublicKey, feePayer: anchor.web3.PublicKey) => Promise<import("../relayer").RelayerIxData>;
    /**
     * Fetch the wallet data for the current wallet
     */
    fetchWalletData: () => Promise<import("anchor-rn/dist/cjs/program/namespace/types").TypeDef<{
        name: "wallet";
        type: {
            kind: "struct";
            fields: [{
                name: "pendingGuardians";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "pendingGuardiansApprovalFrom";
                type: {
                    vec: "i64";
                };
            }, {
                name: "approvedGuardians";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "owner";
                type: "publicKey";
            }, {
                name: "name";
                type: "string";
            }, {
                name: "bump";
                type: "u8";
            }, {
                name: "recoveryMode";
                type: "bool";
            }, {
                name: "approvalThreshold";
                type: "u8";
            }, {
                name: "walletRecoverySequence";
                type: "u64";
            }, {
                name: "currentRecovery";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "guarding";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "createdAt";
                type: "i64";
            }, {
                name: "trustedPubkeys";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "pubkeyHistory";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "incubationMode";
                type: "bool";
            }, {
                name: "ongoingTransfers";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "guardiansToRemove";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "guardiansToRemoveFrom";
                type: {
                    vec: "i64";
                };
            }];
        };
    } | {
        name: "recoveryAttempt";
        type: {
            kind: "struct";
            fields: [{
                name: "bump";
                type: "u8";
            }, {
                name: "wallet";
                type: "publicKey";
            }, {
                name: "owner";
                type: "publicKey";
            }, {
                name: "proposer";
                type: "publicKey";
            }, {
                name: "newOwner";
                type: "publicKey";
            }, {
                name: "guardians";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "approvals";
                type: {
                    vec: "bool";
                };
            }, {
                name: "isExecuted";
                type: "bool";
            }];
        };
    } | {
        name: "guardedTransfer";
        type: {
            kind: "struct";
            fields: [{
                name: "isSplTransfer";
                type: "bool";
            }, {
                name: "from";
                type: "publicKey";
            }, {
                name: "to";
                type: "publicKey";
            }, {
                name: "fromTokenAccount";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "toBase";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "tokenMint";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "programId";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "amount";
                type: "u64";
            }, {
                name: "approvers";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "approvals";
                type: {
                    vec: "bool";
                };
            }, {
                name: "threshold";
                type: "u8";
            }, {
                name: "isExecutable";
                type: "bool";
            }, {
                name: "rentPayer";
                type: "publicKey";
            }, {
                name: "random";
                type: "publicKey";
            }];
        };
    }, anchor.IdlTypes<Solace>>>;
    /**
     * Fetch the state of any other given wallet
     */
    static fetchDataForWallet: (wallet: anchor.web3.PublicKey, program: anchor.Program<Solace>) => Promise<import("anchor-rn/dist/cjs/program/namespace/types").TypeDef<{
        name: "wallet";
        type: {
            kind: "struct";
            fields: [{
                name: "pendingGuardians";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "pendingGuardiansApprovalFrom";
                type: {
                    vec: "i64";
                };
            }, {
                name: "approvedGuardians";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "owner";
                type: "publicKey";
            }, {
                name: "name";
                type: "string";
            }, {
                name: "bump";
                type: "u8";
            }, {
                name: "recoveryMode";
                type: "bool";
            }, {
                name: "approvalThreshold";
                type: "u8";
            }, {
                name: "walletRecoverySequence";
                type: "u64";
            }, {
                name: "currentRecovery";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "guarding";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "createdAt";
                type: "i64";
            }, {
                name: "trustedPubkeys";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "pubkeyHistory";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "incubationMode";
                type: "bool";
            }, {
                name: "ongoingTransfers";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "guardiansToRemove";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "guardiansToRemoveFrom";
                type: {
                    vec: "i64";
                };
            }];
        };
    } | {
        name: "recoveryAttempt";
        type: {
            kind: "struct";
            fields: [{
                name: "bump";
                type: "u8";
            }, {
                name: "wallet";
                type: "publicKey";
            }, {
                name: "owner";
                type: "publicKey";
            }, {
                name: "proposer";
                type: "publicKey";
            }, {
                name: "newOwner";
                type: "publicKey";
            }, {
                name: "guardians";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "approvals";
                type: {
                    vec: "bool";
                };
            }, {
                name: "isExecuted";
                type: "bool";
            }];
        };
    } | {
        name: "guardedTransfer";
        type: {
            kind: "struct";
            fields: [{
                name: "isSplTransfer";
                type: "bool";
            }, {
                name: "from";
                type: "publicKey";
            }, {
                name: "to";
                type: "publicKey";
            }, {
                name: "fromTokenAccount";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "toBase";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "tokenMint";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "programId";
                type: {
                    option: "publicKey";
                };
            }, {
                name: "amount";
                type: "u64";
            }, {
                name: "approvers";
                type: {
                    vec: "publicKey";
                };
            }, {
                name: "approvals";
                type: {
                    vec: "bool";
                };
            }, {
                name: "threshold";
                type: "u8";
            }, {
                name: "isExecutable";
                type: "bool";
            }, {
                name: "rentPayer";
                type: "publicKey";
            }, {
                name: "random";
                type: "publicKey";
            }];
        };
    }, anchor.IdlTypes<Solace>>>;
    /** Helper to confirm transactions */
    confirmTx: (tx: any) => Promise<anchor.web3.RpcResponseAndContext<anchor.web3.SignatureResult>>;
    /**
     * Checks if the given wallet address is in recovery mode
     * @param wallet The wallet to be checked
     * @returns
     */
    isInRecovery(wallet: anchor.web3.PublicKey): Promise<boolean>;
    recoverWallet: typeof recoverWallet;
    /**
     * Check if a token account is valid. Should use try-catch around this method to check for the same.
     * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
     */
    checkTokenAccount(tokenAccount: anchor.web3.PublicKey): Promise<boolean>;
}
