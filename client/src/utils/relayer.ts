import axios from 'axios';

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
    const data = await axios.post(
      `${baseUrl}/airdrop`,
      {
        publicKey,
      },
      {
        headers: {Authorization: accessToken},
      },
    );
    return data;
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
  return await axios.post(`${baseUrl}/relay`, tx, {
    headers: {Authorization: accessToken},
  });
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
