import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import React, {useContext, useEffect, useRef, useState} from 'react';
import styles from './styles';
import {
  AccountStatus,
  GlobalContext,
} from '../../../state/contexts/GlobalContext';
import {setAccountStatus, setUser} from '../../../state/actions/global';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Props = {
  navigation: any;
};

const ConfirmPasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const {state, dispatch} = useContext(GlobalContext);
  const textInputRef = useRef(null);
  const MAX_LENGTH = 5;

  const tempArray = new Array(MAX_LENGTH).fill(0);

  const focusMainInput = async () => {
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  };

  const handleOnPress = async () => {
    await focusMainInput();
  };

  useEffect(() => {
    setTimeout(() => {
      focusMainInput();
    }, 500);
  }, []);

  const setToLocalStorage = async () => {
    await AsyncStorage.setItem('user', JSON.stringify(state.onboardingUser));
  };

  const checkPinReady = async () => {
    if (code.length === MAX_LENGTH) {
      if (state.onboardingUser && state.onboardingUser.passcode === code) {
        console.log('setting to local storage', state.onboardingUser);
        await setToLocalStorage();
        dispatch(setAccountStatus(AccountStatus.EXISITING));
      } else {
        Alert.alert('Passcode did not match');
        setCode('');
      }
    } else {
      Alert.alert('Enter passcode');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>re-enter the same passcode</Text>
          <TouchableOpacity
            onPress={() => handleOnPress()}
            style={{
              flexDirection: 'row',
              marginTop: 50,
              justifyContent: 'center',
            }}>
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
              autoFocus={true}
            />
          </View>
        </View>
        <TouchableOpacity
          onPress={() => checkPinReady()}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ConfirmPasscodeScreen;
