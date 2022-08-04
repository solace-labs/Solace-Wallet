import { TransactionSignature } from "@solana/web3.js";
import Provider from "../../provider";
import { Idl } from "../../idl";
import { TransactionFn } from "./transaction";
import { AllInstructions, InstructionContextFn, MakeInstructionsNamespace } from "./types";
export default class RpcFactory {
    static build<IDL extends Idl, I extends AllInstructions<IDL>>(idlIx: I, txFn: TransactionFn<IDL, I>, idlErrors: Map<number, string>, provider: Provider): RpcFn;
}
/**
 * The namespace provides async methods to send signed transactions for each
 * *non*-state method on Anchor program.
 *
 * Keys are method names, values are RPC functions returning a
 * [[TransactionInstruction]].
 *
 * ## Usage
 *
 * ```javascript
 * rpc.<method>(...args, ctx);
 * ```
 *
 * ## Parameters
 *
 * 1. `args` - The positional arguments for the program. The type and number
 *    of these arguments depend on the program being used.
 * 2. `ctx`  - [[Context]] non-argument parameters to pass to the method.
 *    Always the last parameter in the method call.
 * ```
 *
 * ## Example
 *
 * To send a transaction invoking the `increment` method above,
 *
 * ```javascript
 * const txSignature = await program.rpc.increment({
 *   accounts: {
 *     counter,
 *     authority,
 *   },
 * });
 * ```
 */
export declare type RpcNamespace<IDL extends Idl = Idl, I extends AllInstructions<IDL> = AllInstructions<IDL>> = MakeInstructionsNamespace<IDL, I, Promise<TransactionSignature>>;
/**
 * RpcFn is a single RPC method generated from an IDL, sending a transaction
 * paid for and signed by the configured provider.
 */
export declare type RpcFn<IDL extends Idl = Idl, I extends AllInstructions<IDL> = AllInstructions<IDL>> = InstructionContextFn<IDL, I, Promise<TransactionSignature>>;
//# sourceMappingURL=rpc.d.ts.map