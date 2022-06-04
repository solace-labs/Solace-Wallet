import {View, Text, TouchableOpacity, ScrollView, Image} from 'react-native';
import React, {useContext, useEffect} from 'react';
import styles from './styles';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {GlobalContext} from '../../../../state/contexts/GlobalContext';
import {getContact} from '../../../../state/actions/global';

export type Props = {
  navigation: any;
  route: any;
};

const ContactScreen: React.FC<Props> = ({route, navigation}) => {
  const {state, dispatch} = useContext(GlobalContext);

  useEffect(() => {
    const id = route?.params?.id;
    dispatch(getContact(id));
  }, [dispatch, route?.params?.id]);

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <AntDesign name="back" style={styles.icon} />
        </TouchableOpacity>
      </View>
      <View style={styles.subHeadingContainer}>
        <Text style={styles.mainText}>
          {state.contact ? state.contact?.name : 'john doe'}
        </Text>
        <Text style={styles.editText}>edit</Text>
      </View>
      <View style={[styles.subHeadingContainer, {marginTop: 20}]}>
        <Text style={styles.subHeadingText}>select address</Text>
      </View>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.item}
          onPress={() => navigation.navigate('Asset')}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../../../../../assets/images/solace/solana-icon.png')}
              style={styles.image}
            />
          </View>
          <View>
            <Text style={styles.username}>
              {state.contact ? state.contact.username : 'john.solace.money'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={[styles.container, {marginTop: 10}]}>
        <TouchableOpacity
          style={styles.item}
          // onPress={() => navigation.navigate('Contact', {id: contact.id})}>
        >
          <View
            style={[styles.imageContainer, {backgroundColor: 'transparant'}]}>
            <AntDesign
              name="plus"
              style={[styles.icon, {color: '#9999a5', fontSize: 20}]}
            />
          </View>
          <View>
            <Text style={styles.editText}>add address</Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={styles.transactionContainer}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionHeading}>wallet activity</Text>
        </View>
        <View style={styles.transactionImage}>
          <Text style={styles.buttonText}>
            visit <Text style={styles.secondaryText}>solscan</Text> to view your
            transaction history
          </Text>
          <Image
            source={require('../../../../../assets/images/solace/contact-screen.png')}
            style={styles.contactImage}
          />
          {/* <Text style={styles.buttonText}>
            visit <Text style={styles.secondaryText}>solscan</Text> to view your
            transaction history
          </Text> */}
        </View>
      </View>
    </ScrollView>
  );
};

export default ContactScreen;
