import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";
export declare function endIncubation(this: SolaceSDK, feePayer: anchor.web3.PublicKey): Promise<import("../../relayer").RelayerIxData>;
/**
 * Check if the wallet is in incubation mode or not
 *
 */
export declare function checkIncubation(this: SolaceSDK, data: Awaited<ReturnType<typeof SolaceSDK.fetchDataForWallet>>): Promise<boolean>;
