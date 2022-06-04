import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React from 'react';
import styles from './styles';
// import * as solana from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Props = {
  navigation: any;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  // console.log(solana);
  const getData = async () => {
    const data = await AsyncStorage.getItem('passcode');
    console.log('DATA: ', data);
  };

  getData();

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../assets/images/solace/solace-icon.png')}
          />
          <Text style={styles.logo}>Solace</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Email')}
            style={[styles.buttonStyle, styles.createButton]}>
            <Text style={styles.buttonTextStyle}>create new wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Email')}
            style={[styles.buttonStyle, styles.secondButton]}>
            <Text style={[styles.buttonTextStyle, styles.secondButtonText]}>
              recover your wallet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
export default HomeScreen;
