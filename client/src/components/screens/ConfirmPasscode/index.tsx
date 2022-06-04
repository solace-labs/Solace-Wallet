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
  const textInputRef = useRef(null);
  const {state, dispatch} = useContext(GlobalContext);
  const [pinReady, setPinReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const MAX_LENGTH = 5;

  const tempArray = new Array(MAX_LENGTH).fill(0);

  const handleOnPress = () => {
    setIsFocused(true);
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  };

  useEffect(() => {
    setIsFocused(true);
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
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
            onBlur={() => handleOnPress()}
            style={{
              flexDirection: 'row',
              marginTop: 50,
              justifyContent: 'center',
            }}>
            {tempArray.map((_, index) => {
              const digit = code[index] || ' ';
              const isComplete = code.length - index > 0;
              return (
                <View
                  key={index}
                  style={{
                    width: 14,
                    height: 14,
                    marginLeft: 16,
                    marginRight: 16,
                    borderRadius: 8,
                    overflow: 'hidden',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: isComplete ? 'white' : '#9999A5',
                  }}
                />
                // {/* <Text style={{color: 'black'}}>{digit}</Text> */}
                // </View>
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
