import * as anchor from "anchor-rn";
export declare type OngoingTransfer = {
    isSplTransfer: boolean;
    amount: number;
    sender: anchor.web3.PublicKey;
    reciever: anchor.web3.PublicKey;
    mint?: anchor.web3.PublicKey;
    seedKey: anchor.web3.PublicKey;
    senderTokenAccount?: anchor.web3.PublicKey;
    threshold: number;
    totalApprovals: number;
    guardianApprovals: {
        guardian: anchor.web3.PublicKey;
        isApproved: boolean;
    }[];
};
export declare type SendSOLData = {
    amount: number;
    reciever: anchor.web3.PublicKey;
};
export declare type SendSOLByNameData = {
    amount: number;
    recieverName: string;
};
export declare type SendSPLTokenData = {
    mint: anchor.web3.PublicKey;
    recieverTokenAccount: anchor.web3.PublicKey;
    reciever: anchor.web3.PublicKey;
    amount: number;
};
export declare type SendSPLTokenByNameData = {
    mint: anchor.web3.PublicKey;
    recieverName: string;
    amount: number;
};
export declare type SendSOLTokenData = {
    reciever: anchor.web3.PublicKey;
    amount: number;
};
export declare type SolaceTokenAccount = {
    mint: anchor.web3.PublicKey;
    tokenAccount: anchor.web3.PublicKey;
};
export declare type RequestWalletInformationData = {
    network: "local" | "testnet";
    programAddress: string;
    solaceWalletAddress: string;
};
export declare type ApproveGuardianshipData = {
    network: "local" | "testnet";
    programAddress: string;
    solaceWalletAddress: string;
    guardianAddress: string;
};
export declare type ApproveTransferData = {
    network: "local" | "testnet";
    programAddress: string;
    solaceWalletAddress: string;
    guardianAddress: string;
    transferKeyAddress: string;
};
export declare type SolaceSDKData = {
    owner: anchor.web3.Keypair;
    network: "local" | "testnet";
    programAddress: string;
};
export declare type ATAData = {
    tokenMint: anchor.web3.PublicKey;
    tokenAccount: anchor.web3.PublicKey;
};
export declare type GuardianTimeData = {
    guardian: anchor.web3.PublicKey;
    time: number;
};
