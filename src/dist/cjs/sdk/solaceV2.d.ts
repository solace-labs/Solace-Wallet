import { SolanaWallet } from "@web3auth/solana-provider";
import { Solace } from "../solace/types";
import * as anchor from "anchor-rn";
import { RelayerIxData } from "../relayer";
export declare class SoalceConfig {
    rpcEndpoint: string;
    programId: string;
}
export declare class SolaceV2 {
    private wallet;
    program: anchor.Program<Solace>;
    ownerPublicKey: anchor.web3.PublicKey;
    solaceWalletPublicKey: anchor.web3.PublicKey;
    constructor(wallet: SolanaWallet, config: SoalceConfig);
    signTransaction: (transaction: anchor.web3.Transaction, payer: anchor.web3.PublicKey, noOwner?: boolean) => Promise<RelayerIxData>;
    createWallet(name: string, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
    addGuardian(guardianPublicKey: anchor.web3.PublicKey, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
}
