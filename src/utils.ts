import { AnchorProvider, Program } from "@project-serum/anchor";
import { Solace } from "./solace/types";

export class Utils {
  constructor(private readonly program: Program<Solace>) {}
}
