import * as anchor from "anchor-rn";
import { SolaceSDK } from "../solace";
import { RelayerIxData } from "../../relayer";
import BN from "bn.js";
import { Solace } from "../../solace/types";
import {
  ApproveGuardianshipData,
  GuardianTimeData,
  RequestWalletInformationData,
} from "../types";
import IDL from "../../solace/idl.json";
import { KeyPair } from "../solace";

export async function fetchGuardianData(this: SolaceSDK) {
  const walletData = await this.fetchWalletData();
  const pendingGuardianData: GuardianTimeData[] = [];
  walletData.pendingGuardians.forEach((guardian, i) => {
    pendingGuardianData.push({
      guardian,
      time: walletData.pendingGuardiansApprovalFrom[i].toNumber(),
    });
  });
  const removingGuardianData: GuardianTimeData[] = [];
  walletData.guardiansToRemove.forEach((guardian, i) => {
    removingGuardianData.push({
      guardian,
      time: walletData.guardiansToRemoveFrom[i].toNumber(),
    });
  });

  return {
    approvedGuardians: walletData.approvedGuardians,
    pendingGuardianData,
    removingGuardianData,
  };
}

/**
 * Add a guardian to the wallet, signed by the owner
 * @param {anchor.web3.PublicKey} guardianPublicKey
 */
export async function addGuardian(
  this: SolaceSDK,
  guardianPublicKey: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey
): Promise<RelayerIxData> {
  const tx = this.program.transaction.addGuardians(guardianPublicKey, {
    accounts: {
      wallet: this.wallet,
      owner: this.owner.publicKey,
    },
    signers: [this.owner],
  });
  return await this.signTransaction(tx, payer);
}

/**
 * FOR - User to remove a guardian
 */
export async function removeGuardian(
  this: SolaceSDK,
  guardianAdress: anchor.web3.PublicKey,
  payer: anchor.web3.PublicKey
): Promise<RelayerIxData> {
  const tx = this.program.transaction.requestRemoveGuardian(guardianAdress, {
    accounts: {
      wallet: this.wallet,
      owner: this.owner.publicKey,
    },
    signers: [this.owner],
  });
  return await this.signTransaction(tx, payer);
}

/**
 * For user
 * Set the guardian threshold
 * The guardian threshold should be lesser than the total number of guardians
 */
export async function setGuardianThreshold(
  this: SolaceSDK,
  threshold: number,
  feePayer: anchor.web3.PublicKey
) {
  const tx = this.program.transaction.setGuardianThreshold(threshold, {
    accounts: {
      wallet: this.wallet,
      owner: this.owner.publicKey,
    },
    signers: [this.owner],
  });
  return this.signTransaction(tx, feePayer);
}

type RecoverWalletData = {
  network: "local" | "testnet";
  programAddress: string;
  username: string;
};

export class SolaceGuardian {
  /**
   * Approve recovery with a solace wallet
   * @param data
   * @param guardianAddress
   * @returns
   */
  static async approveRecoveryByKeypairTx(
    data: RecoverWalletData,
    guardianAddress: string
  ) {
    const provider = new anchor.Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new anchor.Wallet(KeyPair.generate()),
      anchor.Provider.defaultOptions()
    );

    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    const walletToRecover = SolaceSDK.getWalletFromName(
      data.programAddress,
      data.username
    );
    try {
      const walletData = await SolaceSDK.fetchDataForWallet(
        walletToRecover,
        program
      );
      const [recoveryAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
        [
          walletToRecover.toBuffer(),
          // new BN(walletData.walletRecoverySequence).toBuffer("le", 8),
          new BN(walletData.walletRecoverySequence).toArrayLike(
            Buffer,
            "le",
            8
          ),
        ],
        program.programId
      );
      const tx = program.transaction.approveRecoveryByKeypair({
        accounts: {
          walletToRecover: walletToRecover,
          guardian: new anchor.web3.PublicKey(guardianAddress),
          recoveryAttempt: recoveryAddress,
        },
      });
      return {
        tx,
        recoveryAddress,
      };
    } catch (e) {
      throw e;
    }
  }

  /**
   * Use this method to create a transaction which can be signed by the guardian, to approve guardianship to a specific wallet after the wait time has passed
   * @param data {ApproveGuardianshipData} data required to create a approve guardianship transaction
   */
  static approveGuardianshipTx(
    data: ApproveGuardianshipData
  ): anchor.web3.Transaction {
    const provider = new anchor.Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new anchor.Wallet(KeyPair.generate()),
      anchor.Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    return program.transaction.approveGuardianship({
      accounts: {
        wallet: new anchor.web3.PublicKey(data.solaceWalletAddress),
      },
    });
    // In this case, the owner is assumed to be the guardian
  }

  /**
   * @param data {RequestWalletInformationData} data required to init the program and fetch guardian info
   * Static helper method to get only the guardian information of a particular wallet, given the address of the wallet. This method is helpful to know if a particular guardian is guarding any addresses. The data obtained by this function is on-chain and un-modifiable without program calls
   *
   */
  static async getWalletGuardianInfo(data: RequestWalletInformationData) {
    const provider = new anchor.Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new anchor.Wallet(KeyPair.generate()),
      anchor.Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    const wallet = await program.account.wallet.fetch(
      new anchor.web3.PublicKey(data.solaceWalletAddress)
    );
    if (!wallet) {
      throw "Invalid solace wallet address. The SDK could not find a Solace wallet with the given address, on the selected connection cluster";
    }
    return {
      pendingGuardians: wallet.pendingGuardians,
      approvedGuardians: wallet.approvedGuardians,
    };
  }

  static async confirmRemoval(data: ApproveGuardianshipData) {
    const provider = new anchor.Provider(
      data.network == "local"
        ? SolaceSDK.localConnection
        : SolaceSDK.testnetConnection,
      new anchor.Wallet(KeyPair.generate()),
      anchor.Provider.defaultOptions()
    );
    const programId = new anchor.web3.PublicKey(data.programAddress);
    const program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      programId,
      provider
    );
    const wallet = await program.account.wallet.fetch(
      new anchor.web3.PublicKey(data.solaceWalletAddress)
    );
    if (!wallet) {
      throw "Invalid solace wallet address. The SDK could not find a Solace wallet with the given address, on the selected connection cluster";
    }
    return program.instruction.confirmGuardianRemoval(
      new anchor.web3.PublicKey(data.guardianAddress),
      {
        accounts: {
          wallet: new anchor.web3.PublicKey(data.solaceWalletAddress),
        },
      }
    );
  }
}
