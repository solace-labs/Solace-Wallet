import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {
  GlobalContext,
  myPublicKey,
  NETWORK,
  PROGRAM_ADDRESS,
} from '../../../../state/contexts/GlobalContext';
import {setSDK, setUser} from '../../../../state/actions/global';
import {PublicKey, SolaceSDK} from 'solace-sdk';
import {airdrop, getMeta, relayTransaction} from '../../../../utils/relayer';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {showMessage} from 'react-native-flash-message';

export type Props = {
  navigation: any;
};

export enum Status {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

const GuardianRecovery: React.FC<Props> = ({navigation}) => {
  const [loading, setLoading] = useState({
    value: false,
    message: 'recover',
  });
  const [tokens, setTokens] = useLocalStorage('tokens');
  const [storedUser, setStoredUser] = useLocalStorage('user');
  const {state, dispatch} = useContext(GlobalContext);

  const handleRecovery = async () => {
    const keypair = SolaceSDK.newKeyPair();
    try {
      setLoading({
        message: 'recovering...',
        value: false,
      });
      const newSDK = new SolaceSDK({
        network: NETWORK,
        programAddress: PROGRAM_ADDRESS,
        owner: keypair,
      });
      const username = state.user?.solaceName!;
      const accessToken = tokens.accesstoken;
      // const feePayer = myPublicKey;
      const feePayer = new PublicKey(await getFeePayer(accessToken));
      console.log({feePayer, username});
      const data = await requestAirdrop(
        keypair.publicKey.toString(),
        accessToken,
      );
      console.log('AIRDROP CONFIRMATION');
      await confirmTransaction(data);
      const tx = await newSDK.recoverWallet(username, feePayer);
      console.log({tx});
      const res = await relayTransaction(tx, accessToken);
      console.log({res});
      await confirmTransaction(res.data);
      setStoredUser({
        solaceName: username,
        ownerPrivateKey: keypair.secretKey.toString(),
        inRecovery: true,
      });
      dispatch(setSDK(newSDK));
      dispatch(
        setUser({
          ...state.user,
          solaceName: username,
          isWalletCreated: true,
        }),
      );
      setLoading({
        message: 'recovered',
        value: false,
      });
      navigation.navigate('Recover');
    } catch (e: any) {
      console.log('e', JSON.stringify(e));
      if (e.message === 'Request failed') {
        showMessage({
          message: 'already in recovery phase',
          type: 'info',
        });
      }
      setLoading({
        message: 'some error. try again?',
        value: false,
      });
    }
  };

  const requestAirdrop = async (publicKey: string, accessToken: string) => {
    console.log({publicKey, accessToken});
    setLoading({
      value: true,
      message: 'requesting air drop...',
    });
    try {
      const res: any = await airdrop(publicKey, accessToken);
      showMessage({
        message: 'transaction sent',
        type: 'success',
      });
      return res.data;
    } catch (e) {
      console.log('Airdrop error', e);
      setLoading({
        value: false,
        message: 'request now',
      });
      showMessage({
        message: 'error requesting airdrop. try again!',
        type: 'danger',
      });
      // throw e;
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
          message: 'transaction confirmed - wallet created',
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
          console.log('OTHER ERROR: ', e.message);
          retry++;
        }
      }
    }
  };

  const getFeePayer = async (accessToken: string) => {
    setLoading({
      message: 'recovering...',
      value: true,
    });
    try {
      const response = await getMeta(accessToken);
      console.log({response});
      return response.feePayer;
    } catch (e) {
      setLoading({
        message: 'create',
        value: false,
      });
      console.log('FEE PAYER', e);
      throw e;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>your solace username</Text>
          <Text style={styles.subHeading}>
            recover your solace account by guardians approval
          </Text>
        </View>
        {loading.value && <ActivityIndicator size="small" />}
        <TouchableOpacity
          disabled={loading.value}
          onPress={() => {
            handleRecovery();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>{loading.message}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default GuardianRecovery;
