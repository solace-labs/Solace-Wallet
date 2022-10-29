import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";
import { RelayerIxData } from "../../relayer";
import { ApproveGuardianshipData, GuardianTimeData, RequestWalletInformationData } from "../types";
export declare function fetchGuardianData(this: SolaceSDK): Promise<{
    approvedGuardians: anchor.web3.PublicKey[];
    pendingGuardianData: GuardianTimeData[];
    removingGuardianData: GuardianTimeData[];
}>;
/**
 * Add a guardian to the wallet, signed by the owner
 * @param {anchor.web3.PublicKey} guardianPublicKey
 */
export declare function addGuardian(this: SolaceSDK, guardianPublicKey: anchor.web3.PublicKey, payer: anchor.web3.PublicKey): Promise<RelayerIxData>;
/**
 * FOR - User to remove a guardian
 */
export declare function removeGuardian(this: SolaceSDK, guardianAdress: anchor.web3.PublicKey, payer: anchor.web3.PublicKey): Promise<RelayerIxData>;
/**
 * For user
 * Set the guardian threshold
 * The guardian threshold should be lesser than the total number of guardians
 */
export declare function setGuardianThreshold(this: SolaceSDK, threshold: number, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
declare type RecoverWalletData = {
    network: "local" | "testnet";
    programAddress: string;
    username: string;
};
export declare class SolaceGuardian {
    /**
     * Approve recovery with a solace wallet
     * @param data
     * @param guardianAddress
     * @returns
     */
    static approveRecoveryByKeypairTx(data: RecoverWalletData, guardianAddress: string): Promise<{
        tx: anchor.web3.Transaction;
        recoveryAddress: anchor.web3.PublicKey;
    }>;
    /**
     * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet after the wait time has passed
     * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
     */
    static approveGuardianshipTx(data: ApproveGuardianshipData): anchor.web3.Transaction;
    /**
     * @param data {RequestWalletInformationData} data required to init the program and fetch guardian info
     * Static helper method to get only the guardian information of a particular wallet, given the address of the wallet. This method is helpful to know if a particular guardian is guarding any addresses. The data obtained by this function is on-chain and un-modifiable without program calls
     *
     */
    static getWalletGuardianInfo(data: RequestWalletInformationData): Promise<{
        pendingGuardians: anchor.web3.PublicKey[];
        approvedGuardians: anchor.web3.PublicKey[];
    }>;
    static confirmRemoval(data: ApproveGuardianshipData): Promise<anchor.web3.TransactionInstruction>;
}
export {};
