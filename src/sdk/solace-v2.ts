/**
 * This is the client SDK, to be used on dApps
 */
import { SolanaWallet } from "@web3auth/solana-provider";
import { Solace, IDL } from "../solace/types";
import * as anchor from "anchor-rn";
import { RelayerIxData } from "../relayer";
import bs58 from "bs58";
import { SolaceConfig, SolaceSDK } from ".";

// Constructor
// Connect to wallet
// Request sign
// Request approval
// SignOnBehalf
export class SolaceV2 {
  program: anchor.Program<Solace>;
  ownerPublicKey: anchor.web3.PublicKey;
  solaceWalletPublicKey: anchor.web3.PublicKey;
  isConnected: boolean;

  constructor(
    private solaceWallet: anchor.web3.PublicKey,
    private ek: anchor.web3.Keypair,
    config: SolaceConfig
  ) {
    const provider = new anchor.Provider(
      new anchor.web3.Connection(config.rpcEndpoint),
      new anchor.Wallet(anchor.web3.Keypair.generate()),
      anchor.Provider.defaultOptions()
    );
    // Check if the wallet is actually a Solace wallet
    this.program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      config.programId,
      provider
    );
    anchor.setProvider(provider);
  }

  // Idk what to do. Connect some how
  async connect(): Promise<boolean> {
    // 1. Fetch the wallet data
    const walletData = await SolaceSDK.fetchDataForWallet(
      this.solaceWallet,
      this.program
    );

    // 2. Check if the wallet has the current EK in one of the registered dApp list
    const ekIndex = walletData.externalEks.indexOf(this.ek.publicKey);
    if (ekIndex === -1) {
      this.isConnected = false;
      return false;
    }
    // 3. Check if the expiry has passed
    // TODO
    this.isConnected = true;
    return true;
  }

  // Request the core wallet for a signature
  requestSign() {}

  // Request for approval for a particular smart contract
  requestApproval() {}

  //
  signOnBehalf() {}
}
