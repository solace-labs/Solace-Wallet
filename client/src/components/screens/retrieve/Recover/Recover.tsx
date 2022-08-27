import {View, Text, ScrollView, Image} from 'react-native';
import React, {useCallback, useContext, useEffect, useState} from 'react';
import styles from './styles';
import {setAccountStatus} from '../../../../state/actions/global';
import {
  AccountStatus,
  GlobalContext,
} from '../../../../state/contexts/GlobalContext';
import useLocalStorage from '../../../../hooks/useLocalStorage';
export type Props = {
  navigation: any;
};

const RecoverScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);
  const [setStoredUser] = useLocalStorage('user', {});
  const [created, setCreated] = useState(false);

  const setToLocalStorage = useCallback(async () => {
    await setStoredUser(state.user);
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  }, [setStoredUser, state.user, dispatch]);

  useEffect(() => {
    if (created) {
      setToLocalStorage();
    }
  }, [created, setToLocalStorage]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          {/* <Image
            source={require('../../../../../assets/images/solace/google-drive.png')}
            style={styles.image}
          /> */}
          <Text style={styles.heading}>recovering your wallet</Text>
          <Text style={styles.subHeading}>
            please request your guardians to approve your solace wallet
            recovery. in the mean time, your funds will be protected by the
          </Text>
          <Text style={styles.safeMode}>safe mode</Text>
          <Image
            source={require('../../../../../assets/images/solace/secrurity.png')}
            style={styles.contactImage}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default RecoverScreen;
