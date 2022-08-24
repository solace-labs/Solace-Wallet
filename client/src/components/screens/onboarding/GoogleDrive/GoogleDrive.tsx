import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {
  setAccountStatus,
  setGoogleApi,
  setUser,
} from '../../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {PublicKey, SolaceSDK} from 'solace-sdk';
import {encryptKey} from '../../../../utils/aes_encryption';
import {GoogleApi} from '../../../../utils/google_apis';
import {showMessage} from 'react-native-flash-message';
import {airdrop, getMeta, relayTransaction} from '../../../../utils/relayer';

const enum status {
  AIRDROP_REQUESTED = 'AIRDROP_REQUESTED',
  AIRDROP_COMPLETED = 'AIRDROP_COMPLETED',
  AIRDROP_CONFIRMAION = 'AIRDROP_CONFIRMATION',
  CONFIRMATION_TIMEOUT = 'CONFIRMATION_TIMEOUT',
  RETRY_CONFIRMATION = 'RETRY_CONFIRMATION',
  WALLET_CREATION = 'WALLET_CREATION',
  WALLET_CONFIRMED = 'WALLET_CONFIRMED',
}

const GoogleDriveScreen: React.FC = () => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [tokens, setTokens] = useLocalStorage('tokens', {});
  const [created, setCreated] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status.AIRDROP_REQUESTED);
  const [airdropConfirmed, setAirdropConfirmed] = useState(false);
  const [loading, setLoading] = useState({
    value: false,
    message: 'enable now',
  });

  /**
   * Setting to local storage
   */
  const setToLocalStorage = useCallback(async () => {
    await setStoredUser(state.user);
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  }, [setStoredUser, state.user, dispatch]);

  const handleClick = async () => {
    try {
      const keypair = SolaceSDK.newKeyPair();
      const {secretKey, publicKey} = keypair;
      const secretKeyString = secretKey.toString();
      const publicKeyString = publicKey.toString();
      const accessToken = tokens.accesstoken;
      /** Google Drive Storage of Private Key and Solace Name */
      console.log('STORING');
      // await storeToGoogleDrive(secretKeyString);
      console.log('STORED');
      /** Requesting Airdrop */
      console.log('REQUESTING');
      const data = await requestAirdrop(publicKeyString, accessToken);
      console.log('REQUESTED');
      console.log('AIRDROP CONFIRMATION');
      /** Airdrop confirmation */
      await confirmTransaction(data);
      console.log('AIRDROP CONFIRMED');
      /** Getting Fee Payer */
      console.log('GETTING FEE PAYER');
      const feePayer = new PublicKey(await getFeePayer(accessToken));
      console.log('FEE PAYER FETCHED');
      /** Creating wallet for the user */
      console.log('CREATING WALLET');
      await createWallet(keypair, feePayer, accessToken);
      console.log('WALLET CREATED');
    } catch (e) {
      console.log(e);
    }
  };

  const storeToGoogleDrive = async (secretKey: string) => {
    try {
      const googleApi: GoogleApi = new GoogleApi();
      setLoading({
        value: true,
        message: 'storing...',
      });
      await googleApi.signIn();
      await googleApi.setDrive();
      dispatch(setGoogleApi(googleApi));
      const pin = state?.user?.pin!;
      const username = state?.user?.solaceName!;
      const encryptedPrivateKey = await encryptKey(secretKey, pin);
      const encryptedUsername = await encryptKey(username, pin);
      const exists = await googleApi.checkFileExists('solace_pk.solace');
      if (!exists) {
        await googleApi.uploadFileToDrive(
          'solace_pk.solace',
          encryptedPrivateKey,
        );
        await googleApi.uploadFileToDrive('solace_n.solace', encryptedUsername);
        dispatch(
          setUser({
            ...state.user,
            isWalletCreated: false,
            ownerPrivateKey: secretKey,
          }),
        );
        setStoredUser({
          ...state.user,
          isWalletCreated: false,
          ownerPrivateKey: secretKey,
        });
        showMessage({
          message: 'Successfully uploaded to google drive',
          type: 'success',
        });
      } else {
        showMessage({
          message:
            'Solace backup already exists. Please login to the account assosiated with this backup',
          type: 'info',
        });
        setLoading({
          value: false,
          message: 'use another account?',
        });
        return;
      }
    } catch (e: any) {
      const googleApi = state.googleApi;
      if (!e.message.startsWith('RNGoogleSignInError')) {
        showMessage({
          message: e.message,
          type: 'danger',
        });
        if (googleApi) {
          await googleApi.deleteFile('solace_pk.solace');
          await googleApi.deleteFile('solace_n.solace');
        }
      }
      setLoading({
        value: false,
        message: 'enable now',
      });
      throw e;
    }
  };

  const requestAirdrop = async (publicKey: string, accessToken: string) => {
    console.log({publicKey, accessToken});
    setLoading({
      value: true,
      message: 'requesting air drop...',
    });
    try {
      const data: any = await airdrop(publicKey, accessToken);
      return data.data;
      // await SolaceSDK.testnetConnection.confirmTransaction(data.data);
      // showMessage({
      //   message: 'Airdrop complete',
      //   type: 'success',
      // });
    } catch (e) {
      console.log('Airdrop error', e);
      setLoading({
        value: false,
        message: 'enable now',
      });
      showMessage({
        message: 'Error requesting airdrop. Try again!',
        type: 'danger',
      });
      throw e;
    }
  };

  const confirmTransaction = async (data: string) => {
    setLoading({
      value: true,
      message: 'confirming transaction...',
    });
    console.log({data});
    let confirm = false;
    let retry = 0;
    while (!confirm) {
      if (retry > 0) {
        setLoading({
          value: true,
          message: 'retrying confirmation...',
        });
      }
      try {
        const res = await SolaceSDK.testnetConnection.confirmTransaction(data);
        showMessage({
          message: `Transaction confirmed, ${JSON.stringify(res)}`,
          type: 'success',
        });
        confirm = true;
      } catch (e: any) {
        if (
          e.message.startsWith(
            'Transaction was not confirmed in 60.00 seconds.',
          )
        ) {
          console.log('Timeout');
          retry++;
        } else {
          confirm = true;
          console.log('OTHER ERROR: ', e.message);
          throw e;
        }
      }
    }
  };

  const getFeePayer = async (accessToken: string) => {
    setLoading({
      message: 'creating wallet...',
      value: true,
    });
    try {
      const response = await getMeta(accessToken);
      return response.feePayer;
    } catch (e) {
      setLoading({
        message: 'enable now',
        value: false,
      });
      console.log('FEE PAYER', e);
      throw e;
    }
  };

  const createWallet = async (
    keypair: ReturnType<typeof SolaceSDK.newKeyPair>,
    payer: InstanceType<typeof PublicKey>,
    accessToken: string,
  ) => {
    try {
      const sdk = new SolaceSDK({
        network: 'testnet',
        owner: keypair,
        programAddress: '8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U',
      });
      const username = state.user?.solaceName!;
      const tx = await sdk.createFromName('ankit5', payer);
      const res = await relayTransaction(tx, accessToken);
      const transactionId = res.data;
      await confirmTransaction(transactionId);
      // await SolaceSDK.testnetConnection.confirmTransaction(res.data);
      // const awsCognito = state.awsCognito!;
      // await awsCognito.updateAttribute('address', sdk.wallet.toString());
      dispatch(setUser({...state.user, isWalletCreated: true}));
      setLoading({
        message: 'created',
        value: false,
      });
      setCreated(true);
    } catch (e) {
      setLoading({
        message: 'enable now',
        value: false,
      });
      showMessage({
        message: 'there is already a account with this username',
      });
      throw e;
    }
  };

  useEffect(() => {
    if (created) {
      setToLocalStorage();
    }
  }, [created, setToLocalStorage]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Image
            source={require('../../../../../assets/images/solace/google-drive.png')}
            style={styles.image}
          />
          <Text style={styles.heading}>secure your wallet</Text>
          <Text style={styles.subHeading}>
            store your encrypted key in google drive so you can recover your
            wallet if you lose your device
          </Text>
        </View>

        {loading.value && <ActivityIndicator size="small" />}

        <TouchableOpacity
          disabled={loading.value}
          onPress={() => {
            handleClick();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>{loading.message}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
