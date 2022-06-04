import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalContext} from '../../../state/contexts/GlobalContext';
import {setOnboardingUser, setUser} from '../../../state/actions/global';

export type Props = {
  navigation: any;
};

const UsernameScreen: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [borderColor, setBorderColor] = useState('#fff3');
  const [isLoading, setIsLoading] = useState(false);
  const [infoText, setInfoText] = useState('your username will be public');

  const {state, dispatch} = useContext(GlobalContext);

  const handleUsernameSubmit = async () => {
    dispatch(setOnboardingUser({...state.onboardingUser, username}));
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.navigate('Passcode');
    }, 2000);
  };

  const handleChange = (text: string) => {
    setUsername(text);
  };
  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      {isLoading ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <ActivityIndicator size="large" />
          <Text style={{color: 'white', fontFamily: 'SpaceMono-Bold'}}>
            setting your username
          </Text>
        </View>
      ) : (
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.heading}>your solace username</Text>
            <Text style={styles.subHeading}>
              choose a username that others can use to send you money
            </Text>
            <TextInput
              style={[styles.textInput, {borderColor}]}
              placeholder="username"
              placeholderTextColor="#fff6"
              value={username}
              autoCorrect={false}
              autoCapitalize={'none'}
              onFocus={() => setBorderColor('#fff6')}
              onBlur={() => setBorderColor('#fff3')}
              onChangeText={text => handleChange(text)}
            />
            <View style={styles.subTextContainer}>
              <AntDesign name="infocirlceo" style={styles.subIcon} />
              <Text style={styles.subText}>{infoText}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              handleUsernameSubmit();
            }}
            style={styles.buttonStyle}>
            <Text style={styles.buttonTextStyle}>next</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default UsernameScreen;
