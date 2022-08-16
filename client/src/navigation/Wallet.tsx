import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WalletHomeScreen from '../components/screens/wallet/WalletHome/WalletHome';
import SendScreen from '../components/screens/wallet/Send/Send';
import AddContactScreen from '../components/screens/wallet/AddContact/AddContact';
import ContactScreen from '../components/screens/wallet/Contact/Contact';
import AssetScreen from '../components/screens/wallet/Asset/Asset';
import AddGuardian from '../components/screens/wallet/AddGuardian/AddGuardian';
import Guardian from '../components/screens/wallet/Guardian/Guardian';

const Stack = createNativeStackNavigator();

const WalletStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Wallet"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Wallet" component={WalletHomeScreen} />
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
