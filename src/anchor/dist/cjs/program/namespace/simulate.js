"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context");
const event_1 = require("../event");
const error_1 = require("../../error");
class SimulateFactory {
    static build(idlIx, txFn, idlErrors, provider, coder, programId, idl) {
        const simulate = async (...args) => {
            const tx = txFn(...args);
            const [, ctx] = (0, context_1.splitArgsAndCtx)(idlIx, [...args]);
            let resp = undefined;
            try {
                resp = await provider.simulate(tx, ctx.signers, ctx.options);
            }
            catch (err) {
                console.log("Translating error", err);
                let translatedErr = error_1.ProgramError.parse(err, idlErrors);
                if (translatedErr === null) {
                    throw err;
                }
                throw translatedErr;
            }
            if (resp === undefined) {
                throw new Error("Unable to simulate transaction");
            }
            if (resp.value.err) {
                throw new Error(`Simulate error: ${resp.value.err.toString()}`);
            }
            const logs = resp.value.logs;
            if (!logs) {
                throw new Error("Simulated logs not found");
            }
            const events = [];
            if (idl.events) {
                let parser = new event_1.EventParser(programId, coder);
                parser.parseLogs(logs, (event) => {
                    events.push(event);
                });
            }
            return { events, raw: logs };
        };
        return simulate;
    }
}
exports.default = SimulateFactory;
//# sourceMappingURL=simulate.js.map