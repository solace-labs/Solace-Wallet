import camelCase from "camelcase";
import * as toml from "toml";
import { PublicKey } from "@solana/web3.js";
import { Program } from "./program";
import { Idl } from "./idl";
import { isBrowser } from "./utils/common";

let _populatedWorkspace = false;

/**
 * The `workspace` namespace provides a convenience API to automatically
 * search for and deserialize [[Program]] objects defined by compiled IDLs
 * in an Anchor workspace.
 *
 * This API is for Node only.
 */
const workspace = new Proxy({} as any, {});

function attachWorkspaceOverride(
  workspaceCache: { [key: string]: Program },
  overrideConfig: { [key: string]: string | { address: string; idl?: string } },
  idlMap: Map<string, Idl>
) {}

export default workspace;
