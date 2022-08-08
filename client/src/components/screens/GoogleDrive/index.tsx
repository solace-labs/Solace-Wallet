import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {setAccountStatus, setUser} from '../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
} from '../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../hooks/useLocalStorage';
import {SolaceSDK} from 'solace-sdk';

export type Props = {
  navigation: any;
};

const GoogleDriveScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);
  const [storedUser, setStoredUser] = useLocalStorage('user', {});
  const [created, setCreated] = useState(false);

  const setToLocalStorage = useCallback(async () => {
    await setStoredUser(state.user);
  }, [setStoredUser, state.user]);

  const storeToGoogleDrive = async () => {
    /** TODO: Store to google drive */

    await requestAirdrop();
    await createWallet();
  };

  const requestAirdrop = async () => {
    console.log('requesting airdrop');
    const keypair = state?.user?.keypair!;
    const LAMPORTS_PER_SOL = 1000000000;
    const tx = await SolaceSDK.localConnection.requestAirdrop(
      keypair.publicKey,
      1 * LAMPORTS_PER_SOL,
    );
    await SolaceSDK.localConnection.confirmTransaction(tx);
    console.log('airdrop confirmed');
  };

  const createWallet = async () => {
    console.log('creating wallet');
    const username = state?.user?.solaceName!;
    const keypair = state?.user?.keypair!;
    const sdk = await SolaceSDK.createFromName(username, {
      network: 'local',
      owner: keypair,
      programAddress: '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw',
    });
    console.log('wallet created');
    dispatch(setUser({...state.user, isWalletCreated: true}));
    setCreated(true);
  };

  useEffect(() => {
    if (created) {
      setToLocalStorage();
      dispatch(setAccountStatus(AccountStatus.EXISITING));
    }
  }, [created, setToLocalStorage, dispatch]);

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
          onPress={() => {
            storeToGoogleDrive();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>enable now</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GoogleDriveScreen;
