import { SolaceSDK } from "../solace";
import * as anchor from "anchor-rn";
import { SendSPLTokenData } from "../types";
export declare function requestSplTransfer(this: SolaceSDK, data: SendSPLTokenData, feePayer: anchor.web3.PublicKey): Promise<{
    transaction: import("../../relayer").RelayerIxData;
    isGuarded: boolean;
}>;
