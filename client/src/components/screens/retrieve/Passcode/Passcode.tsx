import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TextInputComponent,
  Pressable,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import styles from './styles';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import {
  setAccountStatus,
  setRetrieveData,
  setSDK,
} from '../../../../state/actions/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {AwsCognito} from '../../../../utils/aws_cognito';
import {check} from 'prettier';
import {SolaceSDK} from 'solace-sdk';
import {decryptData, generateKey} from '../../../../utils/aes_encryption';

export type Props = {
  navigation: any;
};

const PasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const textInputRef = useRef(null);
  const [tokens] = useLocalStorage('tokens');
  const MAX_LENGTH = 6;

  const {state, dispatch} = useContext(GlobalContext);
  const [loading, setLoading] = useState({
    value: false,
    message: '',
  });

  const tempArray = new Array(MAX_LENGTH).fill(0);

  const focusMainInput = () => {
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  };

  // console.log({tokens});

  const handleOnPress = () => {
    focusMainInput();
  };

  useEffect(() => {
    focusMainInput();
  }, []);

  const retrieveAccount = useCallback(async () => {
    const {solaceName, keypair} = state.user!;
    setLoading({
      value: true,
      message: 'logging you in',
    });
    setTimeout(async () => {
      const sdk = await SolaceSDK.retrieveFromName(solaceName, {
        network: 'local',
        owner: keypair!,
        programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
      });
      console.log({sdk});
      dispatch(setSDK(sdk));
      setLoading({
        value: false,
        message: '',
      });
      dispatch(setAccountStatus(AccountStatus.ACTIVE));
    }, 2000);
  }, [dispatch, state.user]);

  const decryptSecretKey = async (encryptedData: any, pin: string) => {
    const key = await generateKey(pin, 'salt', 5000, 256);
    const decryptedData = await decryptData(encryptedData, key);
    return decryptedData;
  };

  const decryptStoredData = useCallback(async () => {
    const {encryptedSecretKey, encryptedSolaceName} = state.retrieveData!;
    try {
      const secretKey = await decryptSecretKey(encryptedSecretKey, code);
      const solaceName = await decryptSecretKey(encryptedSolaceName, code);
      console.log({secretKey, solaceName});
      dispatch(
        setRetrieveData({
          ...state.retrieveData,
          decryptedSecretKey: secretKey,
          decryptedSolaceName: solaceName,
        }),
      );
      return true;
    } catch (e: any) {
      console.log(e.message);
      return false;
    }
  }, [code, state.retrieveData, dispatch]);

  const checkPinReady = useCallback(async () => {
    if (code.length === MAX_LENGTH) {
      if (await decryptStoredData()) {
        console.log('coming here');
        setCode('');
        Alert.alert('Successfully retrieved account');
        dispatch(setAccountStatus(AccountStatus.EXISITING));
      } else {
        setCode('');
        focusMainInput();
        Alert.alert('Incorrect passcode. Please try again.');
      }
    }
  }, [code, decryptStoredData, dispatch]);

  useEffect(() => {
    checkPinReady();
  }, [code, checkPinReady]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Image
            source={require('../../../../../assets/images/solace/solace-icon.png')}
            style={styles.image}
          />
          <Text style={styles.username}>solace</Text>
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>enter passcode</Text>
          <TouchableOpacity
            onPress={() => handleOnPress()}
            onBlur={() => handleOnPress()}
            style={styles.passcodeContainer}>
            {tempArray.map((_, index) => {
              const isComplete = code.length - index > 0;
              return (
                <View
                  key={index}
                  style={[
                    styles.passcode,
                    {
                      backgroundColor: isComplete ? 'white' : '#9999A5',
                    },
                  ]}
                />
              );
            })}
          </TouchableOpacity>

          {loading.value && (
            <View
              style={{
                marginTop: 5,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size="small" />
              <Text
                style={{
                  fontSize: 12,
                  color: 'white',
                  marginLeft: 5,
                  fontFamily: 'SpaceMono-Regular',
                }}>
                {loading.message}
              </Text>
            </View>
          )}

          <View>
            <TextInput
              ref={textInputRef}
              style={styles.hiddenInput}
              value={code}
              maxLength={MAX_LENGTH}
              onChangeText={setCode}
              returnKeyType="done"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
            />
          </View>
        </View>
        {/* <TouchableOpacity
          onPress={() => checkPinReady()}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>next</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

export default PasscodeScreen;
