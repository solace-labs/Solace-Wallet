import { Solace } from "./solace/types";
import { web3, Provider, Program } from "anchor-rn";
import { RelayerIxData } from "./relayer";
import { RawAccount } from "@solana/spl-token";
declare type SendSPLTokenData = {
    mint: web3.PublicKey;
    recieverTokenAccount: web3.PublicKey;
    reciever: web3.PublicKey;
    amount: number;
};
declare type SolaceTokenAccount = {
    mint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
};
declare type RecoverWalletData = {
    network: "local" | "testnet";
    programAddress: string;
    username: string;
};
declare type RequestWalletInformationData = {
    network: "local" | "testnet";
    programAddress: string;
    solaceWalletAddress: string;
};
declare type ApproveGuardianshipData = {
    network: "local" | "testnet";
    programAddress: string;
    solaceWalletAddress: string;
    guardianAddress: string;
};
declare type SolaceSDKData = {
    owner: web3.Keypair;
    network: "local" | "testnet";
    programAddress: string;
};
declare type ATAData = {
    tokenMint: web3.PublicKey;
    tokenAccount: web3.PublicKey;
};
export declare const PublicKey: typeof web3.PublicKey;
export declare const KeyPair: typeof web3.Keypair;
export declare class SolaceSDK {
    static localConnection: web3.Connection;
    static testnetConnection: web3.Connection;
    tokenAccounts: SolaceTokenAccount[];
    wallet: web3.PublicKey;
    owner: web3.Keypair;
    program: Program<Solace>;
    seed: web3.PublicKey;
    provider: Provider;
    /**
     * Create a wallet instance. Should be used in conjuncture with an initializer
     * @param {SolaceSDKData} data
     */
    constructor(data: SolaceSDKData);
    /**
     * Get the associated token account for the current wallet instance
     */
    getTokenAccount(mint: web3.PublicKey): web3.PublicKey;
    /**
     * Get the token account info if available, otherwise return null
     * Caches token accounts for quicker access
     */
    getTokenAccountInfo(mint: web3.PublicKey): Promise<RawAccount>;
    signTransaction(transaction: web3.Transaction, payer: web3.PublicKey): Promise<RelayerIxData>;
    static newKeyPair(): web3.Keypair;
    static fromSeed(seed: string, data: SolaceSDKData): typeof SolaceSDK;
    static getWalletFromName(programAddress: string, name: string): web3.PublicKey;
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
     * @param data {RequestWalletInformationData} data required to init the program and fetch guardian info
     * Static helper method to get only the guardian information of a particular wallet, given the address of the wallet. This method is helpful to know if a particular guardian is guarding any addresses. The data obtained by this function is on-chain and un-modifiable without program calls
     *
     */
    static getWalletGuardianInfo(data: RequestWalletInformationData): Promise<{
        pendingGuardians: web3.PublicKey[];
        approvedGuardians: web3.PublicKey[];
    }>;
    /**
     * Create a wallet for the first time
     * @param {string} name Name of the user
     * @returns {Promise<RelayerIxData>} return the transaction that can be relayed
     */
    createFromName(name: string, feePayer: web3.PublicKey): Promise<RelayerIxData>;
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
                name: "recoveryThreshold";
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
                name: "ongoingTransfer";
                type: {
                    defined: "OngoingTransfer";
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
    }, import("anchor-rn").IdlTypes<Solace>>>;
    /**
     * Fetch the state of any other given wallet
     */
    static fetchDataForWallet: (wallet: web3.PublicKey, program: Program<Solace>) => Promise<import("anchor-rn/dist/cjs/program/namespace/types").TypeDef<{
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
                name: "recoveryThreshold";
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
                name: "ongoingTransfer";
                type: {
                    defined: "OngoingTransfer";
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
    }, import("anchor-rn").IdlTypes<Solace>>>;
    /** Helper to confirm transactions */
    confirmTx: (tx: any) => Promise<web3.RpcResponseAndContext<web3.SignatureResult>>;
    /**
     * Should send some amount of SOL to the `toAddress`
     */
    /**
     * Add a guardian to the wallet, signed by the owner
     * @param {web3.PublicKey} guardianPublicKey
     */
    addGuardian(guardianPublicKey: web3.PublicKey, payer: web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet
     * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
     */
    static approveGuardianshipTx(data: ApproveGuardianshipData): web3.Transaction;
    /**
     * FOR - User to remove a guardian
     */
    removeGuardian(guardianAdress: web3.PublicKey, payer: web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Checks if the given wallet address is in recovery mode
     * @param wallet The wallet to be checked
     * @returns
     */
    isInRecovery(wallet: web3.PublicKey): Promise<boolean>;
    /**
     * Approve recovery with a solace wallet
     * @param data
     * @param guardianAddress
     * @returns
     */
    static approveRecoveryByKeypairTx(data: RecoverWalletData, guardianAddress: string): Promise<{
        tx: web3.Transaction;
        recoveryAddress: web3.PublicKey;
    }>;
    /**
     * Create an account, just to recover an existing one
     * @param data
     * @param feePayer
     */
    recoverWallet(username: string, feePayer: web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Check if a token account is valid. Should use try-catch around this method to check for the same.
     * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
     */
    checkTokenAccount(data: ATAData, feePayer: web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Create a token account for a given mint. Only create if it doesn't already exists
     */
    createTokenAccount(data: ATAData, feePayer: web3.PublicKey): Promise<RelayerIxData>;
    requestSplTransfer(data: SendSPLTokenData, feePayer: web3.PublicKey): Promise<RelayerIxData>;
    executeSplTransfer(feePayer: web3.PublicKey): Promise<RelayerIxData>;
    static approveSplTransfer(data: ApproveGuardianshipData): Promise<web3.Transaction>;
    endIncubation(feePayer: web3.PublicKey): Promise<RelayerIxData>;
    addTrustedPubkey(pubkey: web3.PublicKey, feePayer: web3.PublicKey): Promise<RelayerIxData>;
}
export {};
