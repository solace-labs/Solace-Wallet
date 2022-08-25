/* eslint-disable react-hooks/exhaustive-deps */
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useContext} from 'react';
import styles from './styles';
import {GlobalContext} from '../../../state/contexts/GlobalContext';
import {PublicKeyType} from '../../screens/wallet/Guardian/Guardian';

export type Props = {
  guardians: {
    approved: PublicKeyType[];
    pending: PublicKeyType[];
  };
  loading: boolean;
};

const GuardianTab: React.FC<Props> = ({guardians, loading}) => {
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
                awaiting response
              </Text>
            </View>
          </View>
          {/* <View style={styles.rightSide}>
            <TouchableOpacity>
              <Text style={styles.acceptButton}>tap to confirm</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
    );
  };
  if (loading) {
    return (
      <View
        style={[
          styles.mainContainer,
          {flexDirection: 'row', flex: 1, justifyContent: 'center'},
        ]}>
        <ActivityIndicator size="small" />
      </View>
    );
  }
  return (
    <View style={styles.mainContainer}>
      {
        /*guardians */ guardians.pending.length > 0 ? (
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

            {guardians.pending.map((guardian, index) => {
              return renderGuardian(guardian, index);
            })}
            {guardians.approved.map((guardian, index) => {
              return renderGuardian(guardian, index);
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
        )
      }
    </View>
  );
};

export default GuardianTab;
