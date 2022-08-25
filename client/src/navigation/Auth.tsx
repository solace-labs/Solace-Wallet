import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FingerprintScreen from '../components/screens/auth/Figerprint/Fingerprint';
import MainPasscodeScreen from '../components/screens/auth/MainPasscode/MainPasscode';
import LoginScreen from '../components/screens/auth/LoginScreen/Login';
import Loading from '../components/screens/auth/Loading/Loading';

const Stack = createNativeStackNavigator();
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName={'Loading'}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Loading" component={Loading} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainPasscode" component={MainPasscodeScreen} />
      <Stack.Screen name="Fingerprint" component={FingerprintScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
