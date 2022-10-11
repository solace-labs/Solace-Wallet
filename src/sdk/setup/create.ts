import * as anchor from "anchor-rn";
import { SolaceSDK } from "..";
import { RelayerIxData } from "../../relayer";

/**
 * Create a wallet for the first time
 * @param {string} name Name of the user
 * @returns {Promise<RelayerIxData>} return the transaction that can be relayed
 */
export async function createFromName(
  this: SolaceSDK,
  name: string,
  feePayer: anchor.web3.PublicKey
): Promise<RelayerIxData> {
  const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("SOLACE"), Buffer.from(name, "utf8")],
    this.program.programId
  );

  console.log("Owner Address", this.owner.publicKey.toString());

  const tx = this.program.transaction.createWallet(
    this.owner.publicKey, // Owner
    [], // Guardian
    // 0, // Guardian Approval Threshold
    name,
    {
      accounts: {
        signer: this.owner.publicKey,
        rentPayer: feePayer,
        wallet: walletAddress,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
    }
  );
  this.wallet = walletAddress;
  return this.signTransaction(tx, feePayer);
}
