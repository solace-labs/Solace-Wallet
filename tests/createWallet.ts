import * as anchor from "anchor-rn";
import { assert } from "chai";
import { SolaceSDK } from "../src/sdk";
import { relayTransaction } from "../src/relayer";

const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;

const PROGRAM_ADDRESS = "55K8C3FfgRr6Nuwzw5gXV79hQUj3bVRpEPSjoF18HKfh";

const walletName = "name.solace.io1511";

describe("create wallet", () => {
  let owner: anchor.web3.Keypair;
  let signer: anchor.web3.Keypair;
  let walletAddress: anchor.web3.PublicKey;

  let relayPair: anchor.web3.Keypair;

  const airdrop = async (address: anchor.web3.PublicKey) => {
    const sg = await SolaceSDK.localConnection.requestAirdrop(
      address,

      10 * LAMPORTS_PER_SOL
    );
    const confirmation = await SolaceSDK.localConnection.confirmTransaction(sg);
  };

  let solaceSdk: SolaceSDK;

  before(async () => {
    owner = Keypair.generate();
    signer = Keypair.generate();
    relayPair = Keypair.generate();
    await Promise.all([
      airdrop(signer.publicKey),
      airdrop(relayPair.publicKey),
    ]);
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

  it("should fetch an existing wallet, and should have the same addr", async () => {
    const _sdk = SolaceSDK.retrieveFromName(walletName, {
      programAddress: PROGRAM_ADDRESS,
      owner,
      network: "local",
    });
    assert((await _sdk).wallet.equals(solaceSdk.wallet));
  });

  it("should fetch an existing wallet, and should not have the same addr", async () => {
    const _sdk = SolaceSDK.retrieveFromName("random.solace.io", {
      programAddress: PROGRAM_ADDRESS,
      owner,
      network: "local",
    });
    assert(!(await _sdk).wallet.equals(solaceSdk.wallet));
  });
});
