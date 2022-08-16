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
import {GlobalContext} from '../../../../state/contexts/GlobalContext';
import {setUser} from '../../../../state/actions/global';

export type Props = {
  navigation: any;
};

export enum Status {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

const UsernameScreen: React.FC<Props> = ({navigation}) => {
  const [username, setUsername] = useState('');
  const [borderColor, setBorderColor] = useState('#fff3');
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [status, setStatus] = useState({
    text: 'your username will be public',
    status: Status.INFO,
  });

  const {state, dispatch} = useContext(GlobalContext);

  const checkUsernameAvailability = async () => {
    if (username.trim().length === 0) {
      return;
    }
    setIsLoading(true);
    dispatch(setUser({...state.user, solaceName: username}));
    setTimeout(() => {
      /** Checking username availability */
      // const available = await SolaceSDK.checkUsernameAvailability(username);
      const available = true;
      if (available) {
        setStatus({
          text: 'username is available',
          status: Status.SUCCESS,
        });
        setUsernameAvailable(true);
      } else {
        setStatus({
          text: 'username is not available',
          status: Status.ERROR,
        });
      }
      setIsLoading(false);
    }, 200);
  };

  const handleUsernameSubmit = async () => {
    navigation.navigate('Email');
  };

  const handleChange = (text: string) => {
    setUsername(text);
    if (usernameAvailable) {
      setUsernameAvailable(false);
    }
    if (status.status !== Status.INFO) {
      setStatus({text: 'your username will be public', status: Status.INFO});
    }
  };

  const getIcon = () => {
    let name = 'infocirlceo';
    let color = 'gray';
    switch (status.status) {
      case Status.INFO:
        name = 'infocirlceo';
        color = 'gray';
        break;
      case Status.WARNING:
        name = 'exclamationcircle';
        color = 'orange';
        break;
      case Status.ERROR:
        name = 'closecircleo';
        color = 'red';
        break;
      case Status.SUCCESS:
        name = 'checkcircleo';
        color = 'green';
    }
    return (
      <View style={styles.subTextContainer}>
        <AntDesign name={name} style={[styles.subIcon, {color}]} />
        <Text style={styles.subText}>{status.text}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      {/* {isLoading ? (
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
      ) : ( */}
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
          {isLoading ? (
            <View style={styles.subTextContainer}>
              <ActivityIndicator size="small" />
            </View>
          ) : (
            getIcon()
          )}
        </View>
        {!usernameAvailable ? (
          <TouchableOpacity
            disabled={username.trim().length === 0 || isLoading}
            onPress={() => {
              checkUsernameAvailability();
            }}
            style={styles.buttonStyle}>
            <Text
              style={[
                styles.buttonTextStyle,
                {
                  color:
                    username.trim().length === 0 || isLoading
                      ? 'gray'
                      : 'black',
                },
              ]}>
              {isLoading ? 'checking...' : 'check'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            disabled={username.trim().length === 0 || isLoading}
            onPress={() => {
              handleUsernameSubmit();
            }}
            style={styles.buttonStyle}>
            <Text
              style={[
                styles.buttonTextStyle,
                {
                  color:
                    username.trim().length === 0 || isLoading
                      ? 'gray'
                      : 'black',
                },
              ]}>
              next
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {/* )} */}
    </ScrollView>
  );
};

export default UsernameScreen;
