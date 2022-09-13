"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAccountExist = exports.TokenMint = void 0;
const spl_token_1 = require("@solana/spl-token");
/**
 * A `TokenMint` object can be used to easily create and mint tokens in dev environment
 */
class TokenMint {
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
        let token = await (0, spl_token_1.createMint)(connection, feePayer, feePayer.publicKey, null, 6);
        return new TokenMint(token, feePayer, connection);
    }
    /**
     * Get or create the associated token account for the specified `wallet`
     * @param wallet The wallet to get the ATA for
     * @returns
     */
    async getAssociatedTokenAccount(wallet) {
        const ata = await (0, spl_token_1.getAssociatedTokenAddress)(this.token, wallet, true, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        return ata;
        // await createAssociatedTokenAccount(
        //   this.connection,
        //   this.signer,
        //   this.token,
        //   wallet
        // );
        // return ata;
    }
    async createAssociatedTokenAccount(wallet) {
        return await (0, spl_token_1.createAssociatedTokenAccount)(this.connection, this.signer, this.token, wallet);
    }
    /**
     * Mint `amount` tokens into `tokenAccount`
     * @param tokenAccount The token account to mint into
     * @param amount The amount ot mint
     * @returns
     */
    async mintInto(tokenAccount, amount) {
        return await (0, spl_token_1.mintTo)(this.connection, this.signer, this.token, tokenAccount, this.signer, amount);
    }
}
exports.TokenMint = TokenMint;
/**
 * Check if an account exist
 * @param connection The solana connection object to the RPC node
 * @param key The account to check
 * @returns A boolean
 */
const checkAccountExist = async (connection, key) => {
    const info = await connection.getAccountInfo(key);
    if (!info || !info.data) {
        return false;
    }
    return true;
};
exports.checkAccountExist = checkAccountExist;
