/* eslint-disable react-hooks/exhaustive-deps */
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
  NETWORK,
  PROGRAM_ADDRESS,
} from '../../../../state/contexts/GlobalContext';
import {setAccountStatus, setSDK} from '../../../../state/actions/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {AwsCognito} from '../../../../utils/aws_cognito';
import {check} from 'prettier';
import {KeyPair, SolaceSDK} from 'solace-sdk';
import {showMessage} from 'react-native-flash-message';

export type Props = {
  navigation: any;
};

const MainPasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const textInputRef = useRef(null);
  // const [tokens] = useLocalStorage('tokens');
  const [user] = useLocalStorage('user', {});
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

  const retrieveAccount = async () => {
    console.log('RETRIEVE ACCOUNT', user);
    const privateKey = state.user?.ownerPrivateKey!;
    const solaceName = state.user?.solaceName!;
    console.log(privateKey);
    const keypair = KeyPair.fromSecretKey(
      Uint8Array.from(privateKey.split(',').map(e => +e)),
    );
    setLoading({
      value: true,
      message: 'logging you in',
    });
    const sdk = await SolaceSDK.retrieveFromName(solaceName, {
      network: NETWORK,
      owner: keypair,
      programAddress: PROGRAM_ADDRESS,
    });
    console.log({sdk});
    dispatch(setSDK(sdk));
    setLoading({
      value: false,
      message: '',
    });
    dispatch(setAccountStatus(AccountStatus.ACTIVE));
  };

  const checkPinReady = async () => {
    if (code.length === MAX_LENGTH) {
      if (user && code === user.pin) {
        await retrieveAccount();
      } else {
        showMessage({
          message: 'incorrect passcode',
          type: 'danger',
        });
        setCode('');
        focusMainInput();
      }
    }
  };

  useEffect(() => {
    checkPinReady();
  }, [code]);

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
          {/* <TouchableOpacity onPress={() => navigation.navigate('Fingerprint')}>
            <Text style={styles.fingerprint}>use fingerprint</Text>
          </TouchableOpacity> */}

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

export default MainPasscodeScreen;
