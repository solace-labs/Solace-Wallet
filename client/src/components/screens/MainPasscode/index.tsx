import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
  const MAX_LENGTH = 5;

  const {dispatch} = useContext(GlobalContext);

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

  const checkPinReady = useCallback(async () => {
    if (code.length === MAX_LENGTH) {
      const response = await AsyncStorage.getItem('user');
      let user;
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
              autoFocus={true}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MainPasscodeScreen;
