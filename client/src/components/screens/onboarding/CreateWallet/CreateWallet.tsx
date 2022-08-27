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
  setSDK,
  setUser,
} from '../../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
  NETWORK,
  PROGRAM_ADDRESS,
} from '../../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {KeyPair, PublicKey, SolaceSDK} from 'solace-sdk';
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

const CreateWalletScreen: React.FC = () => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [tokens, setTokens] = useLocalStorage('tokens', {});
  const [created, setCreated] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status.AIRDROP_REQUESTED);
  const [airdropConfirmed, setAirdropConfirmed] = useState(false);
  const [loading, setLoading] = useState({
    value: false,
    message: 'create',
  });

  /**
   * Setting to local storage
   */
  const setToLocalStorage = useCallback(async () => {
    console.log('SETTING TO LOCALSTORAGE', state.user);
    await setStoredUser(state.user);
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  }, [setStoredUser, state.user, dispatch]);

  const handleClick = async () => {
    try {
      const privateKey = state.user?.ownerPrivateKey!;
      console.log(privateKey);
      const keypair = KeyPair.fromSecretKey(
        Uint8Array.from(privateKey.split(',').map(e => +e)),
      );
      const accessToken = tokens.accesstoken;
      /** Getting fee payer */
      console.log('GETTING FEE PAYER');
      const feePayer = new PublicKey(await getFeePayer(accessToken));
      console.log('FEE PAYER FETCHED');
      /** Creating wallet for the user */
      console.log('CREATING WALLET');
      const {sdk, transactionId} = await createWallet(
        keypair,
        feePayer,
        accessToken,
      );
      console.log('WALLET CREATED');
      await confirmTransaction(transactionId);
      console.log('TRANSACTION CONFIRMED');
      /** TODO uncomment this in production */
      const awsCognito = state.awsCognito!;
      await awsCognito.updateAttribute('address', sdk.wallet.toString());
      dispatch(setSDK(sdk));
      // sdk.owner;
      dispatch(setUser({...state.user, isWalletCreated: true}));
      showMessage({
        message: 'wallet created',
        type: 'success',
      });
      setLoading({
        message: 'created',
        value: false,
      });
      setCreated(true);
    } catch (e) {
      console.log('MAIN ERROR: ', e);
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
      if (retry === 3) {
        setLoading({
          value: false,
          message: 'some error. try again?',
        });
        confirm = true;
        continue;
      }
      try {
        // const res = await SolaceSDK.testnetConnection.confirmTransaction(data);
        const res = await SolaceSDK.testnetConnection.getSignatureStatus(data);
        showMessage({
          message: 'transaction confirmed - wallet created',
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
          console.log('OTHER ERROR: ', e.message);
          retry++;
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
        message: 'create',
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
        network: NETWORK,
        owner: keypair,
        programAddress: PROGRAM_ADDRESS,
      });
      const username = state.user?.solaceName!;
      /** TODO remove this */
      const randomname = `ankit${Math.floor(Math.random() * 2000) + 1}`;
      // console.log({randomname});
      console.log({username});
      const tx = await sdk.createFromName(username, payer);
      const res = await relayTransaction(tx, accessToken);
      showMessage({
        message: 'confirming transaction',
      });
      return {
        sdk,
        transactionId: res.data,
      };
    } catch (e) {
      setLoading({
        message: 'create',
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
          <Text style={styles.heading}>create wallet</Text>
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

export default CreateWalletScreen;
