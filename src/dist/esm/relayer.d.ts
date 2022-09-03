/**
 * This file acts as a mock relayer to test out various SDK Functions
 */
import { web3 } from "anchor-rn";
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
export declare const relayTransaction: (data: RelayerIxData, payer: web3.Keypair, connection?: web3.Connection) => Promise<string>;
