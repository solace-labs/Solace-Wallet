import { Injectable } from '@nestjs/common';
import { Solace } from '../common/types/solace';
import * as anchor from '@project-serum/anchor';
import { Program, Idl } from '@project-serum/anchor';
import * as fs from 'fs';
import { findProgramAddressSync } from '@project-serum/anchor/dist/cjs/utils/pubkey';
const { PublicKey, Keypair, Connection, clusterApiUrl } = anchor.web3;

const solaceIdl = JSON.parse(
  fs.readFileSync('src/common/idl/solace.json', 'utf-8'),
);

/**
 *
 **/
@Injectable()
export class WalletsService {
  program: Program<Solace>;
  signer: anchor.web3.Keypair;
  programId: anchor.web3.PublicKey;
  rootWallet: anchor.Wallet;
  rootKeyPair: anchor.web3.Keypair;
  connection: anchor.web3.Connection;

  constructor() {
    // anchor.setProvider(anchor.AnchorProvider())

    this.connection = new Connection('https://api.testnet.solana.com');
  }

  async requestAirdrop(publicKey: string) {
    const sg = await this.connection.requestAirdrop(
      new PublicKey(publicKey),
      0.1 * anchor.web3.LAMPORTS_PER_SOL,
    );
    return await this.connection.confirmTransaction(sg);
  }
}
