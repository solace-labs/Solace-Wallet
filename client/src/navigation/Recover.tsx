import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GoogleDriveScreen from '../components/screens/retrieve/GoogleDrive/GoogleDrive';
import PasscodeScreen from '../components/screens/retrieve/Passcode/Passcode';
import GuardianRecovery from '../components/screens/retrieve/GuardianRecovery/GuardianRecovery';
import RecoverScreen from '../components/screens/retrieve/Recover/Recover';
import Login from '../components/screens/retrieve/Login/Login';

const Stack = createNativeStackNavigator();

const RecoverStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="GuardianRecovery" component={GuardianRecovery} />
      <Stack.Screen name="Recover" component={RecoverScreen} />
    </Stack.Navigator>
  );
};

export default RecoverStack;
