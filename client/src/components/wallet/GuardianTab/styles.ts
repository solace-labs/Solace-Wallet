import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  container: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  username: {
    color: 'white',
    textTransform: 'lowercase',
    fontFamily: 'SpaceMono-Bold',
  },
  item: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imageText: {fontFamily: 'Poppins-Bold', color: 'white'},
  imageContainer: {
    flex: 1,
    width: '100%',
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
  guardiansContainer: {width: '100%'},
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
  guardianImageText: {fontFamily: 'Poppins-Bold', color: 'white'},
  securityText: {
    color: 'white',
    fontFamily: 'SpaceMono-Bold',
  },
  dateText: {
    color: '#9999a5',
    fontFamily: 'SpaceMono-Bold',
  },
  responseText: {
    color: '#9999a5',
    fontFamily: 'SpaceMono-Bold',
  },
  guardianItem: {width: '100%'},
  leftSide: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
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
