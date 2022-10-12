/// For Guardian
/// Approve a Guarded Transfer without executing it

import { Program, Provider, Wallet } from "anchor-rn";
import * as anchor from "anchor-rn";
import { KeyPair, SolaceSDK } from "..";
import { Solace } from "../../solace/types";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { ApproveTransferData } from "../types";
import IDL from "../../solace/idl.json";

export class SolaceApprovals {
  /// Will throw an error if the transfer data is incorrect or alreayd executed
  static async approveGuardedTransfer(data: ApproveTransferData) {
    const provider = new Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new Wallet(KeyPair.generate()),
      Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );

    const wallet = new anchor.web3.PublicKey(data.solaceWalletAddress);
    const transferSeed = new anchor.web3.PublicKey(data.transferKeyAddress);
    const [transferAddress, __] =
      await anchor.web3.PublicKey.findProgramAddress(
        [wallet.toBytes(), transferSeed.toBytes()],
        program.programId
      );
    const tx = program.transaction.approveTransfer({
      accounts: {
        wallet,
        transfer: transferAddress,
        guardian: new anchor.web3.PublicKey(data.guardianAddress),
      },
    });
    return tx;
  }

  /// For Guardian
  /// Approve a specific transfer as a Guardian and execute it
  /// Throws an error if the transfer data is incorrect or transfer is already executed
  static async approveAndExecuteGuardedTransfer(data: ApproveTransferData) {
    const provider = new Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new Wallet(KeyPair.generate()),
      Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    const wallet = new anchor.web3.PublicKey(data.solaceWalletAddress);
    const transferSeed = new anchor.web3.PublicKey(data.transferKeyAddress);
    const [transferAddress, __] =
      await anchor.web3.PublicKey.findProgramAddress(
        [wallet.toBytes(), transferSeed.toBytes()],
        program.programId
      );
    const transferData = await program.account.guardedTransfer.fetch(
      transferAddress
    );
    if (transferData.isSplTransfer) {
      const tx = program.transaction.approveAndExecuteSplTransfer(
        transferSeed,
        {
          accounts: {
            wallet,
            tokenMint: transferData.tokenMint,
            transfer: transferAddress,
            guardian: new anchor.web3.PublicKey(data.guardianAddress),
            tokenAccount: transferData.fromTokenAccount,
            recieverAccount: transferData.to,
            tokenProgram: TOKEN_PROGRAM_ID,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
        }
      );
      return tx;
    } else {
      const tx = program.transaction.approveAndExecuteSolTransfer({
        accounts: {
          wallet,
          transfer: transferAddress,
          guardian: new anchor.web3.PublicKey(data.guardianAddress),
          toAccount: transferData.to,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      });
      return tx;
    }
  }
}
