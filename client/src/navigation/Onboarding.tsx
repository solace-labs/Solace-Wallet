import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import PasscodeScreen from '../components/screens/onboarding/Passcode/Passcode';
import ConfirmPasscodeScreen from '../components/screens/onboarding/ConfirmPasscode/ConfirmPasscode';
import GoogleDriveScreen from '../components/screens/onboarding/GoogleDrive/GoogleDrive';
import Login from '../components/screens/onboarding/Login/Login';

const Stack = createNativeStackNavigator();
const OnboardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Passcode" component={PasscodeScreen} />
      <Stack.Screen name="ConfirmPasscode" component={ConfirmPasscodeScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="GoogleDrive" component={GoogleDriveScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
