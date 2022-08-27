/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import styles from './styles';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalContext} from '../../../../state/contexts/GlobalContext';
import GuardianTab from '../../../wallet/GuardianTab/GuardianTab';
import {Contact} from '../../../wallet/ContactItem/ContactItem';
import GuardianSecondTab from '../../../wallet/GuardianSecondTab/GuardianSecondTab';
import {PublicKey, SolaceSDK} from 'solace-sdk';

export type Props = {
  navigation: any;
};

export type PublicKeyType = InstanceType<typeof PublicKey>;

const Guardian: React.FC<Props> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(1);
  const {state, dispatch} = useContext(GlobalContext);
  const [loading, setLoading] = useState(false);
  const [guardians, setGuardians] = useState<{
    approved: PublicKeyType[];
    pending: PublicKeyType[];
  }>({approved: [], pending: []});
  const [guarding, setGuarding] = useState<PublicKeyType[]>([]);
  // console.log(guardians);

  const getGuardians = async () => {
    console.log('here');
    setLoading(true);
    const sdk = state.sdk!;
    const {
      pendingGuardians,
      approvedGuardians,
      guarding: whoIProtect,
    } = await sdk.fetchWalletData();
    console.log({pendingGuardians, approvedGuardians, guarding});
    setGuardians({
      approved: approvedGuardians,
      pending: pendingGuardians,
    });
    setGuarding(whoIProtect);
    setLoading(false);
  };

  useEffect(() => {
    const willFocusSubscription = navigation.addListener('focus', () => {
      getGuardians();
    });
    return willFocusSubscription;
  }, [navigation]);

  const renderTab = () => {
    switch (activeTab) {
      case 1:
        return <GuardianTab guardians={guardians} loading={loading} />;
      case 2:
        return <GuardianSecondTab guarding={guarding} />;
      default:
        return <Text style={{color: 'white'}}>404 not found</Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.headerContainer}>
        <View style={styles.subHeaderContainer}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="back" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.mainText}>guardians</Text>
        </View>
        <TouchableOpacity>
          <AntDesign
            name="infocirlceo"
            style={[styles.icon, {color: '#9999a5'}]}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            {borderBottomColor: activeTab === 1 ? 'white' : 'transparent'},
          ]}
          onPress={() => setActiveTab(1)}>
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 1 ? 'white' : '#9999a5'},
            ]}>
            my guardians
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            {borderBottomColor: activeTab === 2 ? 'white' : 'transparent'},
          ]}
          onPress={() => setActiveTab(2)}>
          <Text
            style={[
              styles.tabText,
              {color: activeTab === 2 ? 'white' : '#9999a5'},
            ]}>
            who i protect
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>{renderTab()}</View>

      <View style={styles.endContainer}>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddGuardian')}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>add guardian</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Guardian;
