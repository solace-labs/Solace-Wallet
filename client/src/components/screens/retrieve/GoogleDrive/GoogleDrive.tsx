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
  setRetrieveData,
} from '../../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../../hooks/useLocalStorage';
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
          // navigation.navigate('Passcode');
          navigation.reset({
            index: 0,
            routes: [{name: 'Passcode'}],
          });
        }, 1000);
      } else {
        showMessage({
          message: 'There is no solace backup found in google drive',
          type: 'info',
        });
        setLoading({
          value: false,
          message: 'recover by guardians?',
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

  const recoverUsingGuardians = () => {
    // navigation.navigate('GuardianRecovery');
    dispatch(setAccountStatus(AccountStatus.RECOVERY));
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

        {loading.message === 'recover by guardians?' ? (
          <TouchableOpacity
            disabled={loading.value}
            onPress={() => {
              recoverUsingGuardians();
            }}
            style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>{loading.message}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={loading.value}
            onPress={() => {
              retrieveFromGoogleDrive();
            }}
            style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>{loading.message}</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
