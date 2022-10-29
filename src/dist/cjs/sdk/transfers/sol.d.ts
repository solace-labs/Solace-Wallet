import { SolaceSDK } from "../solace";
import * as anchor from "anchor-rn";
import { SendSOLTokenData } from "../types";
export declare function requestSolTransferByName(this: SolaceSDK, recieverName: string, amount: number, feePayer: anchor.web3.PublicKey): Promise<{
    transaction: import("../../relayer").RelayerIxData;
    isGuarded: boolean;
}>;
export declare function requestSolTransfer(this: SolaceSDK, data: SendSOLTokenData, feePayer: anchor.web3.PublicKey): Promise<{
    transaction: import("../../relayer").RelayerIxData;
    isGuarded: boolean;
}>;
