import { Solace } from "./solace/types";
import * as anchor from "anchor-rn";
import { RelayerIxData } from "./relayer";
import { RawAccount } from "@solana/spl-token";
declare type OngoingTransfer = {
    isSplTransfer: boolean;
    amount: number;
    reciever: anchor.web3.PublicKey;
    mint?: anchor.web3.PublicKey;
    seedKey: anchor.web3.PublicKey;
    senderTokenAccount?: anchor.web3.PublicKey;
    guardianApprovals: {
        guardian: anchor.web3.PublicKey;
        isApproved: boolean;
    }[];
};
declare type SendSPLTokenData = {
    mint: anchor.web3.PublicKey;
    recieverTokenAccount: anchor.web3.PublicKey;
    reciever: anchor.web3.PublicKey;
    amount: number;
};
declare type SolaceTokenAccount = {
    mint: anchor.web3.PublicKey;
    tokenAccount: anchor.web3.PublicKey;
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
declare type ApproveTransferData = {
    network: "local" | "testnet";
    programAddress: string;
    solaceWalletAddress: string;
    guardianAddress: string;
    transferKeyAddress: string;
};
declare type SolaceSDKData = {
    owner: anchor.web3.Keypair;
    network: "local" | "testnet";
    programAddress: string;
};
declare type ATAData = {
    tokenMint: anchor.web3.PublicKey;
    tokenAccount: anchor.web3.PublicKey;
};
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
    /**
     * Get the associated token account for the current wallet instance
     */
    getTokenAccount(mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
    /**
     * Get the associated token account of any public key and mint
     *
     */
    getAnyAssociatedTokenAccount(mint: anchor.web3.PublicKey, owner: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
    /**
     * Get the PDA associated token account of any public key and mint
     *
     */
    getPDAAssociatedTokenAccount(mint: anchor.web3.PublicKey, owner: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
    /**
     * Get the token account info if available, otherwise return null
     * Caches token accounts for quicker access
     */
    getTokenAccountInfo(mint: anchor.web3.PublicKey): Promise<RawAccount>;
    signTransaction(transaction: anchor.web3.Transaction, payer: anchor.web3.PublicKey, noOwner?: boolean): Promise<RelayerIxData>;
    static newKeyPair(): anchor.web3.Keypair;
    static fromSeed(seed: string, data: SolaceSDKData): typeof SolaceSDK;
    static getWalletFromName(programAddress: string, name: string): anchor.web3.PublicKey;
    static getAccountInfo(buffer: any): Promise<RawAccount>;
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
        pendingGuardians: anchor.web3.PublicKey[];
        approvedGuardians: anchor.web3.PublicKey[];
    }>;
    /**
     * Create a wallet for the first time
     * @param {string} name Name of the user
     * @returns {Promise<RelayerIxData>} return the transaction that can be relayed
     */
    createFromName(name: string, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
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
                name: "ongoingTransfers";
                type: {
                    vec: "publicKey";
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
                name: "ongoingTransfers";
                type: {
                    vec: "publicKey";
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
     * Check if the wallet is in incubation mode or not
     *
     */
    checkIncubation(data: Awaited<ReturnType<typeof SolaceSDK.fetchDataForWallet>>): Promise<boolean>;
    /**
     * Check if the given pubkey is trusted or not
     */
    isPubkeyTrusted(data: Awaited<ReturnType<typeof SolaceSDK.fetchDataForWallet>>, pubkey: anchor.web3.PublicKey): Promise<boolean>;
    /**
     * Should send some amount of SOL to the `toAddress`
     */
    sendSol(toAddress: anchor.web3.PublicKey, lamports: number, feePayer: anchor.web3.PublicKey): Promise<void>;
    /**
     * Add a guardian to the wallet, signed by the owner
     * @param {anchor.web3.PublicKey} guardianPublicKey
     */
    addGuardian(guardianPublicKey: anchor.web3.PublicKey, payer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet
     * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
     */
    static approveGuardianshipTx(data: ApproveGuardianshipData): anchor.web3.Transaction;
    /**
     * FOR - User to remove a guardian
     */
    removeGuardian(guardianAdress: anchor.web3.PublicKey, payer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Checks if the given wallet address is in recovery mode
     * @param wallet The wallet to be checked
     * @returns
     */
    isInRecovery(wallet: anchor.web3.PublicKey): Promise<boolean>;
    /**
     * Approve recovery with a solace wallet
     * @param data
     * @param guardianAddress
     * @returns
     */
    static approveRecoveryByKeypairTx(data: RecoverWalletData, guardianAddress: string): Promise<{
        tx: anchor.web3.Transaction;
        recoveryAddress: anchor.web3.PublicKey;
    }>;
    /**
     * Create an account, just to recover an existing one
     * @param data
     * @param feePayer
     */
    recoverWallet(username: string, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    /**
     * Check if a token account is valid. Should use try-catch around this method to check for the same.
     * If an error is caught, then the token account for the PDA doesn't exist and one needs to be created
     */
    checkTokenAccount(tokenAccount: anchor.web3.PublicKey): Promise<boolean>;
    /**
     * Create a token account for a given mint. Only create if it doesn't already exists
     */
    createTokenAccount(data: ATAData, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    getTransferAddress(random: anchor.web3.PublicKey): Promise<[anchor.web3.PublicKey, number]>;
    requestSplTransfer(data: SendSPLTokenData, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    /**
     *
     * Fetch any ongoing transfer and populate the data for the same
     */
    fetchOngoingTransfers(): Promise<OngoingTransfer[]>;
    static approveGuardedTransfer(data: ApproveTransferData): Promise<anchor.web3.Transaction>;
    static approveAndExecuteGuardedTransfer(data: ApproveTransferData): Promise<anchor.web3.Transaction>;
    endIncubation(feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    addTrustedPubkey(pubkey: anchor.web3.PublicKey, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
}
export {};
