/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import {
  setAccountStatus,
  setAwsCognito,
  setUser,
} from '../../../../state/actions/global';
import {useTogglePasswordVisibility} from '../../../../hooks/useTogglePasswordVisibility';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {AwsCognito} from '../../../../utils/aws_cognito';
import {showMessage} from 'react-native-flash-message';

export type Props = {
  navigation: any;
};

const EmailScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState({
    value: 'ankit.negi@onpar.in',
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: '',
    isValid: false,
  });
  const [otp, setOtp] = useState({
    value: '',
    isValid: false,
    isVerified: false,
  });
  const [active, setActive] = useState('email');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const {passwordVisibility, rightIcon, handlePasswordVisibility} =
    useTogglePasswordVisibility();

  useEffect(() => {
    validateEmail(email.value);
    validatePassword(password.value);
  }, []);

  const {state, dispatch} = useContext(GlobalContext);

  const validateEmail = (text: string) => {
    if (isOtpSent) {
      setIsOtpSent(false);
    }
    let reg = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      setEmail({
        value: text,
        isValid: false,
      });
      return false;
    } else {
      setEmail({value: text, isValid: true});
    }
  };

  const validateOtp = (text: string) => {
    let reg = /^[0-9]{6,6}$/;
    if (reg.test(text) === false) {
      setOtp({
        value: text,
        isValid: false,
        isVerified: false,
      });
      return false;
    } else {
      setOtp({
        value: text,
        isValid: true,
        isVerified: false,
      });
    }
  };

  const validatePassword = (text: string) => {
    if (isOtpSent) {
      setIsOtpSent(false);
    }
    let reg =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&#]{8,}$/;
    if (reg.test(text) === false) {
      setPassword({
        value: text,
        isValid: false,
      });
      return false;
    } else {
      setPassword({
        value: text,
        isValid: true,
      });
    }
  };

  const handleMailSubmit = async () => {
    const username = state.user!.solaceName;
    const awsCognito = new AwsCognito();
    awsCognito.setCognitoUser(username);
    dispatch(setAwsCognito(awsCognito));
    if (!username) {
      showMessage({
        message: 'Username not provided',
        type: 'info',
      });
      return;
    }
    if (!awsCognito) {
      showMessage({
        message: 'Server Error. Try again later',
        type: 'danger',
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await awsCognito?.emailSignUp(
        username,
        email.value,
        password.value,
      );
      console.log({response});
      dispatch(setUser({...state.user, email: email.value}));
      setIsOtpSent(true);
      showMessage({
        message: 'OTP sent to the provided mail',
        type: 'success',
      });
    } catch (e: any) {
      showMessage({
        message: e.message,
        type: 'danger',
      });
    }
    setIsLoading(false);
  };

  const handleVerifyOtp = async () => {
    const awsCognito = state.awsCognito;
    if (!awsCognito) {
      showMessage({
        message: 'Server Error. Try again later',
        type: 'danger',
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await awsCognito?.confirmRegistration(otp.value);
      console.log({response});
      setOtp({...otp, isVerified: true});
      setIsLoading(false);
      dispatch(setAccountStatus(AccountStatus.SIGNED_UP));
    } catch (e: any) {
      setIsLoading(false);
      showMessage({
        message: e.message,
        type: 'danger',
      });
    }
  };

  const isDisable = () => {
    return !email.isValid || !password.isValid || isLoading || otp.isVerified;
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>
            enter{' '}
            {active === 'email'
              ? 'email'
              : active === 'password'
              ? 'password'
              : 'otp'}
          </Text>
          <Text style={styles.subHeading}>
            we’ll notify you of important or suspicious activity on your wallet
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="email address"
            placeholderTextColor="#fff6"
            value={email.value}
            onChangeText={text => validateEmail(text)}
            onFocus={() => setActive('email')}
            autoCapitalize={'none'}
            autoCorrect={false}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="enter password"
              placeholderTextColor="#fff6"
              value={password.value}
              secureTextEntry={passwordVisibility}
              onChangeText={text => validatePassword(text)}
              autoCapitalize={'none'}
              onFocus={() => setActive('password')}
              autoCorrect={false}
            />
            <Pressable
              onPress={handlePasswordVisibility}
              style={styles.eyeIcon}>
              <MaterialCommunityIcons name={rightIcon} size={22} color="gray" />
            </Pressable>
          </View>
          {!password.isValid && (
            <Text style={styles.passwordHint}>
              must be at least 8 characters long, contain at least one lowercase
              letter, one uppercase letter, one number, and one special
              character
            </Text>
          )}
          {isOtpSent && (
            <TextInput
              style={styles.textInput}
              placeholder="enter 6 digit otp"
              placeholderTextColor="#fff6"
              value={otp.value}
              onChangeText={text => validateOtp(text)}
              autoCapitalize={'none'}
              keyboardType="number-pad"
              onFocus={() => setActive('otp')}
              autoCorrect={false}
            />
          )}
          {isLoading && (
            <View style={{marginTop: 20}}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        {isOtpSent ? (
          <TouchableOpacity
            disabled={isDisable()}
            onPress={() => {
              handleVerifyOtp();
            }}
            style={styles.buttonStyle}>
            <Text
              style={[
                styles.buttonTextStyle,
                {
                  color: isDisable() ? '#9999a5' : 'black',
                },
              ]}>
              {isLoading
                ? 'verfying...'
                : otp.isVerified
                ? 'verified'
                : 'verify otp'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={isDisable()}
            onPress={() => {
              handleMailSubmit();
            }}
            style={styles.buttonStyle}>
            <Text
              style={[
                styles.buttonTextStyle,
                {
                  color: isDisable() ? '#9999a5' : 'black',
                },
              ]}>
              {isLoading ? 'sending...' : 'send otp'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default EmailScreen;
