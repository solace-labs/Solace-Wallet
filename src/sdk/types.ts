import * as anchor from "anchor-rn";

export type OngoingTransfer = {
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

export type SendSOLData = {
  amount: number;
  reciever: anchor.web3.PublicKey;
};

export type SendSPLTokenData = {
  mint: anchor.web3.PublicKey;
  recieverTokenAccount: anchor.web3.PublicKey;
  reciever: anchor.web3.PublicKey;
  amount: number;
};

export type SendSOLTokenData = {
  reciever: anchor.web3.PublicKey;
  amount: number;
};

export type SolaceTokenAccount = {
  mint: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
};

export type RequestWalletInformationData = {
  network: "local" | "testnet";
  programAddress: string;
  solaceWalletAddress: string;
};

export type ApproveGuardianshipData = {
  network: "local" | "testnet";
  programAddress: string;
  solaceWalletAddress: string;
  guardianAddress: string;
};

export type ApproveTransferData = {
  network: "local" | "testnet";
  programAddress: string;
  solaceWalletAddress: string;
  guardianAddress: string;
  transferKeyAddress: string;
};

export type SolaceSDKData = {
  owner: anchor.web3.Keypair;
  network: "local" | "testnet";
  programAddress: string;
};

export type ATAData = {
  tokenMint: anchor.web3.PublicKey;
  tokenAccount: anchor.web3.PublicKey;
};
