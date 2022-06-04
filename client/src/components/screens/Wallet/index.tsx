import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from './styles';
import {GlobalContext} from '../../../state/contexts/GlobalContext';
import {changeUserName, setUser} from '../../../state/actions/global';
import AssetScreen from './Asset';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Props = {
  navigation: any;
};

const WalletScreen: React.FC<Props> = ({navigation}) => {
  const DATA = [
    {
      id: 1,
      date: new Date(),
      username: 'ashwin.solace.money',
    },
    {
      id: 2,
      date: new Date(),
      username: 'ankit.solace.money',
    },
    {
      id: 3,
      date: new Date(),
      username: 'ashwin.solace.money',
    },
    {
      id: 4,
      date: new Date(),
      username: 'ankit.solace.money',
    },
    {
      id: 5,
      date: new Date(),
      username: 'ashwin.solace.money',
    },
    {
      id: 6,
      date: new Date(),
      username: 'ankit.solace.money',
    },
    {
      id: 7,
      date: new Date(),
      username: 'ashwin.solace.money',
    },
    {
      id: 8,
      date: new Date(),
      username: 'ankit.solace.money',
    },
    {id: 9, username: 'sethi.solace.money', date: new Date()},
  ];

  const [username, setUsername] = useState('');

  const {
    state: {user},
    dispatch,
  } = useContext(GlobalContext);

  const handleSend = () => {
    navigation.navigate('Send');
  };

  useEffect(() => {
    const getInitialData = async () => {
      const userdata = await AsyncStorage.getItem('user');
      if (userdata) {
        const _user = JSON.parse(userdata);
        dispatch(setUser(_user));
      }
    };
    getInitialData();
  }, [dispatch]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Guardian')}
        style={styles.iconContainer}>
        <AntDesign name="lock" style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.headingContainer}>
        <Image
          source={require('../../../../assets/images/solace/solace-icon.png')}
          style={styles.image}
        />
        <Text style={styles.username}>
          {user?.username ? user.username : username}.solace.money
        </Text>
      </View>
      <View style={styles.headingContainer}>
        <Text style={styles.price}>$0.04</Text>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => handleSend()}>
            <View style={styles.iconBackground}>
              <AntDesign name="arrowup" size={20} color="black" />
            </View>
            <Text style={styles.buttonText}>send</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonContainer}>
            <View style={styles.iconBackground}>
              <MaterialCommunityIcons
                name="line-scan"
                size={20}
                color="black"
              />
            </View>
            <Text style={styles.buttonText}>scan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={() => AsyncStorage.removeItem('user')}>
            <View style={styles.iconBackground}>
              <AntDesign name="arrowdown" size={20} color="black" />
            </View>
            <Text style={styles.buttonText}>recieve</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.walletContainer}>
        <View style={styles.walletHeader}>
          <Text style={styles.heading}>wallet activity</Text>
          <TouchableOpacity>
            {/* <Text style={styles.sideHeading}>see more</Text> */}
            <Text style={styles.sideHeading}>unavailable</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../assets/images/solace/contact-screen.png')}
            style={styles.contactImage}
          />
          <Text style={styles.buttonText}>
            visit <Text style={styles.secondaryText}>solscan</Text> to view your
            transaction history
          </Text>
        </View>
        {/* <ScrollView>
          {DATA.map((item: any) => {
            return <Transaction key={item.id} item={item} />;
          })}
        </ScrollView> */}
      </View>
    </ScrollView>
  );
};

export default WalletScreen;
