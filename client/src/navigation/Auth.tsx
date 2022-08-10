import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FingerprintScreen from '../components/screens/Figerprint/Fingerprint';
import MainPasscodeScreen from '../components/screens/MainPasscode/MainPasscode';

const Stack = createNativeStackNavigator();
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="MainPasscode"
      screenOptions={{headerShown: false}}>
      {/* <Stack.Screen name="LoginIn" component={LoginScreen} /> */}
      <Stack.Screen name="MainPasscode" component={MainPasscodeScreen} />
      <Stack.Screen name="Fingerprint" component={FingerprintScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
