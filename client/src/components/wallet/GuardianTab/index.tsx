import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import moment from 'moment';
import styles from './styles';
import Navigation from '../../../navigation';
import {useNavigation} from '@react-navigation/native';
import {Contact} from '../ContactItem';

export type Props = {
  guardians: Contact[];
};

const GuardianTab: React.FC<Props> = ({guardians}) => {
  const navigation: any = useNavigation();

  const renderGuardian = (guardian: Contact) => {
    return (
      <View key={guardian.id} style={styles.container}>
        <View style={styles.item}>
          <View style={styles.leftSide}>
            <View style={styles.guardianImageContainer}>
              <Text style={styles.guardianImageText}>
                {guardian.name
                  .split(' ')
                  .map(word => word[0])
                  .join('')
                  .toLowerCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.securityText}>{guardian.name}</Text>
              <Text style={[styles.responseText, {color: '#D27D00'}]}>
                awaiting response
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
    <View style={styles.mainContainer}>
      {guardians.length > 0 ? (
        <View style={styles.guardiansContainer}>
          <View style={styles.container}>
            <View style={styles.item}>
              <View style={styles.leftSide}>
                <View style={styles.guardianImageContainer}>
                  <Text style={styles.guardianImageText}>S</Text>
                </View>
                <View>
                  <Text style={styles.securityText}>solace security</Text>
                  <Text style={styles.dateText}>enabled on 24/05/22</Text>
                </View>
              </View>
            </View>
          </View>

          {guardians.map((guardian, index) => {
            return renderGuardian(guardian);
          })}
        </View>
      ) : (
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../assets/images/solace/secrurity.png')}
            style={styles.contactImage}
          />
          <Text style={styles.buttonText}>
            you need 1 guardian approval for solace wallet recovery or to
            approve an untrusted transaction
          </Text>
        </View>
      )}
    </View>
  );
};

export default GuardianTab;
