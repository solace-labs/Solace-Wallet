import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  username: {
    color: 'white',
    textTransform: 'lowercase',
    fontFamily: 'SpaceMono-Bold',
  },
  item: {flexDirection: 'row', alignItems: 'center'},
  imageText: {fontFamily: 'Poppins-Bold', color: 'white'},
  imageContainer: {
    flex: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  buttonText: {
    color: '#9999a5',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'SpaceMono-Bold',
  },
});

export default styles;
