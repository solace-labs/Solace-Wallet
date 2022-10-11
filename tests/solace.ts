import {
  doAirdrop,
  guardian1,
  newOwner,
  owner,
  relayPair,
  signer,
  usdcOwner,
} from "./airdrop";
import * as anchor from "anchor-rn";
import { assert } from "chai";
import { KeyPair, SolaceSDK } from "../src/sdk";
import { relayTransaction } from "../src/relayer";
import { TokenMint } from "../src/utils/spl-util";
import {
  acceptRecoveryAndAssignNewOwner,
  addTrustedPubkey,
  endIncubation,
  fetchIncorrectWallet,
  fetchWallet,
  getAllTokenAccounts,
  initateWalletRecovery,
  mintUSDC,
} from "./generic";
import {
  approveAndExecuteGuardedSolTransfer,
  approveAndExecuteGuardedTransfer,
  requestGuardedSOLTransfer,
  requestGuardedSPLTransfer,
  sendUSDC,
} from "./transfers";
import { requestGuardianship } from "./guardianship";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

export const PROGRAM_ADDRESS = "8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U";

export const walletName = "name.solace.io13";
let walletAddress: anchor.web3.PublicKey;
export let solaceSdk: SolaceSDK;
export let USDC: TokenMint;
export const getWallet = () =>
  solaceSdk.program.account.wallet.fetch(walletAddress);

describe("solace", () => {
  const airdrop = async (address: anchor.web3.PublicKey) => {
    const sg = await SolaceSDK.localConnection.requestAirdrop(
      address,

      10 * LAMPORTS_PER_SOL
    );
    await SolaceSDK.localConnection.confirmTransaction(sg);
  };

  // Create a USDC Mint
  const createMint = async () => {
    USDC = await TokenMint.init(SolaceSDK.localConnection, usdcOwner);
    console.log("USDC Mint created", USDC.token.toString());
  };

  before(async () => {
    await doAirdrop();
    await createMint();
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

  it("should fetch an existing wallet, and should have the same addr", async () =>
    await fetchWallet());

  it("should fetch an existing wallet, and should not have the same addr", async () =>
    await fetchIncorrectWallet());

  it("should mint USDC to the smart contract wallet", async () =>
    await mintUSDC());

  it("should get all token accounts owned by the wallet", async () =>
    await getAllTokenAccounts());

  it("should send USDC to someone random", async () => await sendUSDC());

  it("should request for guardianship and be auto-approved", async () =>
    await requestGuardianship());

  it("should add a trusted pubkey", async () => await addTrustedPubkey());

  it("should end incubation", async () => await endIncubation());

  it("should request for a USDC guarded transfer", async () =>
    await requestGuardedSPLTransfer());

  it("should approve & execute a guarded SPL transfer", async () =>
    await approveAndExecuteGuardedTransfer());

  it("should request for a guarded SOL transfer", async () =>
    await requestGuardedSOLTransfer());

  it("should approve & execute a guarded SOL transfer", async () =>
    await approveAndExecuteGuardedSolTransfer());

  it("should initiate wallet recovery", async () =>
    await initateWalletRecovery());

  it("should accept wallet recovery and the new owner should have access to the current wallet", async () =>
    await acceptRecoveryAndAssignNewOwner());

  // // it("should accept the request for guardianship", async () => {
  // //   let wallet = await solaceSdk.fetchWalletData();
  // //   assert(wallet.approvedGuardians.length === 0);
  // //   assert(wallet.pendingGuardians.length === 1);
  // //   assert(wallet.pendingGuardians[0].equals(guardian1.publicKey));
  // //   const tx = SolaceSDK.approveGuardianshipTx({
  // //     guardianAddress: guardian1.publicKey.toString(),
  // //     solaceWalletAddress: solaceSdk.wallet.toString(),
  // //     programAddress: solaceSdk.program.programId.toString(),
  // //     network: "local",
  // //   });
  // //   const confs = await solaceSdk.program.provider.connection.sendTransaction(
  // //     tx,
  // //     [guardian1]
  // //   );
  // //   await solaceSdk.program.provider.connection.confirmTransaction(confs);
  // //   wallet = await solaceSdk.fetchWalletData();
  // //   assert(wallet.approvedGuardians.length === 1);
  // //   assert(wallet.pendingGuardians.length === 0);
  // //   assert(wallet.approvedGuardians[0].equals(guardian1.publicKey));
  // // });

  /**

  it("should remove an approved guardian", async () => {
    await solaceSdk.removeGuardian(guardian1.publicKey, relayPair.publicKey);
    const wallet = await getWallet();
    assert(
      wallet.approvedGuardians.length === 0,
      "The number of approved guardians should be 0"
    );
  });

  it("guardian should approve the recovery, and the wallet should be recovered to the new owner", async () => {
    let sdk2 = new SolaceSDK({
      owner: guardian1,
      network: "local",
      programAddress: "8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U",
    });
    let wallet = await getWallet();
    await sdk2.approveRecoveryByKeypair(walletAddress);
    wallet = await getWallet();
    assert(
      wallet.owner.toString() === newOwner.publicKey.toString(),
      "The owner of the wallet should be the new owner"
    );
  });
  */
});
