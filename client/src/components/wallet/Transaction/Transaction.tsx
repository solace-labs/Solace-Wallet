import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import moment from 'moment';
import styles from './styles';

const Transaction = ({item}: {item: any}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.date}>{moment(item.date).format('DD MMM yyyy')}</Text>
      <TouchableOpacity style={styles.item}>
        <View style={styles.imageContainer}>
          <Text style={styles.imageText}>ap</Text>
        </View>
        <View>
          <Text style={styles.from}>from</Text>
          <Text style={styles.username}>{item.username}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default Transaction;
