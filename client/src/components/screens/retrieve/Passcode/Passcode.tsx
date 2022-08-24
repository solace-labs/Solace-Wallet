/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
  setUser,
} from '../../../../state/actions/global';
import {decryptData, generateKey} from '../../../../utils/aes_encryption';
import {showMessage} from 'react-native-flash-message';
import useLocalStorage from '../../../../hooks/useLocalStorage';

export type Props = {
  navigation: any;
};

const PasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const textInputRef = useRef(null);
  const MAX_LENGTH = 6;

  const {state, dispatch} = useContext(GlobalContext);
  const [loading, setLoading] = useState({
    value: false,
    message: '',
  });

  const [storedUser, setStoredUser] = useLocalStorage('user', {});

  const tempArray = new Array(MAX_LENGTH).fill(0);

  const focusMainInput = () => {
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  };

  const handleOnPress = () => {
    focusMainInput();
  };

  useEffect(() => {
    focusMainInput();
  }, []);

  const decryptSecretKey = async (encryptedData: any, pin: string) => {
    const key = await generateKey(pin, 'salt', 5000, 256);
    const decryptedData = await decryptData(encryptedData, key);
    return decryptedData;
  };

  const decryptStoredData = async () => {
    const {encryptedSecretKey, encryptedSolaceName} = state.retrieveData!;
    try {
      const secretKey = await decryptSecretKey(encryptedSecretKey, code);
      const solaceName = await decryptSecretKey(encryptedSolaceName, code);
      const user = {
        solaceName,
        ownerPrivateKey: secretKey,
        pin: code,
        isWalletCreated: true,
      };
      console.log({user});
      dispatch(setUser(user));
      setStoredUser(user);
      showMessage({
        message: 'successfully retrieved account',
        type: 'success',
      });
      dispatch(setAccountStatus(AccountStatus.EXISITING));
    } catch (e: any) {
      console.log(e.message);
      setCode('');
      focusMainInput();
      showMessage({
        message: 'Incorrect passcode. Please try again.',
        type: 'danger',
      });
    }
  };

  useEffect(() => {
    if (code.length === MAX_LENGTH) {
      decryptStoredData();
    }
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
