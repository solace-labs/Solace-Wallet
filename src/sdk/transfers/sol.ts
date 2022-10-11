import { SendSOLTokenData, SolaceSDK } from "..";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as anchor from "anchor-rn";
import { BN } from "bn.js";

export async function requestSolTransfer(
  this: SolaceSDK,
  data: SendSOLTokenData,
  feePayer: anchor.web3.PublicKey
) {
  const walletState = await this.fetchWalletData();

  const guardedTransfer = async () => {
    console.log("guarded SOL transfer");
    const random = anchor.web3.Keypair.generate().publicKey;
    const transfer = (await this.getTransferAddress(random))[0];
    return this.program.transaction.requestGuardedSolTransfer(
      {
        to: data.reciever,
        random: random,
        amount: new BN(data.amount),
      },
      {
        accounts: {
          wallet: this.wallet,
          owner: this.owner.publicKey,
          rentPayer: this.owner.publicKey,
          transfer: transfer,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [this.owner],
      }
    );
  };

  const instantTransfer = async () => {
    console.log("instant SOL transfer");
    return this.program.transaction.requestInstantSolTransfer(
      new BN(data.amount),
      {
        accounts: {
          wallet: this.wallet,
          owner: this.owner.publicKey,
          toAccount: data.reciever,
        },
      }
    );
  };

  // Check if instant transfer can be called or not
  const incubation = await this.checkIncubation(walletState);
  // return this.signTransaction(await instantTransfer(), feePayer);
  if (incubation) {
    // Instant transfer
    return this.signTransaction(await instantTransfer(), feePayer);
  } else {
    // Check if trusted
    if (await this.isPubkeyTrusted(walletState, data.reciever)) {
      // Instant transfer
      return this.signTransaction(await instantTransfer(), feePayer);
    } else {
      return this.signTransaction(await guardedTransfer(), feePayer);
    }
  }
}
