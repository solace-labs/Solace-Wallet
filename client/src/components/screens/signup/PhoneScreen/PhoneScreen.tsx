import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import React, {useState} from 'react';
import styles from './styles';

export type Props = {
  navigation: any;
};

const PhoneScreen: React.FC<Props> = ({navigation}) => {
  const [text, setText] = useState('');

  return (
    <ScrollView contentContainerStyle={styles.contentContainer} bounces={false}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.heading}>enter phone number</Text>
          <Text style={styles.subHeading}>
            we’ll notify you of important or suspicious activity on your wallet
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="----- -----"
            placeholderTextColor="#fff6"
            value={text}
            onChangeText={setText}
          />
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Username')}
          style={styles.buttonStyle}>
          <Text style={styles.buttonTextStyle}>next</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default PhoneScreen;
