import camelCase from "camelcase";
import * as toml from "toml";
import { PublicKey } from "@solana/web3.js";
import { Program } from "./program";
import { isBrowser } from "./utils/common";
let _populatedWorkspace = false;
/**
 * The `workspace` namespace provides a convenience API to automatically
 * search for and deserialize [[Program]] objects defined by compiled IDLs
 * in an Anchor workspace.
 *
 * This API is for Node only.
 */
const workspace = new Proxy({}, {
});
function attachWorkspaceOverride(workspaceCache, overrideConfig, idlMap) {
    Object.keys(overrideConfig).forEach((programName) => {
        const wsProgramName = camelCase(programName, { pascalCase: true });
        const entry = overrideConfig[programName];
        const overrideAddress = new PublicKey(typeof entry === "string" ? entry : entry.address);
        let idl = idlMap.get(programName);
        if (!idl) {
            throw new Error(`Error loading workspace IDL for ${programName}`);
        }
        workspaceCache[wsProgramName] = new Program(idl, overrideAddress);
    });
}
export default workspace;
//# sourceMappingURL=workspace.js.map