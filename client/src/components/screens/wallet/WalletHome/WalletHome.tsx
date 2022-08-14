import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useContext, useEffect, useState} from 'react';
import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import styles from './styles';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import {
  changeUserName,
  setAccountStatus,
  setUser,
} from '../../../../state/actions/global';
import AssetScreen from '../Asset/Asset';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SolaceSDK} from 'solace-sdk';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {accountSize} from '@project-serum/anchor/dist/cjs/coder';

export type Props = {
  navigation: any;
};

const WalletHomeScreen: React.FC<Props> = ({navigation}) => {
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
  const [storedUser, setStoredUser] = useLocalStorage('user', {});

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

  const logout = () => {
    setStoredUser({});
    dispatch(setUser({}));
    dispatch(setAccountStatus(AccountStatus.NEW));
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.headerIcons}>
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Guardian')}
            style={styles.iconContainer}>
            <AntDesign name="lock" style={styles.icon} />
          </TouchableOpacity>
        </View>
        <View>
          <TouchableOpacity
            onPress={() => logout()}
            style={styles.iconContainer}>
            <AntDesign name="logout" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.headingContainer}>
        <Image
          source={require('../../../../../assets/images/solace/solace-icon.png')}
          style={styles.image}
        />
        <Text style={styles.username}>
          {user?.solaceName ? user.solaceName : username}.solace.money
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
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={async () => {
              // const keypair = SolaceSDK.newKeyPair();
              // // const sdk = new SolaceSDK({
              // //   owner: keypair,
              // //   network: 'local',
              // //   programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
              // // });
              // // Request airdrop
              // console.log('requesting airdrop');
              // const LAMPORTS_PER_SOL = 1000000000;
              // const tx = await SolaceSDK.localConnection.requestAirdrop(
              //   keypair.publicKey,
              //   1 * LAMPORTS_PER_SOL,
              // );
              // await SolaceSDK.localConnection.confirmTransaction(tx);
              // console.log('airdrop confirmed');
              // // Check if the name is valid with my API
              // // await sdk.createWalletWithName(keypair, 'name', false);
              // // const s = await SolaceSDK.createFromName(username, keypair);
              // const sdk = await SolaceSDK.createFromName(username, {
              //   owner: keypair,
              //   network: 'local',
              //   programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
              // });
              // console.log({sdk});
              // SolaceSDK.retrieveFromName(username, {
              //   owner: keypair,
              //   programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
              //   network: 'local',
              // });
              // console.log('NEW WALLET', sdk.wallet);
            }}>
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
            // onPress={() => AsyncStorage.removeItem('user')}>
            onPress={() => {
              setStoredUser(undefined);
            }}>
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
            source={require('../../../../../assets/images/solace/contact-screen.png')}
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

export default WalletHomeScreen;
