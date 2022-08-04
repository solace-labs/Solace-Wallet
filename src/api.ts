import * as anchor from "./anchor";
import axios from "axios";
/** API Service Provider to make API Calls */

export class ApiProvider {
  constructor(private readonly baseUrl: string) {}

  async requestAirdrop(publicKey: anchor.web3.PublicKey) {
    try {
      const res = await axios.post(`${this.baseUrl}/wallets/request-airdrop`, {
        data: {
          publicAddress: publicKey.toString(),
          deviceToken: "string",
        },
      });
    } catch (e) {
      console.log("API Failed - 1");
    }
  }

  async addGuardian(
    user: anchor.web3.PublicKey,
    guardian: anchor.web3.PublicKey
  ) {
    try {
      const res = await axios.post(`${this.baseUrl}/guardian/add`, {
        userAddress: user.toString(),
        guardianAddress: guardian.toString(),
      });
    } catch (e) {
      console.log("API Failed - 2");
    }
  }

  async removeGuardian(
    user: anchor.web3.PublicKey,
    guardian: anchor.web3.PublicKey
  ) {
    try {
      const res = await axios.post(`${this.baseUrl}/guardian/remove`, {
        userAddress: user.toString(),
        guardianAddress: guardian.toString(),
      });
    } catch (e) {
      console.log("API Failed - 3");
    }
  }

  async getGuardianData(user: anchor.web3.PublicKey) {
    try {
      const res = await axios.post(`${this.baseUrl}/guardian/data`, {
        userAddress: user.toString(),
      });
      return res.data.data;
    } catch (e) {
      console.log("API Failed - 3");
    }
  }

  async setName(address: string, name: string) {
    try {
      const res = await axios.post(`${this.baseUrl}/name/set`, {
        name,
        address,
      });
    } catch (e) {
      console.log("API Failed - 4");
    }
  }

  async getName(address: string) {
    try {
      const res = await axios.post(`${this.baseUrl}/name/get/name`, {
        address,
      });
      return res.data.data;
    } catch (e) {
      console.log("API Failed - 5");
    }
  }

  async getAddress(name: string) {
    try {
      const res = await axios.post(`${this.baseUrl}/name/get/address`, {
        name,
      });
      return res.data.data;
    } catch (e) {
      console.log("API Failed - 6");
    }
  }
}
