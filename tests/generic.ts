import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { assert } from "chai";
import { relayTransaction } from "../src/relayer";
import { SolaceSDK } from "../src/sdk";
import { SolaceGuardian } from "../src/sdk/setup/guardian";
import { guardian1, newOwner, owner, relayPair } from "./airdrop";
import {
  getWallet,
  PROGRAM_ADDRESS,
  solaceSdk,
  USDC,
  walletName,
} from "./solace";

export const fetchWallet = async () => {
  const _sdk = SolaceSDK.retrieveFromName(walletName, {
    programAddress: PROGRAM_ADDRESS,
    owner,
    network: "local",
  });
  assert((await _sdk).wallet.equals(solaceSdk.wallet));
};

export const fetchIncorrectWallet = async () => {
  const _sdk = SolaceSDK.retrieveFromName("random.solace.io", {
    programAddress: PROGRAM_ADDRESS,
    owner,
    network: "local",
  });
  assert(!(await _sdk).wallet.equals(solaceSdk.wallet));
};

export const mintUSDC = async () => {
  const tokenAccount = await USDC.getAssociatedTokenAccount(solaceSdk.wallet);
  const tokenAccountInfo = await solaceSdk.getTokenAccountInfo(USDC.token);
  assert(tokenAccountInfo === null);
  const tx = await solaceSdk.createTokenAccount(
    { tokenAccount, tokenMint: USDC.token },
    relayPair.publicKey
  );
  const sig1 = await relayTransaction(tx, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig1);
  const res = await USDC.mintInto(tokenAccount, 10000000);
  await SolaceSDK.localConnection.confirmTransaction(res);
};

export const getAllTokenAccounts = async () => {
  const tokenAccounts =
    await solaceSdk.provider.connection.getTokenAccountsByOwner(
      solaceSdk.wallet,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );
  console.log(tokenAccounts);
};

export const addTrustedPubkey = async () => {
  const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
  const tx = await solaceSdk.addTrustedPubkey(recieverTA, relayPair.publicKey);
  const sig = await relayTransaction(tx, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig);
};

export const endIncubation = async () => {
  const tx = await solaceSdk.endIncubation(relayPair.publicKey);
  const sig = await relayTransaction(tx, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig);
};

export const initateWalletRecovery = async () => {
  let wallet = await getWallet();
  const sdk2 = new SolaceSDK({
    network: "local",
    programAddress: PROGRAM_ADDRESS,
    owner: newOwner,
  });
  const tx = await sdk2.recoverWallet(walletName, relayPair.publicKey);
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);
};

export const acceptRecoveryAndAssignNewOwner = async () => {
  const tx = await SolaceGuardian.approveRecoveryByKeypairTx(
    {
      network: "local",
      programAddress: PROGRAM_ADDRESS,
      username: walletName,
    },
    guardian1.publicKey.toString()
  );
  const sig = await SolaceSDK.localConnection.sendTransaction(tx.tx, [
    guardian1,
  ]);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const data = await SolaceSDK.fetchDataForWallet(
    SolaceSDK.getWalletFromName(PROGRAM_ADDRESS, walletName),
    solaceSdk.program
  );
  assert(data.owner.equals(newOwner.publicKey));
};
