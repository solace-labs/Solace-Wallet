import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";
import { RelayerIxData } from "../../relayer";
/**
 * Create a wallet for the first time
 * @param {string} name Name of the user
 * @returns {Promise<RelayerIxData>} return the transaction that can be relayed
 */
export declare function createFromName(this: SolaceSDK, name: string, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
