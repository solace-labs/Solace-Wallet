import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";

/// For User
/// End the incubation period for the user
export function endIncubation(
  this: SolaceSDK,
  feePayer: anchor.web3.PublicKey
) {
  const tx = this.program.transaction.endIncubation({
    accounts: {
      wallet: this.wallet,
      owner: this.owner.publicKey,
    },
  });
  return this.signTransaction(tx, feePayer);
}

/**
 * Check if the wallet is in incubation mode or not
 *
 */
export async function checkIncubation(
  this: SolaceSDK,
  data: Awaited<ReturnType<typeof SolaceSDK.fetchDataForWallet>>
): Promise<boolean> {
  const incubationEnd = new Date(data.createdAt.toNumber());
  incubationEnd.setHours(incubationEnd.getHours() + 12);
  const now = new Date().getTime() / 1000;
  if (now < incubationEnd.getTime()) {
    return data.incubationMode as boolean;
  }
  return false;
}
