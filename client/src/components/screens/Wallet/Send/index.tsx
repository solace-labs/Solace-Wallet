import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
} from 'react-native';
import React, {useContext} from 'react';
import styles from './styles';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalContext} from '../../../../state/contexts/GlobalContext';
import ContactItem from '../../../wallet/ContactItem';

export type Props = {
  navigation: any;
};

const SendScreen: React.FC<Props> = ({navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.headerContainer}>
        <View style={styles.leftHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <AntDesign name="back" style={styles.icon} />
          </TouchableOpacity>
          <Text style={styles.mainText}>send</Text>
        </View>
        <View style={styles.rightHeader}>
          <TouchableOpacity onPress={() => navigation.navigate('AddContact')}>
            <AntDesign name="plus" style={styles.icon} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.inputContainer}>
        <AntDesign name="search1" style={styles.searchIcon} />
        <View style={styles.inputWrap}>
          <TextInput
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect={false}
            style={styles.textInput}
            placeholderTextColor="#9999a5"
            placeholder="username or address"
          />
        </View>
        <View style={styles.sendGiftContainer}>
          <AntDesign name="gift" style={styles.giftIcon} />
          <Text style={styles.buttonText}>send a gift</Text>
        </View>
      </View>
      {state?.contacts?.length! > 0 ? (
        <View style={styles.contactContainer}>
          {state?.contacts?.map((contact, index) => {
            return <ContactItem contact={contact} key={contact.username} />;
          })}
        </View>
      ) : (
        <View style={styles.sendContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../../../assets/images/solace/send-money.png')}
              style={styles.contactImage}
            />
            <Text style={styles.buttonText}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddContact')}>
                <Text style={styles.secondaryText}>add a contact</Text>
              </TouchableOpacity>{' '}
              to send to Solace or Solana addresses
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default SendScreen;
