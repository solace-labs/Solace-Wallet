import { SolaceSDK } from "../solace";
import * as anchor from "anchor-rn";
import { BN } from "bn.js";
import { SendSOLTokenData } from "../types";

export async function requestSolTransferByName(
  this: SolaceSDK,
  recieverName: string,
  amount: number,
  feePayer: anchor.web3.PublicKey
) {
  const walletAddress = await SolaceSDK.getWalletFromNameAsync(
    this.program.programId.toString(),
    recieverName
  );
  const walletData = await SolaceSDK.fetchDataForWallet(
    walletAddress,
    this.program
  );
  console.log(walletData);
  if (!walletData) {
    throw "Wallet doesn't exist with this name";
  }
  return this.requestSolTransfer(
    {
      reciever: walletAddress,
      amount,
    },
    feePayer
  );
}

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
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );
  };

  // Check if instant transfer can be called or not
  const incubation = await this.checkIncubation(walletState);
  // return this.signTransaction(await instantTransfer(), feePayer);
  if (incubation) {
    // Instant transfer
    return {
      transaction: await this.signTransaction(
        await instantTransfer(),
        feePayer
      ),
      isGuarded: true,
    };
  } else {
    // Check if trusted
    if (await this.isPubkeyTrusted(walletState, data.reciever)) {
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
