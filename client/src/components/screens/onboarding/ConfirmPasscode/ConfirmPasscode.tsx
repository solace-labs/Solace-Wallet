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
} from '../../../../state/contexts/GlobalContext';
import {setAccountStatus} from '../../../../state/actions/global';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {showMessage} from 'react-native-flash-message';

export type Props = {
  navigation: any;
};

const ConfirmPasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const textInputRef = useRef(null);
  const {state, dispatch} = useContext(GlobalContext);
  const [pinReady, setPinReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [user, setUser] = useLocalStorage('user', {});
  const MAX_LENGTH = 6;

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

  const checkPinReady = async () => {
    if (code.length === MAX_LENGTH) {
      if (state.user && state.user.pin === code) {
        navigation.navigate('Login');
      } else {
        showMessage({
          message: 'Passcode did not match',
          type: 'danger',
        });
      }
    } else {
      showMessage({
        message: 'Enter passcode',
        type: 'info',
      });
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
