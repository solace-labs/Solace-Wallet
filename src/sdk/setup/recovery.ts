import * as anchor from "anchor-rn";
import { Program } from "anchor-rn";
import { BN } from "bn.js";
import { KeyPair, SolaceSDK } from "../solace";
import { Solace } from "../../solace/types";

/**
 * Create an account, just to recover an existing one
 * @param feePayer
 */
export async function recoverWallet(
  this: SolaceSDK,
  username: string,
  feePayer: anchor.web3.PublicKey
) {
  const addressToRecover = SolaceSDK.getWalletFromName(
    this.program.programId.toString(),
    username
  );

  this.wallet = addressToRecover;

  const walletData = await SolaceSDK.fetchDataForWallet(
    addressToRecover,
    this.program
  );

  if (!walletData) {
    throw "Invalid solace wallet address";
  }

  const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [
      addressToRecover.toBuffer(),
      new BN(walletData.walletRecoverySequence).toArrayLike(Buffer, "le", 8),
    ],
    this.program.programId
  );

  const tx = this.program.transaction.initiateWalletRecovery(
    this.owner.publicKey,
    {
      accounts: {
        wallet: addressToRecover,
        recovery: recoveryAddress,
        proposer: this.owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
        rentPayer: feePayer,
      },
    }
  );
  return this.signTransaction(tx, feePayer);
}
