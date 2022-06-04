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
import {GlobalContext} from '../../../state/contexts/GlobalContext';
import {setOnboardingUser} from '../../../state/actions/global';

export type Props = {
  navigation: any;
};

const PasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const textInputRef = useRef(null);
  const MAX_LENGTH = 5;

  const tempArray = new Array(MAX_LENGTH).fill(0);

  const handleOnPress = () => {
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  };

  useEffect(() => {
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  }, []);

  const {state, dispatch} = useContext(GlobalContext);

  const checkPinReady = async () => {
    if (code.length === MAX_LENGTH) {
      dispatch(setOnboardingUser({...state.onboardingUser, passcode: code}));
      navigation.navigate('ConfirmPasscode');
    } else {
      Alert.alert('Enter passcode');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>
            choose a passcode to protect your wallet on this device
          </Text>
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

export default PasscodeScreen;
