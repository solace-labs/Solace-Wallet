import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, {useContext} from 'react';
import styles from './styles';
import {SolaceSDK} from 'solace-sdk';
import {GlobalContext} from '../../../../state/contexts/GlobalContext';
import {setUser} from '../../../../state/actions/global';

export type Props = {
  navigation: any;
};

const Loading: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={require('../../../../../assets/images/solace/solace-icon.png')}
          />
          <Text style={styles.logo}>Solace</Text>
          <ActivityIndicator size="small" />
        </View>
      </View>
    </ScrollView>
  );
};
export default Loading;
