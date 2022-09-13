import { Keypair, PublicKey, Connection } from "@solana/web3.js";
/**
 * A `TokenMint` object can be used to easily create and mint tokens in dev environment
 */
export declare class TokenMint {
    token: PublicKey;
    signer: Keypair;
    connection: Connection;
    constructor(token: PublicKey, signer: Keypair, connection: Connection);
    /**
     * Initialize a `TokenMint` object
     * @param connection The solana connection object to the RPC node
     * @param feePayer The fee payer used to create the mint
     * @param mintAuthority The mint authority
     * @returns
     */
    static init(connection: Connection, feePayer: Keypair): Promise<TokenMint>;
    /**
     * Get or create the associated token account for the specified `wallet`
     * @param wallet The wallet to get the ATA for
     * @returns
     */
    getAssociatedTokenAccount(wallet: PublicKey): Promise<PublicKey>;
    createAssociatedTokenAccount(wallet: PublicKey): Promise<PublicKey>;
    /**
     * Mint `amount` tokens into `tokenAccount`
     * @param tokenAccount The token account to mint into
     * @param amount The amount ot mint
     * @returns
     */
    mintInto(tokenAccount: PublicKey, amount: number): Promise<string>;
}
/**
 * Check if an account exist
 * @param connection The solana connection object to the RPC node
 * @param key The account to check
 * @returns A boolean
 */
export declare const checkAccountExist: (connection: Connection, key: PublicKey) => Promise<boolean>;
