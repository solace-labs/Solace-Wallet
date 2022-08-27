import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';

import AntDesign from 'react-native-vector-icons/AntDesign';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import {
  addNewContact,
  setAccountStatus,
  setSDK,
} from '../../../../state/actions/global';
import {KeyPair, PublicKey, SolaceSDK} from 'solace-sdk';
import {
  getMeta,
  relayTransaction,
  requestGuardian,
} from '../../../../utils/relayer';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {showMessage} from 'react-native-flash-message';
import EncryptedStorage from 'react-native-encrypted-storage';
import {NavigationProp} from '@react-navigation/native';

export type Props = {
  navigation: any;
};

const AddGuardian: React.FC<Props> = ({navigation}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState(
    'GNgMfSSJ4NjSuu1EdHj94P6TzQS24KH38y1si2CMrUsF',
  );
  const {state, dispatch} = useContext(GlobalContext);
  const [tokens, setTokens] = useLocalStorage('tokens', {});
  const [loading, setLoading] = useState({
    value: false,
    message: '',
  });

  // const addContact = () => {
  //   if (name && address) {
  //     const newContact = {
  //       id: new Date().getTime().toString() + Math.random().toString(),
  //       name,
  //       address,
  //       username: `${name.split(' ')[0]}.solace.money`,
  //     };
  //     dispatch(addNewContact(newContact));
  //     navigation.navigate('Send');
  //   } else {
  //     Alert.alert('Please enter all the details');
  //   }
  // };

  const addGuardian = async () => {
    const sdk = state.sdk!;
    const walletName = state.user?.solaceName!;
    const solaceWalletAddress = sdk.wallet.toString();
    const accessToken = tokens.accesstoken;
    try {
      const feePayer = new PublicKey(await getFeePayer(accessToken));
      const guardianPublicKey = new PublicKey(address);
      const tx = await sdk.addGuardian(guardianPublicKey, feePayer);
      const res = await relayTransaction(tx, accessToken);
      const transactionId = res.data;
      await confirmTransaction(transactionId);
      await requestGuardian(
        {
          guardianAddress: guardianPublicKey.toString(),
          solaceWalletAddress,
          walletName,
        },
        accessToken,
      );
      setLoading({
        message: '',
        value: false,
      });
      navigation.goBack();
    } catch (e) {
      console.log('MAIN ERROR:', e);
    }
  };

  const confirmTransaction = async (data: string) => {
    setLoading({
      value: true,
      message: 'confirming transaction...',
    });
    console.log({data});
    let confirm = false;
    let retry = 0;
    while (!confirm) {
      if (retry > 0) {
        setLoading({
          value: true,
          message: 'retrying confirmation...',
        });
      }
      if (retry === 3) {
        setLoading({
          value: false,
          message: 'some error. try again?',
        });
        confirm = true;
        continue;
      }
      try {
        const res = await SolaceSDK.testnetConnection.confirmTransaction(data);
        showMessage({
          message: 'transaction confirmed - guardian added',
          type: 'success',
        });
        confirm = true;
      } catch (e: any) {
        if (
          e.message.startsWith(
            'Transaction was not confirmed in 60.00 seconds.',
          )
        ) {
          console.log('Timeout');
          retry++;
        } else {
          // confirm = true;
          console.log('OTHER ERROR: ', e.message);
          retry++;
          // throw e;
        }
      }
    }
  };

  const getFeePayer = async (accessToken: string) => {
    setLoading({
      message: 'getting fee payer...',
      value: true,
    });
    try {
      const response = await getMeta(accessToken);
      return response.feePayer;
    } catch (e: any) {
      setLoading({
        message: 'failed. retry again',
        value: false,
      });
      console.log('FEE PAYER', e.status);
      if (e.message === 'Request failed with status code 401') {
        showMessage({
          message: 'You need to login again',
          type: 'info',
        });
        await EncryptedStorage.removeItem('tokens');
        dispatch(setAccountStatus(AccountStatus.EXISITING));
      }
      throw e;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="back" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.mainText}>add manually</Text>
      </View>
      <View style={styles.inputContainer}>
        {/* <TextInput
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          value={name}
          onChangeText={setName}
          style={styles.textInput}
          placeholderTextColor="#9999a5"
          placeholder="name"
        /> */}
        <View style={styles.inputWrap}>
          <TextInput
            autoCapitalize="none"
            autoComplete="off"
            value={address}
            onChangeText={setAddress}
            autoCorrect={false}
            style={[styles.textInput, styles.textInputAddress]}
            placeholderTextColor="#9999a5"
            placeholder="solace or solana address"
          />
          <MaterialCommunityIcons name="line-scan" style={styles.scanIcon} />
        </View>
      </View>

      {/* <View style={styles.subTextContainer}>
        <AntDesign name="checkcircleo" style={styles.subIcon} />
        <Text style={styles.subText}>address found</Text>
      </View>
      <View style={[styles.subTextContainer, {marginTop: 0}]}>
        <Text style={styles.buttonText}>0x8zo881ixpzAdiZ2802hz00zc</Text>
      </View> */}

      {/* <View style={styles.networkContainer}>
        <Text style={styles.secondText}>network</Text>
        <Text style={styles.solanaText}>solana</Text>
      </View> */}
      <View style={{flexGrow: 1, paddingTop: 20}}>
        {loading.value && <ActivityIndicator size="small" />}
      </View>
      {/* {loading.value && (
        <Text style={styles.secondText}>{loading.message}</Text>
      )} */}
      {!loading.value && (
        <View style={styles.endContainer}>
          <TouchableOpacity
            // disabled={!name || !address}
            disabled={!address}
            onPress={() => addGuardian()}
            style={styles.buttonStyle}>
            <Text
              style={[
                styles.buttonTextStyle,
                // {color: !name || !address ? '#9999a5' : 'black'},
                {color: !address ? '#9999a5' : 'black'},
              ]}>
              add guardian
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading.value && (
        <View style={styles.endContainer}>
          <TouchableOpacity disabled={loading.value} style={styles.buttonStyle}>
            <Text style={[styles.buttonTextStyle, {color: '#9999a5'}]}>
              {loading.message}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

export default AddGuardian;
