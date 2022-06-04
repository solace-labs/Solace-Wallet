import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useContext, useState} from 'react';
import styles from './styles';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalContext} from '../../../../state/contexts/GlobalContext';

export type Props = {
  navigation: any;
};

const AssetScreen: React.FC<Props> = ({navigation}) => {
  const [amount, setAmount] = useState('0');
  const {dispatch} = useContext(GlobalContext);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="back" style={styles.icon} />
        </TouchableOpacity>
        <Text style={styles.mainText}>select an assest</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.assetName}>SOL</Text>
        <TextInput
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect={false}
          value={amount}
          keyboardType="decimal-pad"
          onChangeText={setAmount}
          style={styles.assetAmount}
          placeholderTextColor="#9999a5"
          placeholder="0"
        />
      </View>
      <View style={[styles.row, {marginTop: 10}]}>
        <Text style={styles.secondText}>30.2 SOL available</Text>
        <Text style={styles.secondText}>$600.2</Text>
      </View>
      <View style={[styles.row, {marginTop: 10, justifyContent: 'flex-end'}]}>
        <TouchableOpacity>
          <Text style={styles.buttonText}>use max</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.endContainer}>
        <TouchableOpacity
          disabled={!amount}
          // onPress={() => addContact()}
          style={[
            styles.buttonStyle,
            {backgroundColor: !amount ? 'lightgray' : 'white'},
          ]}>
          <Text style={styles.buttonTextStyle}>send</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default AssetScreen;
