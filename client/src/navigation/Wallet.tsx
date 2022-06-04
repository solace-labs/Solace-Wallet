import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WalletScreen from '../components/screens/Wallet';
import SendScreen from '../components/screens/Wallet/Send';
import AddContactScreen from '../components/screens/Wallet/AddContact';
import ContactScreen from '../components/screens/Wallet/Contact';
import AssetScreen from '../components/screens/Wallet/Asset';
import AddGuardian from '../components/screens/Wallet/AddGuardian';
import Guardian from '../components/screens/Wallet/Guardian';

const Stack = createNativeStackNavigator();

const WalletStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Wallet"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="Send" component={SendScreen} />
      <Stack.Screen name="AddContact" component={AddContactScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Asset" component={AssetScreen} />
      <Stack.Screen name="AddGuardian" component={AddGuardian} />
      <Stack.Screen name="Guardian" component={Guardian} />
    </Stack.Navigator>
  );
};

export default WalletStack;
