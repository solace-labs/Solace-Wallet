import * as anchor from "anchor-rn";
import { assert } from "chai";
import { KeyPair, SolaceSDK } from "../src/sdk";
import { relayTransaction } from "../src/relayer";
import signerWallet from "../wallet/signer.json";
import guardian1Wallet from "../wallet/guardian1.json";
import relayPairWallet from "../wallet/relayPair.json";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

const PROGRAM_ADDRESS = "8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U";

const walletName = "name.solace.io11111111111111";

describe("check guardian functionalities", () => {
  let signer: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(signerWallet)
  );
  let guardian1: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(guardian1Wallet)
  );
  let relayPair: anchor.web3.Keypair = Keypair.fromSecretKey(
    Uint8Array.from(relayPairWallet)
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
  });

  it("should request for guardianship and be auto-approved", async () => {
    let tx = await solaceSdk.addGuardian(
      guardian1.publicKey,
      relayPair.publicKey
    );
    let sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    let wallet = await getWallet();
    assert(wallet.owner.equals(signer.publicKey), "Wallet not owned by owner");

    // it can be auto - approved because it is in incubation mode.
    let guardianInfo = await SolaceSDK.getWalletGuardianInfo({
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: solaceSdk.program.programId.toString(),
      network: "local",
    });
    assert(guardianInfo.approvedGuardians[0].equals(guardian1.publicKey));
    solaceSdk.fetchWalletData();

    // add another guardian
    tx = await solaceSdk.addGuardian(guardian2.publicKey, relayPair.publicKey);
    sig = await relayTransaction(tx, relayPair, SolaceSDK.localConnection);
    await SolaceSDK.localConnection.confirmTransaction(sig);

    // it can be auto - approved because it is in incubation mode.
    guardianInfo = await SolaceSDK.getWalletGuardianInfo({
      solaceWalletAddress: solaceSdk.wallet.toString(),
      programAddress: solaceSdk.program.programId.toString(),
      network: "local",
    });
    assert(guardianInfo.approvedGuardians[1].equals(guardian2.publicKey));
    assert(guardianInfo.approvedGuardians.length === 2);
    solaceSdk.fetchWalletData();
  });

  it("set threshold", async () => {
    /// if we use the other number, we will get an error.
    let tx = await solaceSdk.setGuardianThreshold(1, relayPair.publicKey);
    let sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    let wallet = await getWallet();
    assert(wallet.approvalThreshold === 1);

    tx = await solaceSdk.setGuardianThreshold(2, relayPair.publicKey);
    sig = await relayTransaction(tx, relayPair);
    await SolaceSDK.localConnection.confirmTransaction(sig);
    wallet = await getWallet();
    assert(wallet.approvalThreshold === 2);
  });
});
