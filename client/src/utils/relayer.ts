import axios from 'axios';
import {KeyPair, PublicKey, SolaceSDK} from 'solace-sdk';
import {relayTransaction as rlTransaction} from 'solace-sdk/relayer';
import {
  LAMPORTS_PER_SOL,
  myPrivateKey,
  NETWORK,
} from '../state/contexts/GlobalContext';

const baseUrl = 'https://rxc9xav4nk.execute-api.ap-south-1.amazonaws.com';

interface RequestGuardianshipBody {
  guardianAddress: string;
  solaceWalletAddress: string;
  walletName: string;
}

/**
 * Get meta information of the url
 * @param accessToken
 */
export const getMeta = async (accessToken: string) => {
  return (
    await axios.get<{feePayer: any; clusterUrl: string}>(`${baseUrl}/meta`, {
      headers: {Authorization: accessToken},
    })
  ).data;
};

/**
 * Request airdrop
 * @param publicKey
 * @param accessToken
 * @returns
 */
export const airdrop = async (publicKey: string, accessToken: string) => {
  try {
    if (NETWORK === 'local') {
      return await SolaceSDK.localConnection.requestAirdrop(
        new PublicKey(publicKey),
        LAMPORTS_PER_SOL,
      );
    }
    const res = await axios.post(
      `${baseUrl}/airdrop`,
      {
        publicKey,
      },
      {
        headers: {Authorization: accessToken},
      },
    );
    return res.data;
  } catch (e) {
    console.log('ERROR', e);
  }
};

/**
 * Relay a transaction
 * @param tx
 * @param accessToken
 * @returns
 */
export const relayTransaction = async (tx: any, accessToken: string) => {
  if (NETWORK === 'local') {
    const keypair = KeyPair.fromSecretKey(Uint8Array.from(myPrivateKey));
    return await rlTransaction(tx, keypair);
  }
  const res = await axios.post(`${baseUrl}/relay`, tx, {
    headers: {Authorization: accessToken},
  });
  return res.data;
};

/**
 * Request for guardianship
 * @param {RequestGuardianshipBody} data
 * @param accessToken
 * @returns
 */
export const requestGuardian = async (
  data: RequestGuardianshipBody,
  accessToken: string,
) => {
  return await axios.post(`${baseUrl}/guardian/request`, data, {
    headers: {Authorization: accessToken},
  });
};
