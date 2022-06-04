import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import moment from 'moment';
import styles from './styles';
import Navigation from '../../../navigation';
import {useNavigation} from '@react-navigation/native';

export type Contact = {
  id: string;
  name: string;
  username: string;
  address: string;
};

export type Props = {
  contact: Contact;
};

const ContactItem: React.FC<Props> = ({contact}) => {
  const navigation: any = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Contact', {id: contact.id})}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>
            {contact.name
              .split(' ')
              .map(word => word[0])
              .join('')
              .toLowerCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.username}>{contact.name}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ContactItem;
