/**
 * This file acts as a mock relayer to test out various SDK Functions
 */
import * as anchor from "./anchor";
import { bs58 } from "./anchor/src/utils/bytes";

export interface RelayerIxData {
  message: string;
  signature: string;
  publicKey: string;
  blockHash: {
    lastValidBlockHeight: number;
    blockhash: string;
  };
}

/**
 * Relay a given transaction data on to the blockchain, while paying for gas
 */
export const relayTransaction = async (
  data: RelayerIxData,
  payer: anchor.web3.Keypair,
  connection: anchor.web3.Connection
) => {
  console.log("Relaying");
  const transaction = anchor.web3.Transaction.populate(
    anchor.web3.Message.from(Buffer.from(data.message, "base64"))
  );
  transaction.addSignature(
    new anchor.web3.PublicKey(data.publicKey),
    Buffer.from(bs58.decode(data.signature))
  );
  transaction.partialSign(payer);
  const res = await connection.sendEncodedTransaction(
    transaction.serialize().toString("base64")
  );
  // TODO: Update to the latest API
  const confirmation = await connection.confirmTransaction(res);
  console.log("Confirmed", confirmation);
  return confirmation;
};
