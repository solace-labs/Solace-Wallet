import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: '#131313',
    paddingTop: 50,
    flex: 1,
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    alignItems: 'center',
    width: '90%',
  },
  inputContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    width: '90%',
  },
  icon: {
    color: 'white',
    fontSize: 24,
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    width: 40,
    overflow: 'hidden',
    marginRight: 20,
  },
  headingContainer: {
    flex: 0.5,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 24,
  },
  buttonsContainer: {
    flex: 1,
    width: '70%',
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackground: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    width: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'SpaceMono-Regular',
  },
  secondText: {
    color: '#9999A5',
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
  },
  sendContainer: {
    flex: 1,
    marginTop: 40,
    width: '90%',
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  heading: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  sideHeading: {
    color: '#9999A5',
    fontSize: 14,
    fontFamily: 'SpaceMono-Bold',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
  },
  contactImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  secondaryText: {
    textDecorationLine: 'underline',
    color: 'white',
    fontFamily: 'SpaceMono-Bold',
  },
  textInput: {
    width: '100%',
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    color: 'white',
    padding: 14,
    borderWidth: 1,
    fontFamily: 'SpaceMono-Bold',
  },
  textInputAddress: {paddingRight: 40},
  inputWrap: {
    marginTop: 20,
    width: '100%',
    position: 'relative',
  },
  scanIcon: {
    position: 'absolute',
    color: '#9999a5',
    fontSize: 18,
    right: 16,
    top: 16,
  },
  networkContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    width: '85%',
  },
  solanaText: {
    color: '#14f195',
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
  },
  buttonStyle: {
    marginVertical: 24,
    width: '100%',
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'white',
  },
  endContainer: {
    flex: 1,
    width: '90%',
    justifyContent: 'flex-end',
  },
  buttonTextStyle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono-Bold',
    textTransform: 'lowercase',
  },
  subTextContainer: {
    marginTop: 30,
    flexDirection: 'row',
    width: '90%',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subIcon: {color: '#4CAF50', fontSize: 16, fontWeight: 'bold'},
  subText: {
    paddingLeft: 6,
    color: '#4CAF50',
    fontFamily: 'Poppins-SemiBold',
  },
});

export default styles;