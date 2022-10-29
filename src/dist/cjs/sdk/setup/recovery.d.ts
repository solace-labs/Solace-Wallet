import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";
/**
 * Create an account, just to recover an existing one
 * @param feePayer
 */
export declare function recoverWallet(this: SolaceSDK, username: string, feePayer: anchor.web3.PublicKey): Promise<import("../../relayer").RelayerIxData>;
