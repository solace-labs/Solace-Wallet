import React, {useContext} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FingerprintScreen from '../components/screens/auth/Figerprint/Fingerprint';
import MainPasscodeScreen from '../components/screens/auth/MainPasscode/MainPasscode';
import LoginScreen from '../components/screens/auth/LoginScreen/Login';
import {AccountStatus, GlobalContext} from '../state/contexts/GlobalContext';

const Stack = createNativeStackNavigator();
const AuthStack = () => {
  const {state, dispatch} = useContext(GlobalContext);

  const route = 'Login';

  return (
    <Stack.Navigator
      initialRouteName={route}
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="MainPasscode" component={MainPasscodeScreen} />
      <Stack.Screen name="Fingerprint" component={FingerprintScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
