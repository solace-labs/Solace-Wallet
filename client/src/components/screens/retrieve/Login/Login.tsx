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
import React, {useContext, useEffect, useState} from 'react';
import styles from './styles';
import {
  AccountStatus,
  GlobalContext,
  PROGRAM_ADDRESS,
} from '../../../../state/contexts/GlobalContext';
import {
  setAccountStatus,
  setAwsCognito,
  setSDK,
  setUser,
} from '../../../../state/actions/global';
import {useTogglePasswordVisibility} from '../../../../hooks/useTogglePasswordVisibility';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {AwsCognito} from '../../../../utils/aws_cognito';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {showMessage} from 'react-native-flash-message';
import {PublicKey, SolaceSDK} from 'solace-sdk';
import {getMeta, relayTransaction} from '../../../../utils/relayer';

export type Props = {
  navigation: any;
};

const Login: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState({
    value: '',
    isValid: false,
  });
  const [password, setPassword] = useState({
    value: '',
    isValid: true,
  });
  const [active, setActive] = useState('username');
  const [isLoading, setIsLoading] = useState(false);
  const {passwordVisibility, rightIcon, handlePasswordVisibility} =
    useTogglePasswordVisibility();

  const {state, dispatch} = useContext(GlobalContext);
  const [tokens, setTokens] = useLocalStorage('tokens');

  const validateUsername = (text: string) => {
    setUsername({
      value: text,
      isValid: false,
    });
  };

  const validatePassword = (text: string) => {
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

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      const awsCognito = new AwsCognito();
      awsCognito.setCognitoUser(username.value);
      dispatch(setAwsCognito(awsCognito));
      console.log(username.value, password.value);
      const response = await awsCognito?.emailLogin(
        username.value,
        password.value,
      );
      console.log({response});
      const {
        //@ts-ignore
        accessToken: {jwtToken: accesstoken},
        //@ts-ignore
        idToken: {jwtToken: idtoken},
        //@ts-ignore
        refreshToken: {token: refreshtoken},
      } = response;
      setTokens({
        accesstoken,
        idtoken,
        refreshtoken,
      });
      dispatch(setUser({...state.user, solaceName: username.value}));
      showMessage({
        message: 'successfully logged in',
        type: 'success',
      });
      navigation.navigate('GuardianRecovery');
    } catch (e: any) {
      showMessage({
        message: e.message,
        type: 'danger',
      });
    }
    setIsLoading(false);
  };

  const isDisable = () => {
    return !password.isValid || isLoading;
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>
            enter {active === 'username' ? 'solace username' : 'password'}
          </Text>
          <Text style={styles.subHeading}>sign in to your account</Text>
          <TextInput
            style={styles.textInput}
            placeholder="username"
            placeholderTextColor="#fff6"
            value={username.value}
            onChangeText={text => validateUsername(text)}
            onFocus={() => setActive('username')}
            autoCapitalize={'none'}
            autoCorrect={false}
          />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="password"
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
          {isLoading && (
            <View style={{marginTop: 20}}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>
        <TouchableOpacity
          disabled={isDisable()}
          onPress={() => {
            handleSignIn();
          }}
          style={styles.buttonStyle}>
          <Text
            style={[
              styles.buttonTextStyle,
              {
                color: isDisable() ? '#9999a5' : 'black',
              },
            ]}>
            {isLoading ? 'logging in...' : 'login'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Login;
