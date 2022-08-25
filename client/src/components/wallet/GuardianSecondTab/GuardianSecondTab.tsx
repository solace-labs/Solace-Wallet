import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import moment from 'moment';
import styles from './styles';
import Navigation from '../../../navigation/Navigation';
import {useNavigation} from '@react-navigation/native';
import {Contact} from '../ContactItem/ContactItem';
import {PublicKeyType} from '../../screens/wallet/Guardian/Guardian';

export type Props = {
  guarding: PublicKeyType[];
};

const GuardianSecondTab: React.FC<Props> = ({guarding}) => {
  const navigation: any = useNavigation();
  const renderGuardian = (guardian: PublicKeyType, index: number) => {
    return (
      <View key={index} style={styles.container}>
        <View style={styles.item}>
          <View style={styles.leftSide}>
            <View style={styles.guardianImageContainer}>
              <Text style={styles.guardianImageText}>
                {guardian
                  .toString()
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toLowerCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.securityText}>
                {guardian.toString().slice(0, 25)}...
              </Text>
              <Text style={[styles.responseText, {color: '#D27D00'}]}>
                {/* awaiting response */}
              </Text>
            </View>
          </View>
          <View style={styles.rightSide}>
            <TouchableOpacity>
              <Text style={styles.acceptButton}>tap to confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {guarding.length > 0 ? (
        <View style={styles.guardiansContainer}>
          <View style={styles.container}>
            <View style={styles.item}>
              <View style={styles.leftSide}>
                <View style={styles.guardianImageContainer}>
                  <Text style={styles.guardianImageText}>S</Text>
                </View>
                <View>
                  <Text style={styles.securityText}>solace security</Text>
                  <Text style={styles.dateText}>coming soon...</Text>
                </View>
              </View>
            </View>
          </View>
          {guarding.map((guardian, index) => {
            return renderGuardian(guardian, index);
          })}
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../assets/images/solace/secrurity.png')}
            style={styles.contactImage}
          />
          {/* <Text style={styles.buttonText}>
            you need 1 guardian approval for solace wallet recovery or to
            approve an untrusted transaction
          </Text> */}
        </View>
      )}
    </View>
  );
};

export default GuardianSecondTab;
