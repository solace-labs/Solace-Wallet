import { SolaceSDK } from "../solace";
import * as anchor from "anchor-rn";
import { BN } from "bn.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { SendSPLTokenData } from "../types";

export async function requestSplTransfer(
  this: SolaceSDK,
  data: SendSPLTokenData,
  feePayer: anchor.web3.PublicKey
) {
  const walletState = await this.fetchWalletData();

  const guardedTransfer = async () => {
    const random = anchor.web3.Keypair.generate().publicKey;
    const transferAccount = (await this.getTransferAddress(random))[0];
    return this.program.transaction.requestGuardedSplTransfer(
      {
        toBase: data.reciever,
        to: data.recieverTokenAccount,
        mint: data.mint,
        fromTokenAccount: await this.getTokenAccount(data.mint),
        tokenProgram: TOKEN_PROGRAM_ID,
        random: random,
        amount: new BN(data.amount),
      },
      {
        accounts: {
          wallet: this.wallet,
          owner: this.owner.publicKey,
          rentPayer: feePayer,
          transfer: transferAccount,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );
  };

  const instantTransfer = async () => {
    return this.program.transaction.requestInstantSplTransfer(
      new BN(data.amount),
      {
        accounts: {
          wallet: this.wallet,
          owner: this.owner.publicKey,
          tokenAccount: await this.getTokenAccount(data.mint),
          recieverAccount: data.recieverTokenAccount,
          tokenMint: data.mint,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [this.owner],
      }
    );
  };

  // Check if instant transfer can be called or not
  const incubation = await this.checkIncubation(walletState);
  if (incubation) {
    // Instant transfer
    // return await instantTransfer();
    return {
      transaction: await this.signTransaction(
        await instantTransfer(),
        feePayer
      ),
      isGuarded: false,
    };
  } else {
    // Check if trusted
    if (await this.isPubkeyTrusted(walletState, data.recieverTokenAccount)) {
      // Instant transfer
      return {
        transaction: await this.signTransaction(
          await instantTransfer(),
          feePayer
        ),
        isGuarded: false,
      };
    } else {
      return {
        transaction: await this.signTransaction(
          await guardedTransfer(),
          feePayer
        ),
        isGuarded: true,
      };
    }
  }
}
