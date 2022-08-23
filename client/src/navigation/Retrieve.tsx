import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GoogleDriveScreen from '../components/screens/retrieve/GoogleDrive/GoogleDrive';
import PasscodeScreen from '../components/screens/retrieve/Passcode/Passcode';
import GuardianRecovery from '../components/screens/retrieve/GuardianRecovery/GuardianRecovery';
import RecoverScreen from '../components/screens/retrieve/Recover/Recover';

const Stack = createNativeStackNavigator();

const RetrieveStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="GoogleDrive"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="GoogleDrive" component={GoogleDriveScreen} />
      <Stack.Screen name="Passcode" component={PasscodeScreen} />
      <Stack.Screen name="GuardianRecovery" component={GuardianRecovery} />
      <Stack.Screen name="Recover" component={RecoverScreen} />
      {/* <Stack.Screen name="Send" component={SendScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Asset" component={AssetScreen} />
      <Stack.Screen name="AddGuardian" component={AddGuardian} />
      <Stack.Screen name="Guardian" component={Guardian} /> */}
    </Stack.Navigator>
  );
};

export default RetrieveStack;
