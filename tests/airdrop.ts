import { Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import * as anchor from "anchor-rn";
import { SolaceSDK } from "../src/sdk";

export const airdrop = async (address: anchor.web3.PublicKey) => {
  const sg = await SolaceSDK.localConnection.requestAirdrop(
    address,

    10 * LAMPORTS_PER_SOL
  );
  await SolaceSDK.localConnection.confirmTransaction(sg);
};

export let owner: anchor.web3.Keypair;
export let signer: anchor.web3.Keypair;
export let seedBase: anchor.web3.Keypair;

export let guardian1: anchor.web3.Keypair;
export let guardian2: anchor.web3.Keypair;
export let newOwner: anchor.web3.Keypair;
export let relayPair: anchor.web3.Keypair;
export let usdcOwner: anchor.web3.Keypair;

owner = Keypair.generate();
seedBase = Keypair.generate();
signer = Keypair.generate();
guardian1 = Keypair.generate();
guardian2 = Keypair.generate();
newOwner = Keypair.generate();
relayPair = Keypair.generate();
usdcOwner = Keypair.generate();

export const doAirdrop = async () => {
  await Promise.all([
    airdrop(signer.publicKey),
    airdrop(relayPair.publicKey),
    airdrop(newOwner.publicKey),
    airdrop(usdcOwner.publicKey),
    airdrop(guardian1.publicKey),
  ]);
  console.log("Airdrop Complete");
};
