import { SolanaWallet } from "@web3auth/solana-provider";
import { Solace, IDL } from "../solace/types";
import * as anchor from "anchor-rn";
import { RelayerIxData } from "../relayer";
import bs58 from "bs58";
import { SolaceConfig } from ".";

// Constructor
// SignTx
// SignMFA
export class SolaceCore {
  program: anchor.Program<Solace>;
  ownerPublicKey: anchor.web3.PublicKey;
  solaceWalletPublicKey: anchor.web3.PublicKey;

  constructor(private wallet: SolanaWallet, config: SolaceConfig) {
    const provider = new anchor.Provider(
      new anchor.web3.Connection(config.rpcEndpoint),
      new anchor.Wallet(anchor.web3.Keypair.generate()),
      anchor.Provider.defaultOptions()
    );
    this.program = new anchor.Program<Solace>(
      // @ts-ignore
      IDL,
      config.programId,
      provider
    );
    anchor.setProvider(provider);
    wallet.requestAccounts().then((accounts) => {
      this.ownerPublicKey = new anchor.web3.PublicKey(accounts[0]);
    });
  }

  signTransaction = async function (
    transaction: anchor.web3.Transaction,
    payer: anchor.web3.PublicKey,
    noOwner?: boolean
  ): Promise<RelayerIxData> {
    const x = await anchor.getProvider().connection.getLatestBlockhash();
    const tx = new anchor.web3.Transaction({
      ...x,
      feePayer: payer,
    });
    tx.add(transaction);
    let signature: any;
    if (!noOwner) {
      await this.wallet.signTransaction(tx);
      // tx.partialSign(this.owner);
      signature = tx.signatures[1].signature;
    }
    return {
      signature: noOwner ? null : bs58.encode(signature),
      publicKey: noOwner ? null : this.ownerPublicKey.toString(),
      message: tx.compileMessage().serialize().toString("base64"),
      blockHash: {
        blockhash: x.blockhash,
        lastValidBlockHeight: x.lastValidBlockHeight,
      },
    };
  };

  async createWallet(name: string, feePayer: anchor.web3.PublicKey) {
    const [walletAddress, _] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("SOLACE"), Buffer.from(name, "utf8")],
      this.program.programId
    );

    console.log("Owner Address", this.ownerPublicKey.toString());

    const tx = this.program.transaction.createWallet(
      this.ownerPublicKey, // Owner
      [], // Guardian
      // 0, // Guardian Approval Threshold
      name,
      {
        accounts: {
          signer: this.ownerPublicKey,
          rentPayer: feePayer,
          wallet: walletAddress,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      }
    );
    this.solaceWalletPublicKey = walletAddress;
    return await this.signTransaction(tx, feePayer);
  }

  async addGuardian(
    guardianPublicKey: anchor.web3.PublicKey,
    feePayer: anchor.web3.PublicKey
  ) {
    const tx = this.program.transaction.addGuardians(guardianPublicKey, {
      accounts: {
        wallet: this.solaceWalletPublicKey,
        owner: this.ownerPublicKey,
      },
    });
    const signedTx = await this.wallet.signTransaction(tx);
    return await this.signTransaction(signedTx, feePayer);
  }
}
