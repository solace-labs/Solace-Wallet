import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../components/screens/Home/Home';
import EmailScreen from '../components/screens/Email/Email';
import UsernameScreen from '../components/screens/Username/Username';

const Stack = createNativeStackNavigator();
const SignUpStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{headerShown: false}}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Username" component={UsernameScreen} />
      <Stack.Screen name="Email" component={EmailScreen} />
      {/* <Stack.Screen name="CheckMail" component={CheckMailScreen} /> */}
    </Stack.Navigator>
  );
};

export default SignUpStack;
