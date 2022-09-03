/**
 * This file acts as a mock relayer to test out various SDK Functions
 */
import { web3 } from "anchor-rn";
import bs58 from "bs58";

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
  payer: web3.Keypair,
  connection?: web3.Connection
) => {
  connection = new web3.Connection("http://127.0.0.1:8899");
  const transaction = web3.Transaction.populate(
    web3.Message.from(Buffer.from(data.message, "base64"))
  );
  transaction.addSignature(
    new web3.PublicKey(data.publicKey),
    Buffer.from(bs58.decode(data.signature))
  );
  transaction.partialSign(payer);
  const res = await connection.sendEncodedTransaction(
    transaction.serialize().toString("base64")
  );
  // TODO: Update to the latest API
  // const confirmation = await connection.confirmTransaction(res);
  // console.log("Confirmed", confirmation);
  return res;
};
