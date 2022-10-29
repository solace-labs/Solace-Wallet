import * as anchor from "anchor-rn";
import { ApproveTransferData } from "../types";
export declare class SolaceApprovals {
    static approveGuardedTransfer(data: ApproveTransferData): Promise<anchor.web3.Transaction>;
    static approveAndExecuteGuardedTransfer(data: ApproveTransferData): Promise<anchor.web3.Transaction>;
}
