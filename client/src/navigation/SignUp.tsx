import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../components/screens/Home/Home';
import EmailScreen from '../components/screens/Email/Email';
import CheckMailScreen from '../components/screens/CheckMail/CheckMail';
import UsernameScreen from '../components/screens/Username/Username';
import PasscodeScreen from '../components/screens/Passcode/Passcode';
import ConfirmPasscodeScreen from '../components/screens/ConfirmPasscode/ConfirmPasscode';
import GoogleDriveScreen from '../components/screens/GoogleDrive/GoogleDrive';

const Stack = createNativeStackNavigator();
const SignUpStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Username" component={UsernameScreen} />
      <Stack.Screen name="Email" component={EmailScreen} />
      {/* <Stack.Screen name="CheckMail" component={CheckMailScreen} /> */}
    </Stack.Navigator>
  );
};

export default SignUpStack;
