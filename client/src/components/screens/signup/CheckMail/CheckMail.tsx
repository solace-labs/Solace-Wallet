import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import {setAccountStatus} from '../../../../state/actions/global';

export type Props = {
  navigation: any;
};

const CheckMailScreen: React.FC<Props> = ({navigation}) => {
  const [emailOtp, setEmailOtp] = useState('');
  const [isValid, setIsValid] = useState(false);

  const {state, dispatch} = useContext(GlobalContext);

  const validate = (text: string) => {
    let reg = /^[0-9]{6,6}$/;
    if (reg.test(text) === false) {
      setEmailOtp(text);
      setIsValid(false);
      return false;
    } else {
      setEmailOtp(text);
      setIsValid(true);
    }
  };

  const handleOtpSubmit = () => {
    dispatch(setAccountStatus(AccountStatus.SIGNED_UP));
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>enter otp</Text>
          <Text style={styles.subHeading}>
            enter otp which was sent to your email address
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="------"
            placeholderTextColor="#fff6"
            value={emailOtp}
            onChangeText={text => validate(text)}
            autoCapitalize={'none'}
            keyboardType="number-pad"
            autoCorrect={false}
          />
        </View>
        <TouchableOpacity
          disabled={!isValid}
          onPress={() => {
            handleOtpSubmit();
            // navigation.navigate('CheckMail');
          }}
          style={styles.buttonStyle}>
          <Text
            style={[
              styles.buttonTextStyle,
              {color: isValid ? 'black' : '#9999a5'},
            ]}>
            create account
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CheckMailScreen;
