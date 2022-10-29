import {
  AccountLayout,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
  RawAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import * as anchor from "anchor-rn";
import bs58 from "bs58";
import { SolaceSDK } from "./solace";
import { RelayerIxData } from "../relayer";
import { ATAData } from "./types";
/**
 * Get the associated token account for the current wallet instance
 */
export async function getTokenAccount(
  this: SolaceSDK,
  mint: anchor.web3.PublicKey
) {
  let tokenAccount = this.tokenAccounts.find((x) =>
    x.mint.equals(mint)
  )?.tokenAccount;
  if (!tokenAccount) {
    tokenAccount = await getAssociatedTokenAddress(
      mint,
      this.wallet,
      true,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    this.tokenAccounts.push({
      mint,
      tokenAccount,
    });
  }
  return tokenAccount;
}

/**
 * Get the associated token account of any public key and mint
 *
 */
export async function getAnyAssociatedTokenAccount(
  this: SolaceSDK,
  mint: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey
) {
  return await getAssociatedTokenAddress(
    mint,
    owner,
    false,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
}

/**
 * Get the PDA associated token account of any public key and mint
 *
 */
export async function getPDAAssociatedTokenAccount(
  this: SolaceSDK,
  mint: anchor.web3.PublicKey,
  owner: anchor.web3.PublicKey
) {
  return await getAssociatedTokenAddress(
    mint,
    owner,
    true,
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
}
/**
 * Get the token account info if available, otherwise return null
 * Caches token accounts for quicker access
 */
export async function getTokenAccountInfo(
  this: SolaceSDK,
  mint: anchor.web3.PublicKey
): Promise<RawAccount> {
  const tokenAccount = await this.getTokenAccount(mint);
  const info = await this.provider.connection.getAccountInfo(tokenAccount);
  if (!info) {
    return null;
  }
  const data = Buffer.from(info.data);
  const accountInfo = AccountLayout.decode(data);
  return accountInfo;
}

export async function signTransaction(
  this: SolaceSDK,
  transaction: anchor.web3.Transaction,
  payer: anchor.web3.PublicKey,
  noOwner?: boolean
): Promise<RelayerIxData> {
  const x = await anchor.getProvider().connection.getLatestBlockhash();
  const tx = new anchor.web3.Transaction({
    ...x,
    feePayer: payer,
  });
  tx.add(transaction);
  let signature: any;
  if (!noOwner) {
    tx.partialSign(this.owner);
    signature = tx.signatures[1].signature;
  }
  return {
    signature: noOwner ? null : bs58.encode(signature),
    publicKey: noOwner ? null : this.owner.publicKey.toString(),
    message: tx.compileMessage().serialize().toString("base64"),
    blockHash: {
      blockhash: x.blockhash,
      lastValidBlockHeight: x.lastValidBlockHeight,
    },
  };
}

/**
 * For User
 * Add a trusted pubkey to the smart wallet
 */
export async function addTrustedPubkey(
  this: SolaceSDK,
  pubkey: anchor.web3.PublicKey,
  feePayer: anchor.web3.PublicKey
) {
  const tx = this.program.transaction.addTrustedPubkey(pubkey, {
    accounts: {
      wallet: this.wallet,
      owner: this.owner.publicKey,
    },
  });
  return this.signTransaction(tx, feePayer);
}

export async function getTransferAddress(
  this: SolaceSDK,
  random: anchor.web3.PublicKey
) {
  return anchor.web3.PublicKey.findProgramAddress(
    [this.wallet.toBytes(), random.toBytes()],
    this.program.programId
  );
}

/**
 * Check if the given pubkey is trusted or not
 */

export async function isPubkeyTrusted(
  this: SolaceSDK,
  data: Awaited<ReturnType<typeof SolaceSDK.fetchDataForWallet>>,
  pubkey: anchor.web3.PublicKey
): Promise<boolean> {
  return data.trustedPubkeys.includes(pubkey);
}

/**
 * Create a token account for a given mint. Only create if it doesn't already exists
 */
export async function createTokenAccount(
  this: SolaceSDK,
  data: ATAData,
  feePayer: anchor.web3.PublicKey
) {
  const transaction = new anchor.web3.Transaction().add(
    createAssociatedTokenAccountInstruction(
      feePayer,
      data.tokenAccount,
      this.wallet,
      data.tokenMint,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    )
  );
  const tx = await this.signTransaction(transaction, feePayer, true);
  return tx;
}
