import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {setAccountStatus, setSDK, setUser} from '../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
} from '../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../hooks/useLocalStorage';
import {SolaceSDK} from 'solace-sdk';

import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  GDrive,
  MimeTypes,
} from '@robinbobin/react-native-google-drive-api-wrapper';
import {
  decryptData,
  encryptData,
  generateKey,
} from '../../../utils/aes_encryption';
export type Props = {
  navigation: any;
};

const GoogleDriveScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [created, setCreated] = useState(false);
  const [encryptedSecretKey, setEncryptedSecretKey] = useState('');

  const setToLocalStorage = useCallback(async () => {
    await setStoredUser(state.user);
  }, [setStoredUser, state.user]);

  const storeToGoogleDrive = async () => {
    GoogleSignin.configure({
      scopes: ['https://www.googleapis.com/auth/drive'], // what API you want to access on behalf of the user, default is email and profile
      webClientId:
        '757682918669-642g9pqab06h33pl8i2tqjegi60a91ms.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
      hostedDomain: '', // specifies a hosted domain restriction
      forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
      accountName: '', // [Android] specifies an account name on the device that should be used
      iosClientId:
        '757682918669-r08gca3sbdn42o0onj5etmh86pp21qj6.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
      googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
      openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
      profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
    });

    try {
      // Sign in google
      await GoogleSignin.signIn();

      const gdrive = new GDrive();
      gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;

      // console.log(await gdrive.files.list());
      const secretKey = state?.user?.ownerPrivateKey!;
      const pin = state?.user?.pin!;

      const key = await generateKey(pin, 'salt', 5000, 256);
      console.log({data: secretKey.toString()});
      const encryptedData = await encryptData(secretKey.toString(), key);
      console.log({encryptedData});

      const id = (
        await gdrive.files
          .newMultipartUploader()
          .setData(JSON.stringify(encryptedData), MimeTypes.JSON)
          .setRequestBody({
            name: 'solace_pk.solace',
          })
          .execute()
      ).id;

      const file = await gdrive.files.getJson(id);
      console.log({file});
      const data = await decryptData(file, key);
      console.log({data});
    } catch (e: any) {
      console.log(e);
    }
    // await requestAirdrop();
    console.log('REQUESTING AIRDROP');
    // await createWallet();
    console.log('CREATING WALLET');
    // dispatch(setUser({...state.user, isWalletCreated: true}));
    // setCreated(true);
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
    const sdk = await SolaceSDK.createFromName(username, {
      network: 'local',
      owner: keypair,
      programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
    });
    console.log('wallet created');
    dispatch(setSDK(sdk));
    dispatch(setUser({...state.user, isWalletCreated: true}));
    setCreated(true);
  };

  useEffect(() => {
    if (created) {
      setToLocalStorage();
      dispatch(setAccountStatus(AccountStatus.EXISITING));
    }
  }, [created, setToLocalStorage, dispatch]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Image
            source={require('../../../../assets/images/solace/google-drive.png')}
            style={styles.image}
          />
          <Text style={styles.heading}>secure your wallet</Text>
          <Text style={styles.subHeading}>
            store your encrypted key in google drive so you can recover your
            wallet if you lose your device
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            storeToGoogleDrive();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>enable now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
