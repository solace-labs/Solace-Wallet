import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React from 'react';
import styles from './styles';

export type Props = {
  navigation: any;
};

const GoogleDriveScreen: React.FC<Props> = ({navigation}) => {
  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Image
            source={require('../../../../assets/images/solace/google-drive.png')}
            style={styles.image}
          />
          <Text style={styles.heading}>secure your wallet</Text>
          <Text style={styles.subHeading}>
            store your encrypted key in google drive so you can recover your
            wallet if you lose your device
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('MainPasscode')}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>enable now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
