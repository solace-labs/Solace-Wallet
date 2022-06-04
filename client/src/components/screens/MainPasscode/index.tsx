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
} from '../../../state/contexts/GlobalContext';
import {setAccountStatus} from '../../../state/actions/global';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Props = {
  navigation: any;
};

const MainPasscodeScreen: React.FC<Props> = ({navigation}) => {
  const [code, setCode] = useState('');
  const textInputRef = useRef(null);
  const [pinReady, setPinReady] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const MAX_LENGTH = 5;

  const {state, dispatch} = useContext(GlobalContext);

  const tempArray = new Array(MAX_LENGTH).fill(0);

  const focusMainInput = () => {
    setIsFocused(true);
    const textInput = textInputRef.current! as TextInput;
    textInput.focus();
  };

  const handleOnPress = () => {
    focusMainInput();
  };

  useEffect(() => {
    focusMainInput();
  }, []);

  const checkPinReady = useCallback(async () => {
    if (code.length === MAX_LENGTH) {
      const response = await AsyncStorage.getItem('user');
      let user;
      console.log('PASSCODE CHECK', code, response);
      if (response) {
        user = JSON.parse(response);
      }
      if (user && code === user.passcode) {
        dispatch(setAccountStatus(AccountStatus.ACTIVE));
      } else {
        Alert.alert('incorret passcode');
        setCode('');
        focusMainInput();
      }
    }
  }, [code, dispatch]);

  useEffect(() => {
    checkPinReady();
  }, [code, checkPinReady]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Image
            source={require('../../../../assets/images/solace/solace-icon.png')}
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
          <TouchableOpacity onPress={() => navigation.navigate('Fingerprint')}>
            <Text style={styles.fingerprint}>use fingerprint</Text>
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
