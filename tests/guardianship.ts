import { Transaction } from "@solana/web3.js";
import { assert } from "chai";
import { relayTransaction } from "../src/relayer";
import { SolaceGuardian, SolaceSDK } from "../src/sdk";
import {
  airdrop,
  guardian1,
  guardian2,
  owner,
  relayPair,
  signer,
} from "./airdrop";
import { getWallet, solaceSdk } from "./solace";

export const requestGuardianship = async () => {
  const tx = await solaceSdk.addGuardian(
    guardian1.publicKey,
    relayPair.publicKey
  );
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);

  let wallet = await getWallet();
  assert(wallet.owner.equals(signer.publicKey), "Wallet not owned by owner");
  await airdrop(guardian1.publicKey);

  // it can be auto - approved because it is in incubation mode.
  const guardianInfo = await SolaceGuardian.getWalletGuardianInfo({
    solaceWalletAddress: solaceSdk.wallet.toString(),
    programAddress: solaceSdk.program.programId.toString(),
    network: "local",
  });
  assert(guardianInfo.approvedGuardians[0].equals(guardian1.publicKey));
  solaceSdk.fetchWalletData();
  // await solaceSdk.createWalletToRequestRecovery(newOwner, walletAddress);
  // wallet = await getWallet();
  // assert(wallet.recoveryMode, "The wallet should be in recovery mode");
};

export const testAddGuardianAfterIncubation = async () => {
  const tx = await solaceSdk.addGuardian(
    guardian2.publicKey,
    relayPair.publicKey
  );
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const pendingGuardians = await solaceSdk.fetchGuardianData();
  console.log(pendingGuardians);
};

export const testRemoveGuardian = async () => {
  const tx = await solaceSdk.removeGuardian(
    guardian1.publicKey,
    relayPair.publicKey
  );
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  let wallet = await getWallet();
  console.log(wallet);
};

export const testRemoveGuardianConfirmation = async () => {
  const ix = await SolaceGuardian.confirmRemoval({
    solaceWalletAddress: solaceSdk.wallet.toString(),
    guardianAddress: guardian1.publicKey.toString(),
    network: "local",
    programAddress: solaceSdk.program.programId.toString(),
  });
  const tx = new Transaction();
  tx.add(ix);
  tx.feePayer = relayPair.publicKey;
  const sig = await SolaceSDK.localConnection.sendTransaction(tx, [relayPair]);
  await SolaceSDK.localConnection.confirmTransaction(sig);

  // const sig = await SolaceSDK.localConnection.sendTransaction(tx, [guardian1]);

  let wallet = await getWallet();
  console.log(wallet);
};
