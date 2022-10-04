import * as anchor from "anchor-rn";
import { assert } from "chai";
import { KeyPair, SolaceSDK } from "../src/sdk";
import { relayTransaction } from "../src/relayer";
import { TokenMint } from "../src/utils/spl-util";
import {
  AccountLayout,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

import signerWallet from "../wallet/signer.json";
import newOwnerWallet from "../wallet/newOwner.json";
import guardian1Wallet from "../wallet/guardian1.json";
import usdcOwnerWallet from "../wallet/usdcOwner.json";
import relayPairWallet from "../wallet/relayPair.json";
import ownerWallet from "../wallet/owner.json";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

const PROGRAM_ADDRESS = "55K8C3FfgRr6Nuwzw5gXV79hQUj3bVRpEPSjoF18HKfh";

const walletName = "name.solace.io2111111111a11121";

const airdrop = async (address: anchor.web3.PublicKey) => {
  const sg = await SolaceSDK.localConnection.requestAirdrop(
    address,
    10000 * LAMPORTS_PER_SOL
  );
  const confirmation = await SolaceSDK.localConnection.confirmTransaction(sg);
};

describe("auto approve and transfer sol after incubation is disabled", () => {
  let signer: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(signerWallet)
  );
  let guardian1: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(guardian1Wallet)
  );
  let newOwner: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(newOwnerWallet)
  );
  let relayPair: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(relayPairWallet)
  );
  let usdcOwner: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(usdcOwnerWallet)
  );
  let owner: anchor.web3.Keypair;
  let seedBase: anchor.web3.Keypair;
  let walletAddress: anchor.web3.PublicKey;

  let guardian2: anchor.web3.Keypair;

  const getWallet = () => solaceSdk.program.account.wallet.fetch(walletAddress);

  let solaceSdk: SolaceSDK;

  before(async () => {
    owner = Keypair.generate();
    seedBase = Keypair.generate();
    guardian2 = Keypair.generate();
    // Configure the client to use the local cluster.
  });

  it("should create a solace wallet", async () => {
    solaceSdk = new SolaceSDK({
      owner: signer,
      network: "local",
      programAddress: PROGRAM_ADDRESS,
    });
    const tx = await solaceSdk.createFromName(walletName, relayPair.publicKey);
    const res = await relayTransaction(
      tx,
      relayPair,
      SolaceSDK.localConnection
    );
    await SolaceSDK.localConnection.confirmTransaction(res);
    walletAddress = solaceSdk.wallet;
    //send SOL to wallet
    await airdrop(walletAddress);
    console.log("created wallet address", walletAddress.toString());
  });

  it("should send SOL to someone random", async () => {
    let info = await SolaceSDK.localConnection.getAccountInfo(
      newOwner.publicKey
    );
    const originBalance = info.lamports;
    const tx = await solaceSdk.requestSolTransfer(
      {
        reciever: newOwner.publicKey,
        amount: 1 * LAMPORTS_PER_SOL,
      },
      relayPair.publicKey
    );
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    info = await SolaceSDK.localConnection.getAccountInfo(newOwner.publicKey);
    const currentBalance = info.lamports;
    assert(currentBalance - originBalance === 1 * LAMPORTS_PER_SOL);
  });

  it("should request for guardianship and be auto-approved", async () => {
    const tx = await solaceSdk.addGuardian(
      guardian1.publicKey,
      relayPair.publicKey
    );
    const sig = await relayTransaction(
      tx,
      relayPair,
      SolaceSDK.localConnection
    );
    await SolaceSDK.localConnection.confirmTransaction(sig);
    let wallet = await getWallet();
    assert(wallet.owner.equals(signer.publicKey), "Wallet not owned by owner");

    // it can be auto - approved because it is in incubation mode.
    const guardianInfo = await SolaceSDK.getWalletGuardianInfo({
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: solaceSdk.program.programId.toString(),
      network: "local",
    });
    assert(guardianInfo.approvedGuardians[0].equals(guardian1.publicKey));
    solaceSdk.fetchWalletData();
  });

  it("should end incubation", async () => {
    const tx = await solaceSdk.endIncubation(relayPair.publicKey);
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  it("2 should send USDC to someone random", async () => {
    const tx = await solaceSdk.requestSolTransfer(
      {
        reciever: newOwner.publicKey,
        amount: 1 * LAMPORTS_PER_SOL,
      },
      relayPair.publicKey
    );
    const sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
  });

  // it("should approve & execute a guarded transfer", async () => {
  //   const ongoingTransfers = await solaceSdk.fetchOngoingTransfers();
  //   assert(ongoingTransfers.length === 1, "should have one ongoing transfer");
  //   console.log(
  //     "ongoing transfer",
  //     ongoingTransfers[0].guardianApprovals[0].guardian.toString()
  //   );
  //   console.log(guardian1.publicKey.toString());

  //   const tx = await SolaceSDK.approveAndExecuteGuardedTransfer({
  //     solaceWalletAddress: solaceSdk.wallet.toString(),
  //     programAddress: PROGRAM_ADDRESS,
  //     guardianAddress: guardian1.publicKey.toString(),
  //     transferKeyAddress: ongoingTransfers[0].seedKey.toString(),
  //     network: "local",
  //   });
  //   const sig = await SolaceSDK.localConnection.sendTransaction(tx, [
  //     guardian1,
  //   ]);
  //   await SolaceSDK.localConnection.confirmTransaction(sig);
  //   const recieverTA = await USDC.getAssociatedTokenAccount(newOwner.publicKey);
  //   const info = await SolaceSDK.localConnection.getAccountInfo(recieverTA);
  //   const data = Buffer.from(info.data);
  //   const accountInfo = AccountLayout.decode(data);
  //   assert(accountInfo.amount.toString() === "102", "Amount mismatch");
  // });
});
