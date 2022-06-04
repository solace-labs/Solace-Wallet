import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {marginBottom: 20},
  date: {
    color: 'white',
    textTransform: 'lowercase',
    marginBottom: 14,
    fontFamily: 'SpaceMono-Bold',
  },
  item: {flexDirection: 'row', alignItems: 'center'},
  imageContainer: {
    height: 40,
    width: 40,
    backgroundColor: '#9999A5',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  imageText: {fontFamily: 'Poppins-Bold', color: 'white'},
  from: {
    color: '#cacaca',
    textTransform: 'lowercase',
    fontFamily: 'SpaceMono-Bold',
  },
  username: {
    color: 'white',
    textTransform: 'lowercase',
    fontFamily: 'SpaceMono-Bold',
  },
});

export default styles;
