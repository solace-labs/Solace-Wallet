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

const GuardianSecondTab: React.FC<Props> = ({guardians}) => {
  const navigation: any = useNavigation();
  return (
    <View style={styles.container}>
      {[].length > 0 ? (
        <Text>Guardian</Text>
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
