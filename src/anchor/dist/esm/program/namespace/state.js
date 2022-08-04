import EventEmitter from "eventemitter3";
import camelCase from "camelcase";
import { SystemProgram, } from "@solana/web3.js";
import Coder, { stateDiscriminator } from "../../coder";
import { getProvider } from "../../";
import { validateAccounts, parseIdlErrors } from "../common";
import { findProgramAddressSync, createWithSeedSync } from "../../utils/pubkey";
import InstructionNamespaceFactory from "./instruction";
import RpcNamespaceFactory from "./rpc";
import TransactionNamespaceFactory from "./transaction";
export default class StateFactory {
    static build(idl, coder, programId, provider) {
        if (idl.state === undefined) {
            return undefined;
        }
        return new StateClient(idl, programId, provider, coder);
    }
}
/**
 * A client for the program state. Similar to the base [[Program]] client,
 * one can use this to send transactions and read accounts for the state
 * abstraction.
 */
export class StateClient {
    constructor(idl, programId, 
    /**
     * Returns the client's wallet and network provider.
     */
    provider = getProvider(), 
    /**
     * Returns the coder.
     */
    coder = new Coder(idl)) {
        this.provider = provider;
        this.coder = coder;
        this._idl = idl;
        this._programId = programId;
        this._address = programStateAddress(programId);
        this._sub = null;
        // Build namespaces.
        const [instruction, transaction, rpc] = (() => {
            var _a;
            let instruction = {};
            let transaction = {};
            let rpc = {};
            (_a = idl.state) === null || _a === void 0 ? void 0 : _a.methods.forEach((m) => {
                // Build instruction method.
                const ixItem = InstructionNamespaceFactory.build(m, (ixName, ix) => coder.instruction.encodeState(ixName, ix), programId);
                ixItem["accounts"] = (accounts) => {
                    const keys = stateInstructionKeys(programId, provider, m, accounts);
                    return keys.concat(InstructionNamespaceFactory.accountsArray(accounts, m.accounts));
                };
                // Build transaction method.
                const txItem = TransactionNamespaceFactory.build(m, ixItem);
                // Build RPC method.
                const rpcItem = RpcNamespaceFactory.build(m, txItem, parseIdlErrors(idl), provider);
                // Attach them all to their respective namespaces.
                const name = camelCase(m.name);
                instruction[name] = ixItem;
                transaction[name] = txItem;
                rpc[name] = rpcItem;
            });
            return [
                instruction,
                transaction,
                rpc,
            ];
        })();
        this.instruction = instruction;
        this.transaction = transaction;
        this.rpc = rpc;
    }
    /**
     * Returns the program ID owning the state.
     */
    get programId() {
        return this._programId;
    }
    /**
     * Returns the deserialized state account.
     */
    async fetch() {
        const addr = this.address();
        const accountInfo = await this.provider.connection.getAccountInfo(addr);
        if (accountInfo === null) {
            throw new Error(`Account does not exist ${addr.toString()}`);
        }
        // Assert the account discriminator is correct.
        const state = this._idl.state;
        if (!state) {
            throw new Error("State is not specified in IDL.");
        }
        const expectedDiscriminator = await stateDiscriminator(state.struct.name);
        if (expectedDiscriminator.compare(accountInfo.data.slice(0, 8))) {
            throw new Error("Invalid account discriminator");
        }
        return this.coder.state.decode(accountInfo.data);
    }
    /**
     * Returns the state address.
     */
    address() {
        return this._address;
    }
    /**
     * Returns an `EventEmitter` with a `"change"` event that's fired whenever
     * the state account cahnges.
     */
    subscribe(commitment) {
        if (this._sub !== null) {
            return this._sub.ee;
        }
        const ee = new EventEmitter();
        const listener = this.provider.connection.onAccountChange(this.address(), (acc) => {
            const account = this.coder.state.decode(acc.data);
            ee.emit("change", account);
        }, commitment);
        this._sub = {
            ee,
            listener,
        };
        return ee;
    }
    /**
     * Unsubscribes to state changes.
     */
    unsubscribe() {
        if (this._sub !== null) {
            this.provider.connection
                .removeAccountChangeListener(this._sub.listener)
                .then(async () => {
                this._sub = null;
            })
                .catch(console.error);
        }
    }
}
// Calculates the deterministic address of the program's "state" account.
function programStateAddress(programId) {
    let [registrySigner] = findProgramAddressSync([], programId);
    return createWithSeedSync(registrySigner, "unversioned", programId);
}
// Returns the common keys that are prepended to all instructions targeting
// the "state" of a program.
function stateInstructionKeys(programId, provider, m, accounts) {
    if (m.name === "new") {
        // Ctor `new` method.
        const [programSigner] = findProgramAddressSync([], programId);
        return [
            {
                pubkey: provider.wallet.publicKey,
                isWritable: false,
                isSigner: true,
            },
            {
                pubkey: programStateAddress(programId),
                isWritable: true,
                isSigner: false,
            },
            { pubkey: programSigner, isWritable: false, isSigner: false },
            {
                pubkey: SystemProgram.programId,
                isWritable: false,
                isSigner: false,
            },
            { pubkey: programId, isWritable: false, isSigner: false },
        ];
    }
    else {
        validateAccounts(m.accounts, accounts);
        return [
            {
                pubkey: programStateAddress(programId),
                isWritable: true,
                isSigner: false,
            },
        ];
    }
}
//# sourceMappingURL=state.js.map