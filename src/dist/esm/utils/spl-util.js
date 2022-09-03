import { mintTo, createMint, createAssociatedTokenAccount, getAssociatedTokenAddress, } from "@solana/spl-token";
/**
 * A `TokenMint` object can be used to easily create and mint tokens in dev environment
 */
export class TokenMint {
    constructor(token, signer, connection) {
        this.token = token;
        this.signer = signer;
        this.connection = connection;
    }
    /**
     * Initialize a `TokenMint` object
     * @param connection The solana connection object to the RPC node
     * @param feePayer The fee payer used to create the mint
     * @param mintAuthority The mint authority
     * @returns
     */
    static async init(connection, feePayer) {
        let token = await createMint(connection, feePayer, feePayer.publicKey, null, 6);
        return new TokenMint(token, feePayer, connection);
    }
    /**
     * Get or create the associated token account for the specified `wallet`
     * @param wallet The wallet to get the ATA for
     * @param allowOffcurse Allow the owner account to be a PDA
     * @returns
     */
    async getAssociatedTokenAccount(wallet, allowOffcurse = false) {
        const ata = await getAssociatedTokenAddress(this.token, wallet, allowOffcurse);
        const exist = await checkAccountExist(this.connection, ata);
        if (exist) {
            return ata;
        }
        await createAssociatedTokenAccount(this.connection, this.signer, this.token, wallet);
        return ata;
    }
    /**
     * Mint `amount` tokens into `tokenAccount`
     * @param tokenAccount The token account to mint into
     * @param amount The amount ot mint
     * @returns
     */
    async mintInto(tokenAccount, amount) {
        return await mintTo(this.connection, this.signer, this.token, tokenAccount, this.signer, amount);
    }
}
/**
 * Check if an account exist
 * @param connection The solana connection object to the RPC node
 * @param key The account to check
 * @returns A boolean
 */
export const checkAccountExist = async (connection, key) => {
    const info = await connection.getAccountInfo(key);
    if (!info || !info.data) {
        return false;
    }
    return true;
};
