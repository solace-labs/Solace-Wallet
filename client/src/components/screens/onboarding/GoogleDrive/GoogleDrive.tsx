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
export type Props = {
  navigation: any;
};

const GoogleDriveScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState({
    value: false,
    message: 'enable now',
  });

  const setToLocalStorage = useCallback(async () => {
    await setStoredUser(state.user);
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  }, [setStoredUser, state.user, dispatch]);

  const storeToGoogleDrive = async () => {
    try {
      const googleApi: GoogleApi = new GoogleApi();
      setLoading({
        value: true,
        message: 'storing...',
      });
      await googleApi.signIn();
      await googleApi.setDrive();
      dispatch(setGoogleApi(googleApi));
      const secretKey = state?.user?.ownerPrivateKey!;
      const pin = state?.user?.pin!;
      const username = state?.user?.solaceName!;
      const encryptedPrivateKey = await encryptSecretKey(
        secretKey.toString(),
        pin,
      );
      const encryptedUsername = await encryptSecretKey(username, pin);
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
        Alert.alert('Successfully uploaded to google drive');
      } else {
        Alert.alert(
          'Solace backup already exists. Please login to the account assosiated with this backup',
        );
        setLoading({
          value: false,
          message: 'create another account?',
        });
        return;
      }
      setLoading({
        value: true,
        message: 'requesting air drop...',
      });
      // await requestAirdrop();
      console.log('REQUESTING AIRDROP');
      setLoading({
        value: true,
        message: 'creating wallet...',
      });
      await createWallet();
      console.log('CREATING WALLET');
    } catch (e: any) {
      const googleApi = state.googleApi;
      if (googleApi) {
        await googleApi.deleteFile('solace_pk.solace');
        await googleApi.deleteFile('solace_n.solace');
      }
      if (!e.message.startsWith('RNGoogleSignInError')) {
        Alert.alert(e.message);
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
            storeToGoogleDrive();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>{loading.message}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
