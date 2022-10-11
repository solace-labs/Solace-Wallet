import { assert } from "chai";
import { relayTransaction } from "../src/relayer";
import { SolaceSDK } from "../src/sdk";
import { airdrop, guardian1, relayPair, signer } from "./airdrop";
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
  const guardianInfo = await SolaceSDK.getWalletGuardianInfo({
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
