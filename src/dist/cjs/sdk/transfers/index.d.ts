import { SolaceSDK } from "../solace";
import { OngoingTransfer } from "../types";
export declare function fetchOngoingTransfers(this: SolaceSDK): Promise<OngoingTransfer[]>;
