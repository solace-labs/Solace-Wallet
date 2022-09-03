/**
 * This file acts as a mock relayer to test out various SDK Functions
 */
import * as anchor from "./anchor";
export interface RelayerIxData {
    message: string;
    signature: string;
    publicKey: string;
    blockHash: {
        lastValidBlockHeight: number;
        blockhash: string;
    };
}
/**
 * Relay a given transaction data on to the blockchain, while paying for gas
 */
export declare const relayTransaction: (data: RelayerIxData, payer: anchor.web3.Keypair, connection?: anchor.web3.Connection) => Promise<string>;
