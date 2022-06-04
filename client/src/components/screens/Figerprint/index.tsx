import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  TextInputComponent,
  Pressable,
  Alert,
  Image,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import styles from './styles';

export type Props = {
  navigation: any;
};

const FingerprintScreen: React.FC<Props> = ({navigation}) => {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.headingContainer}>
          <Image
            source={require('../../../../assets/images/solace/solace-icon.png')}
            style={styles.image}
          />
          <Text style={styles.username}>solace</Text>
        </View>
        <View style={styles.textContainer}>
          <Image
            source={require('../../../../assets/images/solace/light-fingerprint.png')}
            style={styles.fingerprint}
          />
          <Text style={styles.heading}>unlock with fingerprint</Text>
          <TouchableOpacity onPress={() => navigation.navigate('MainPasscode')}>
            <Text style={styles.fingerprintText}>use passcode</Text>
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity
          onPress={() => navigation.navigate('Wallet')}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>next</Text>
        </TouchableOpacity> */}
      </View>
    </ScrollView>
  );
};

export default FingerprintScreen;
