import * as anchor from "@project-serum/anchor";
import axios from "axios";
/** API Service Provider to make API Calls */
export class ApiProvider {
  constructor(private readonly baseUrl: string) {}

  async requestAirdrop(publicKey: anchor.web3.PublicKey) {
    const res = await axios.post(`$baseUrl/wallets/request-airdrop`, {
      data: {
        publicAddress: publicKey.toString(),
        deviceToken: "string",
      },
    });
  }

  async addGuardian(
    user: anchor.web3.PublicKey,
    guardian: anchor.web3.PublicKey
  ) {
    console.log(user.toString(), guardian.toString());
    const res = await axios.post(`${this.baseUrl}/guardian/add`, {
      userAddress: user.toString(),
      guardianAddress: guardian.toString(),
    });
  }

  async removeGuardian(
    user: anchor.web3.PublicKey,
    guardian: anchor.web3.PublicKey
  ) {
    const res = await axios.post(`${this.baseUrl}/guardian/remove`, {
      userAddress: user.toString(),
      guardianAddress: guardian.toString(),
    });
  }

  async getGuardianData(user: anchor.web3.PublicKey) {
    return await axios.post(`${this.baseUrl}/guardian/data`, {
      userAddress: user.toString(),
    });
  }

  async setName(address: string, name: string) {
    return await axios.post("", {
      name,
      address,
    });
  }

  async getName(address: string) {
    return await axios.post("", {
      address,
    });
  }

  async getAddress(name: string) {
    return await axios.post("", {
      name,
    });
  }
}
