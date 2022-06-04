import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: '#131313',
    paddingTop: 50,
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {width: '80%'},
  icon: {
    color: 'white',
    fontSize: 24,
    padding: 8,
    borderRadius: 20,
    alignSelf: 'flex-end',
    width: 40,
    overflow: 'hidden',
    backgroundColor: '#3d3d3d',
  },
  headingContainer: {
    flex: 0.5,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: 35,
    resizeMode: 'contain',
    overflow: 'hidden',
  },
  mainText: {
    color: 'white',
    fontFamily: 'SpaceMono-Bold',
    fontSize: 28,
  },
  price: {
    color: 'white',
    fontFamily: 'Poppins-Bold',
    fontSize: 28,
  },
  username: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 8,
    fontSize: 18,
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
  walletContainer: {
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
});

export default styles;
