import { SolaceGuardian } from "./setup/guardian";
import { SolaceApprovals } from "./transfers/approval";

export { SolaceGuardian, SolaceApprovals };

export class SolaceConfig {
  rpcEndpoint: string;
  programId: string;
}

export * from "./solace";

export * from "./solace-v2";

export * from "./solace-core";
