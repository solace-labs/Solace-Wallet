import signerWallet from "../wallet/signer.json";
import newOwnerWallet from "../wallet/newOwner.json";
import guardian1Wallet from "../wallet/guardian1.json";
import usdcOwnerWallet from "../wallet//usdcOwner.json";
import relayPairWallet from "../wallet/relayPair.json";
import mainWallet from "../wallet/id.json";
import * as anchor from "anchor-rn";
const { Keypair, LAMPORTS_PER_SOL } = anchor.web3;
import { SolaceSDK } from "../src/sdk";

const airdrop = async (address: anchor.web3.PublicKey) => {
  const sg = await SolaceSDK.localConnection.requestAirdrop(
    address,
    10000 * LAMPORTS_PER_SOL
  );
  const confirmation = await SolaceSDK.localConnection.confirmTransaction(sg);
};

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
let main: anchor.web3.Keypair = Keypair.fromSecretKey(
  Uint8Array.from(mainWallet)
);
const airdropSol = async () => {
  console.log("airdrop SOL to wallet!!!");
  console.log(main.publicKey.toString());
  console.log(signer.publicKey.toString());
  await Promise.all([
    airdrop(signer.publicKey),
    airdrop(relayPair.publicKey),
    airdrop(newOwner.publicKey),
    airdrop(usdcOwner.publicKey),
    airdrop(guardian1.publicKey),
    airdrop(main.publicKey),
  ]);
  console.log("airdrop is finished.");
};

airdropSol();
