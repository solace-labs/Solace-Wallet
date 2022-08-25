import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  guardiansContainer: {width: '100%'},
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
  leftSide: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  securityText: {
    color: 'white',
    fontFamily: 'SpaceMono-Bold',
  },
  dateText: {
    color: '#9999a5',
    fontFamily: 'SpaceMono-Bold',
  },
  guardianImageContainer: {
    height: 40,
    width: 40,
    backgroundColor: '#9999A5',
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  responseText: {
    color: '#9999a5',
    fontFamily: 'SpaceMono-Bold',
  },
  guardianImageText: {fontFamily: 'Poppins-Bold', color: 'white'},
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
  rightSide: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  acceptButton: {
    color: '#00AC64',
    fontFamily: 'Poppins-Bold',
    letterSpacing: 0.5,
  },
});

export default styles;
