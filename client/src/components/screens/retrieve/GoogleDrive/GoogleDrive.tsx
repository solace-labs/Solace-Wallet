import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {
  setAccountStatus,
  setAwsCognito,
  setGoogleApi,
  setRetrieveData,
  setSDK,
  setUser,
} from '../../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {SolaceSDK} from 'solace-sdk';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  GDrive,
  ListQueryBuilder,
  MimeTypes,
} from '@robinbobin/react-native-google-drive-api-wrapper';
import {
  decryptData,
  encryptData,
  generateKey,
} from '../../../../utils/aes_encryption';
import {FetchResultType} from '@robinbobin/react-native-google-drive-api-wrapper/api/aux/Fetcher';
import {AwsCognito} from '../../../../utils/aws_cognito';
import {GoogleApi} from '../../../../utils/google_apis';
import {showMessage} from 'react-native-flash-message';
export type Props = {
  navigation: any;
};

const GoogleDriveScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState({
    value: false,
    message: 'retrieve now',
  });

  const setToLocalStorage = useCallback(async () => {
    await setStoredUser(state.user);
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  }, [setStoredUser, state.user, dispatch]);

  const retrieveFromGoogleDrive = async () => {
    try {
      const googleApi: GoogleApi = new GoogleApi();
      setLoading({
        value: true,
        message: 'retrieving...',
      });
      await googleApi.signIn();
      await googleApi.setDrive();
      dispatch(setGoogleApi(googleApi));

      const secretKeyExists = await googleApi.checkFileExists(
        'solace_pk.solace',
      );
      const solaceNameExists = await googleApi.checkFileExists(
        'solace_n.solace',
      );

      if (secretKeyExists && solaceNameExists) {
        const encryptedSecretKey = await googleApi.getFileData(
          'solace_pk.solace',
        );
        const encryptedSolaceName = await googleApi.getFileData(
          'solace_n.solace',
        );
        console.log({
          encryptedSecretKey,
          encryptedSolaceName,
        });
        dispatch(
          setRetrieveData({
            ...state.retrieveData,
            encryptedSecretKey,
            encryptedSolaceName,
          }),
        );
        setLoading({
          value: false,
          message: 'retrieve now',
        });
        showMessage({
          message: 'Successfully retrieved from google drive',
          type: 'success',
        });
        setTimeout(() => {
          navigation.navigate('Passcode');
        }, 1000);
      } else {
        showMessage({
          message: 'There is no solace backup found in google drive',
          type: 'info',
        });
        setLoading({
          value: false,
          message: 'retrieve now',
        });
        return;
      }
    } catch (e: any) {
      if (!e.message.startsWith('RNGoogleSignInError')) {
        showMessage({
          message: e.message,
          type: 'danger',
        });
      }
      setLoading({
        value: false,
        message: 'enable now',
      });
    }
  };

  const encryptSecretKey = async (secretKey: string, pin: string) => {
    const key = await generateKey(pin, 'salt', 5000, 256);
    const encryptedData = await encryptData(secretKey, key);
    return encryptedData;
  };

  const decryptSecretKey = async (encryptedData: any, pin: string) => {
    const key = await generateKey(pin, 'salt', 5000, 256);
    const decryptedData = await decryptData(encryptedData, key);
    return decryptedData;
  };

  const requestAirdrop = async () => {
    console.log('requesting airdrop');
    const keypair = state?.user?.keypair!;
    const LAMPORTS_PER_SOL = 1000000000;
    const tx = await SolaceSDK.localConnection.requestAirdrop(
      keypair.publicKey,
      1 * LAMPORTS_PER_SOL,
    );
    await SolaceSDK.localConnection.confirmTransaction(tx);
    console.log('airdrop confirmed');
  };

  const createWallet = async () => {
    console.log('creating wallet');
    const username = state?.user?.solaceName!;
    const keypair = state?.user?.keypair!;
    // const sdk = await SolaceSDK.createFromName(username, {
    //   network: 'local',
    //   owner: keypair,
    //   programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
    // });
    // console.log('wallet created');
    // dispatch(setSDK(sdk));
    dispatch(setUser({...state.user, isWalletCreated: true}));
    setCreated(true);
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
          <Text style={styles.heading}>retrieve your wallet</Text>
          <Text style={styles.subHeading}>
            retrieve your encrypted key from google drive so you can access your
            wallet
          </Text>
        </View>

        {loading.value && <ActivityIndicator size="small" />}

        <TouchableOpacity
          disabled={loading.value}
          onPress={() => {
            retrieveFromGoogleDrive();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>{loading.message}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
