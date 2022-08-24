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

export type Props = {
  navigation: any;
};

const GoogleDriveScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [tokens, setTokens] = useLocalStorage('tokens', {});
  const [created, setCreated] = useState(false);
  const [loading, setLoading] = useState({
    value: false,
    message: 'enable now',
  });

  const handleClick = async () => {
    try {
      const keypair = SolaceSDK.newKeyPair();
      const {secretKey} = keypair;
      const secretKeyString = secretKey.toString();
      /** Google Drive Storage of Private Key and Solace Name */
      console.log('STORING');
      await storeToGoogleDrive(secretKeyString);
      // dispatch(
      //   setUser({
      //     ...state.user,
      //     isWalletCreated: false,
      //     ownerPrivateKey: secretKeyString,
      //   }),
      // );
      // console.log('STORED');
      // navigation.reset({
      //   index: 0,
      //   routes: [{name: 'Airdrop'}],
      // });
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
        navigation.reset({
          index: 0,
          routes: [{name: 'Airdrop'}],
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
