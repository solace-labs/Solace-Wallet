import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';
import {GlobalContext} from '../../../state/contexts/GlobalContext';
import {setOnboardingUser} from '../../../state/actions/global';

export type Props = {
  navigation: any;
};

const EmailScreen: React.FC<Props> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState(false);

  const {state, dispatch} = useContext(GlobalContext);

  const validate = (text: string) => {
    console.log(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      console.log('Email is Not Correct');
      setEmail(text);
      setIsValid(false);
      return false;
    } else {
      setEmail(text);
      setIsValid(true);
      console.log('Email is Correct');
    }
  };

  const handleMailSubmit = () => {
    dispatch(setOnboardingUser({...state.onboardingUser, email}));
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>enter email</Text>
          <Text style={styles.subHeading}>
            we’ll notify you of important or suspicious activity on your wallet
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="email address"
            placeholderTextColor="#fff6"
            value={email}
            onChangeText={text => validate(text)}
            autoCapitalize={'none'}
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          disabled={!isValid}
          onPress={() => {
            handleMailSubmit();
            navigation.navigate('Username');
          }}
          style={styles.buttonStyle}>
          <Text
            style={[
              styles.buttonTextStyle,
              {color: isValid ? 'black' : '#9999a5'},
            ]}>
            next
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EmailScreen;
