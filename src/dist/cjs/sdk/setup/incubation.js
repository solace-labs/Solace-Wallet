"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIncubation = exports.endIncubation = void 0;
/// For User
/// End the incubation period for the user
function endIncubation(feePayer) {
    const tx = this.program.transaction.endIncubation({
        accounts: {
            wallet: this.wallet,
            owner: this.owner.publicKey,
        },
    });
    return this.signTransaction(tx, feePayer);
}
exports.endIncubation = endIncubation;
/**
 * Check if the wallet is in incubation mode or not
 *
 */
async function checkIncubation(data) {
    const incubationEnd = new Date(data.createdAt.toNumber());
    incubationEnd.setHours(incubationEnd.getHours() + 12);
    const now = new Date().getTime() / 1000;
    if (now < incubationEnd.getTime()) {
        return data.incubationMode;
    }
    return false;
}
exports.checkIncubation = checkIncubation;
