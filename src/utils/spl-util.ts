import { Keypair, PublicKey, Connection } from "@solana/web3.js";
import {
  mintTo,
  createMint,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccount,
} from "@solana/spl-token";

/**
 * A `TokenMint` object can be used to easily create and mint tokens in dev environment
 */
export class TokenMint {
  constructor(
    public token: PublicKey,
    public signer: Keypair,
    public connection: Connection
  ) {}

  /**
   * Initialize a `TokenMint` object
   * @param connection The solana connection object to the RPC node
   * @param feePayer The fee payer used to create the mint
   * @param mintAuthority The mint authority
   * @returns
   */
  static async init(
    connection: Connection,
    feePayer: Keypair
  ): Promise<TokenMint> {
    let token = await createMint(
      connection,
      feePayer,
      feePayer.publicKey,
      null,
      6
    );
    return new TokenMint(token, feePayer, connection);
  }

  /**
   * Get or create the associated token account for the specified `wallet`
   * @param wallet The wallet to get the ATA for
   * @returns
   */
  async getAssociatedTokenAccount(wallet: PublicKey): Promise<PublicKey> {
    const ata = await getAssociatedTokenAddress(
      this.token,
      wallet,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    return ata;

    // await createAssociatedTokenAccount(
    //   this.connection,
    //   this.signer,
    //   this.token,
    //   wallet
    // );

    // return ata;
  }

  async createAssociatedTokenAccount(wallet: PublicKey) {
    return await createAssociatedTokenAccount(
      this.connection,
      this.signer,
      this.token,
      wallet
    );
  }

  /**
   * Mint `amount` tokens into `tokenAccount`
   * @param tokenAccount The token account to mint into
   * @param amount The amount ot mint
   * @returns
   */
  async mintInto(tokenAccount: PublicKey, amount: number): Promise<string> {
    return await mintTo(
      this.connection,
      this.signer,
      this.token,
      tokenAccount,
      this.signer,
      amount
    );
  }
}

/**
 * Check if an account exist
 * @param connection The solana connection object to the RPC node
 * @param key The account to check
 * @returns A boolean
 */
export const checkAccountExist = async (
  connection: Connection,
  key: PublicKey
): Promise<boolean> => {
  const info = await connection.getAccountInfo(key);
  if (!info || !info.data) {
    return false;
  }
  return true;
};
