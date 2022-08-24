import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useContext} from 'react';
import styles from './styles';
import {SolaceSDK} from 'solace-sdk';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import {setAccountStatus, setUser} from '../../../../state/actions/global';

export type Props = {
  navigation: any;
};

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);

  const createKeypair = async () => {
    // const keypair = SolaceSDK.newKeyPair();
    // const publicKey = keypair.publicKey.toString();
    // dispatch(
    //   setUser({
    //     ...state.user,
    //     publicKey,
    //     ownerPrivateKey: keypair.secretKey,
    //   }),
    // );

    navigation.navigate('Username');
  };

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../../assets/images/solace/solace-icon.png')}
          />
          <Text style={styles.logo}>Solace</Text>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={() => {
              createKeypair();
            }}
            style={[styles.buttonStyle, styles.createButton]}>
            <Text style={styles.buttonTextStyle}>create new wallet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => dispatch(setAccountStatus(AccountStatus.RETRIEVE))}
            style={[styles.buttonStyle, styles.secondButton]}>
            <Text style={[styles.buttonTextStyle, styles.secondButtonText]}>
              retrieve your wallet
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};
export default HomeScreen;
