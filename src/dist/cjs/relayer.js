"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.relayTransaction = void 0;
/**
 * This file acts as a mock relayer to test out various SDK Functions
 */
const anchor_rn_1 = require("anchor-rn");
const bs58_1 = __importDefault(require("bs58"));
/**
 * Relay a given transaction data on to the blockchain, while paying for gas
 */
const relayTransaction = async (data, payer, connection) => {
    connection = new anchor_rn_1.web3.Connection("http://127.0.0.1:8899");
    const transaction = anchor_rn_1.web3.Transaction.populate(anchor_rn_1.web3.Message.from(Buffer.from(data.message, "base64")));
    if (data.publicKey && data.signature)
        transaction.addSignature(new anchor_rn_1.web3.PublicKey(data.publicKey), Buffer.from(bs58_1.default.decode(data.signature)));
    transaction.partialSign(payer);
    const res = await connection.sendEncodedTransaction(transaction.serialize().toString("base64"));
    // TODO: Update to the latest API
    // const confirmation = await connection.confirmTransaction(res);
    // console.log("Confirmed", confirmation);
    return res;
};
exports.relayTransaction = relayTransaction;
