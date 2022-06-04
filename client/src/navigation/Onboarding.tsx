import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../components/screens/Home';
import EmailScreen from '../components/screens/Email';
import CheckMailScreen from '../components/screens/CheckMail';
import UsernameScreen from '../components/screens/Username';
import PasscodeScreen from '../components/screens/Passcode';
import ConfirmPasscodeScreen from '../components/screens/ConfirmPasscode';

const Stack = createNativeStackNavigator();
const OnboardingStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Email" component={EmailScreen} />
      <Stack.Screen name="Username" component={UsernameScreen} />
      <Stack.Screen name="Passcode" component={PasscodeScreen} />
      <Stack.Screen name="ConfirmPasscode" component={ConfirmPasscodeScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingStack;
