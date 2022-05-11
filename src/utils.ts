import { AnchorProvider, Program } from "@project-serum/anchor";
import { Solace } from "../target/types/solace";

export class Utils {
  constructor(
    private readonly anchorProvider: AnchorProvider,
    private readonly program: Program<Solace>
  ) {}
}
