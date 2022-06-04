import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalContext} from '../../../../state/contexts/GlobalContext';
import GuardianTab from '../../../wallet/GuardianTab';
import {Contact} from '../../../wallet/ContactItem';
import GuardianSecondTab from '../../../wallet/GuardianSecondTab';

export type Props = {
  navigation: any;
};

const Guardian: React.FC<Props> = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(1);
  const {state, dispatch} = useContext(GlobalContext);
  const guardians: Contact[] = [
    {
      name: 'john doe',
      address: '0x0',
      id: '12341235',
      username: 'john.solace.money',
    },
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 1:
        return <GuardianTab guardians={guardians} />;
      case 2:
        return <GuardianSecondTab guardians={guardians} />;
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
