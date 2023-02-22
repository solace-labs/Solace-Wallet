import { AccountLayout } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";
import { relayTransaction } from "../src/relayer";
import { KeyPair, SolaceSDK } from "../src/sdk/solace";
import {
  createTokenAccount,
  getAnyAssociatedTokenAccount,
} from "../src/sdk/helper";
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
  const sig = await relayTransaction(tx.transaction, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
  const data = Buffer.from(info.data);
  const accountInfo = AccountLayout.decode(data);
  // it is working properly because incubation mode is true. If incubation mode is false, it won't work.
  assert(accountInfo.amount.toString() === "101", "Amount mismatch");
};

export const testSendUSDCToSolanaWallet = async () => {
  const newOwner = KeyPair.generate();
  const sdk2 = new SolaceSDK({
    owner: newOwner,
    programAddress: solaceSdk.program.programId.toString(),
    network: "local",
  });
  const wallet2Name = "wallet2";
  const tx = await sdk2.createFromName(wallet2Name, relayPair.publicKey);
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  // ---  The USER entered the name

  const wallet2 = SolaceSDK.getWalletFromName(
    solaceSdk.program.programId.toString(),
    // User input
    wallet2Name
  );
  // const data = await SolaceSDK.fetchDataForWallet(wallet2, solaceSdk.program);
  // Make sure you use this
  const wallet2TokenAccount = await solaceSdk.getPDAAssociatedTokenAccount(
    USDC.token, // mint
    wallet2
  );
  const wallet2TokenAccountData =
    await SolaceSDK.localConnection.getAccountInfo(wallet2TokenAccount);
  if (!wallet2TokenAccountData) {
    const ataTx = await solaceSdk.createAnyTokenAccount(
      wallet2,
      wallet2TokenAccount,
      USDC.token,
      relayPair.publicKey
    );
    const sig = await relayTransaction(ataTx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    console.log("ATA Created: ", wallet2TokenAccount.toString());
  }
  const tx2 = await solaceSdk.requestSplTransfer(
    {
      mint: USDC.token,
      reciever: wallet2,
      amount: 1,
      recieverTokenAccount: wallet2TokenAccount,
    },
    relayPair.publicKey
  );
  const sig2 = await relayTransaction(
    tx2.transaction,
    relayPair,
    SolaceSDK.localConnection
  );
  await SolaceSDK.localConnection.confirmTransaction(sig2);
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
  const sig = await relayTransaction(tx.transaction, relayPair);
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const ongoingTransfers = await solaceSdk.fetchOngoingTransfers();
  console.log(JSON.stringify(ongoingTransfers[0].guardianApprovals, null, 3));
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
  const sig = await relayTransaction(
    tx.transaction,
    relayPair,
    SolaceSDK.localConnection
  );
  await SolaceSDK.localConnection.confirmTransaction(sig);
  const walletData = await solaceSdk.fetchOngoingTransfers();
  console.log(walletData);
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

export const testRequestSolTransfer = async () => {
  const newOwner = KeyPair.generate();
  await airdrop(solaceSdk.wallet);
  const tx = await solaceSdk.requestSolTransfer(
    {
      amount: 1 * LAMPORTS_PER_SOL,
      reciever: newOwner.publicKey,
    },
    relayPair.publicKey
  );
  const sig = await relayTransaction(
    tx.transaction,
    relayPair,
    SolaceSDK.localConnection
  );
  await SolaceSDK.localConnection.confirmTransaction(sig);
};

export const testRequestNamedSOLTransfer = async () => {
  const newOwner = KeyPair.generate();
  const sdk2 = new SolaceSDK({
    owner: newOwner,
    programAddress: solaceSdk.program.programId.toString(),
    network: "local",
  });
  const wallet2Name = "wallet2";
  const tx = await sdk2.createFromName(wallet2Name, relayPair.publicKey);
  const sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
  await SolaceSDK.localConnection.confirmTransaction(sig);

  const tx2 = await solaceSdk.requestSolTransferByName(
    wallet2Name,
    1 * LAMPORTS_PER_SOL,
    relayPair.publicKey
  );
  // const tx2 = await solaceSdk.requestSolTransfer(
  //   { reciever: sdk2.wallet, amount: 1 * LAMPORTS_PER_SOL },
  //   relayPair.publicKey
  // );
  const sig2 = await relayTransaction(
    tx2.transaction,
    relayPair,
    SolaceSDK.localConnection
  );
  await SolaceSDK.localConnection.confirmTransaction(sig2);
};
