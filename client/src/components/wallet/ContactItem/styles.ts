import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  username: {
    color: 'white',
    textTransform: 'lowercase',
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
});

export default styles;
