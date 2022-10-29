"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchOngoingTransfers = void 0;
async function fetchOngoingTransfers() {
    const walletData = await this.fetchWalletData();
    const promises = [];
    for (const transfer of walletData.ongoingTransfers) {
        promises.push(this.program.account.guardedTransfer.fetch(transfer));
    }
    const transfers = await Promise.all(promises);
    return transfers.map((transfer) => {
        var _a;
        return ({
            mint: transfer.tokenMint,
            amount: transfer.amount.toNumber(),
            reciever: transfer.to,
            seedKey: transfer.random,
            isSplTransfer: false,
            threshold: transfer.threshold,
            totalApprovals: transfer.approvals.filter((a) => a).length,
            senderTokenAccount: transfer.fromTokenAccount,
            guardianApprovals: (_a = transfer.approvers) === null || _a === void 0 ? void 0 : _a.map((g, i) => ({
                guardian: g,
                isApproved: transfer.approvals[i],
            })),
        });
    });
}
exports.fetchOngoingTransfers = fetchOngoingTransfers;
