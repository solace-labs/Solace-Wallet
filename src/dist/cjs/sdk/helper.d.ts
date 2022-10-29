import { RawAccount } from "@solana/spl-token";
import * as anchor from "anchor-rn";
import { SolaceSDK } from "./solace";
import { RelayerIxData } from "../relayer";
import { ATAData } from "./types";
/**
 * Get the associated token account for the current wallet instance
 */
export declare function getTokenAccount(this: SolaceSDK, mint: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
/**
 * Get the associated token account of any public key and mint
 *
 */
export declare function getAnyAssociatedTokenAccount(this: SolaceSDK, mint: anchor.web3.PublicKey, owner: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
/**
 * Get the PDA associated token account of any public key and mint
 *
 */
export declare function getPDAAssociatedTokenAccount(this: SolaceSDK, mint: anchor.web3.PublicKey, owner: anchor.web3.PublicKey): Promise<anchor.web3.PublicKey>;
/**
 * Get the token account info if available, otherwise return null
 * Caches token accounts for quicker access
 */
export declare function getTokenAccountInfo(this: SolaceSDK, mint: anchor.web3.PublicKey): Promise<RawAccount>;
export declare function signTransaction(this: SolaceSDK, transaction: anchor.web3.Transaction, payer: anchor.web3.PublicKey, noOwner?: boolean): Promise<RelayerIxData>;
/**
 * For User
 * Add a trusted pubkey to the smart wallet
 */
export declare function addTrustedPubkey(this: SolaceSDK, pubkey: anchor.web3.PublicKey, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
export declare function getTransferAddress(this: SolaceSDK, random: anchor.web3.PublicKey): Promise<[anchor.web3.PublicKey, number]>;
/**
 * Check if the given pubkey is trusted or not
 */
export declare function isPubkeyTrusted(this: SolaceSDK, data: Awaited<ReturnType<typeof SolaceSDK.fetchDataForWallet>>, pubkey: anchor.web3.PublicKey): Promise<boolean>;
/**
 * Create a token account for a given mint. Only create if it doesn't already exists
 */
export declare function createTokenAccount(this: SolaceSDK, data: ATAData, feePayer: anchor.web3.PublicKey): Promise<RelayerIxData>;
