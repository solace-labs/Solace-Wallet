import { AccountLayout } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { relayTransaction } from "../src/relayer";
import { KeyPair, SolaceSDK } from "../src/sdk";
import { SolaceApprovals } from "../src/sdk/transfers/approval";
import { airdrop, guardian1, newOwner, relayPair } from "./airdrop";
import { PROGRAM_ADDRESS, solaceSdk, USDC } from "./solace";

export const sendUSDC = async () => {
  const recieverTA = await USDC.createAssociatedTokenAccount(
    newOwner.publicKey
  );

  const tx = await solaceSdk.requestSplTransfer(
    {
      mint: USDC.token,
      recieverTokenAccount: recieverTA,
      reciever: newOwner.publicKey,
      amount: 101,
    },
    relayPair.publicKey
  );
  const sig = await relayTransaction(tx, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
  const data = Buffer.from(info.data);
  const accountInfo = AccountLayout.decode(data);
  // it is working properly because incubation mode is true. If incubation mode is false, it won't work.
  assert(accountInfo.amount.toString() === "101", "Amount mismatch");
};

export const requestGuardedSPLTransfer = async () => {
  const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);

  const tx = await solaceSdk.requestSplTransfer(
    {
      mint: USDC.token,
      recieverTokenAccount: recieverTA,
      reciever: newOwner.publicKey,
      amount: 1,
    },
    relayPair.publicKey
  );
  const sig = await relayTransaction(tx, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig);
};

export const approveAndExecuteGuardedTransfer = async () => {
  const ongoingTransfers = await solaceSdk.fetchOngoingTransfers();
  assert(ongoingTransfers.length === 1, "should have one ongoing transfer");

  const tx = await SolaceApprovals.approveAndExecuteGuardedTransfer({
    solaceWalletAddress: solaceSdk.wallet.toString(),
    programAddress: PROGRAM_ADDRESS,
    guardianAddress: guardian1.publicKey.toString(),
    transferKeyAddress: ongoingTransfers[0].seedKey.toString(),
    network: "local",
  });
  const sig = await SolaceSDK.localConnection.sendTransaction(tx, [guardian1]);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
  const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
  const data = Buffer.from(info.data);
  const accountInfo = AccountLayout.decode(data);
  assert(accountInfo.amount.toString() === "102", "Amount mismatch");
};

export const requestGuardedSOLTransfer = async () => {
  await airdrop(solaceSdk.wallet);
  const tx = await solaceSdk.requestSolTransfer(
    {
      amount: LAMPORTS_PER_SOL,
      reciever: KeyPair.generate().publicKey,
    },
    relayPair.publicKey
  );
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);
};

export const approveAndExecuteGuardedSolTransfer = async () => {
  const ongoingTransfers = await solaceSdk.fetchOngoingTransfers();
  assert(ongoingTransfers.length === 1, "should have one ongoing transfer");

  const tx = await SolaceApprovals.approveAndExecuteGuardedTransfer({
    solaceWalletAddress: solaceSdk.wallet.toString(),
    programAddress: PROGRAM_ADDRESS,
    guardianAddress: guardian1.publicKey.toString(),
    transferKeyAddress: ongoingTransfers[0].seedKey.toString(),
    network: "local",
  });
  const sig = await SolaceSDK.localConnection.sendTransaction(tx, [guardian1]);
  await SolaceSDK.localConnection.confirmTransaction(sig);
};
