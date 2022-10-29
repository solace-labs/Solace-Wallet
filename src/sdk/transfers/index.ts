import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";
import { OngoingTransfer } from "../types";

export async function fetchOngoingTransfers(
  this: SolaceSDK
): Promise<OngoingTransfer[]> {
  const walletData = await this.fetchWalletData();
  const promises = [];
  for (const transfer of walletData.ongoingTransfers) {
    promises.push(this.program.account.guardedTransfer.fetch(transfer));
  }
  const transfers: Awaited<
    ReturnType<typeof this.program.account.guardedTransfer.fetch>
  >[] = await Promise.all(promises);

  return transfers.map((transfer) => ({
    mint: transfer.tokenMint as anchor.web3.PublicKey,
    amount: transfer.amount.toNumber(),
    reciever: transfer.to as anchor.web3.PublicKey,
    seedKey: transfer.random as anchor.web3.PublicKey,
    isSplTransfer: false,
    threshold: transfer.threshold,
    totalApprovals: (transfer.approvals as boolean[]).filter((a) => a).length,
    senderTokenAccount: transfer.fromTokenAccount as anchor.web3.PublicKey,
    guardianApprovals: transfer.approvers?.map((g, i) => ({
      guardian: g,
      isApproved: transfer.approvals[i],
    })),
  }));
}
