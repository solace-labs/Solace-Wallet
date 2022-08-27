import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';
import {GlobalContext, NETWORK} from '../../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../../hooks/useLocalStorage';
import {KeyPair, SolaceSDK} from 'solace-sdk';
import {showMessage} from 'react-native-flash-message';
import {airdrop} from '../../../../utils/relayer';

export type Props = {
  navigation: any;
};

const AirdropScreen: React.FC<Props> = ({navigation}) => {
  const {state} = useContext(GlobalContext);
  const [tokens] = useLocalStorage('tokens', {});
  const [loading, setLoading] = useState({
    value: false,
    message: 'request now',
  });

  const handleClick = async () => {
    try {
      const privateKey = state.user?.ownerPrivateKey!;
      console.log(privateKey);
      const keypair = KeyPair.fromSecretKey(
        Uint8Array.from(privateKey.split(',').map(e => +e)),
      );
      const {publicKey} = keypair;
      const publicKeyString = publicKey.toString();
      const accessToken = tokens.accesstoken;
      /** Requesting Airdrop */
      console.log('REQUESTING');
      const data = await requestAirdrop(publicKeyString, accessToken);
      /** Airdrop confirmation */
      console.log('AIRDROP CONFIRMATION');
      await confirmTransaction(data);
      navigation.reset({
        index: 0,
        routes: [{name: 'CreateWallet'}],
      });
    } catch (e) {
      console.log(e);
    }
  };

  const requestAirdrop = async (publicKey: string, accessToken: string) => {
    console.log({publicKey, accessToken});
    setLoading({
      value: true,
      message: 'requesting air drop...',
    });
    try {
      const data: any = await airdrop(publicKey, accessToken);
      showMessage({
        message: 'transaction sent',
        type: 'success',
      });
      return data;
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
      throw e;
    }
  };

  const confirmTransaction = async (transactionId: string) => {
    setLoading({
      value: true,
      message: 'confirming transaction...',
    });
    console.log({transactionId});
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
        if (NETWORK === 'local') {
          await SolaceSDK.localConnection.confirmTransaction(transactionId);
        } else {
          await SolaceSDK.testnetConnection.confirmTransaction(transactionId);
        }
        showMessage({
          message: 'airdrop recieved',
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
          showMessage({
            message: 'it took longer than expected. tyring again...',
            type: 'info',
          });
          retry++;
        } else {
          confirm = true;
          console.log('OTHER ERROR: ', e.message);
          retry++;
          // showMessage({
          //   message: 'some error verifying transaction',
          //   type: 'danger',
          // });
          // throw e;
        }
      }
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>request airdrop</Text>
          <Text style={styles.subHeading}>
            store your encrypted key in google drive so you can recover your
            wallet if you lose your device
          </Text>
        </View>

        {loading.value && <ActivityIndicator size="small" />}

        <TouchableOpacity
          disabled={loading.value}
          onPress={() => {
            handleClick();
          }}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>{loading.message}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AirdropScreen;
