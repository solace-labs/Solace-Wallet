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
const OnboardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="GoogleDrive"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Passcode" component={PasscodeScreen} />
      <Stack.Screen name="ConfirmPasscode" component={ConfirmPasscodeScreen} />
      <Stack.Screen name="GoogleDrive" component={GoogleDriveScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
