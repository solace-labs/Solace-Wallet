import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: '#131313',
    paddingTop: 50,
    flex: 1,
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
  fingerprint: {
    height: 40,
    width: 40,
    marginBottom: 20,
    resizeMode: 'contain',
  },
  username: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    marginTop: 8,
    fontSize: 18,
  },
  container: {
    paddingTop: 30,
    backgroundColor: '#131313',
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  textContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '90%',
    backgroundColor: '#131313',
  },
  heading: {
    textAlign: 'center',
    color: 'white',
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  buttonStyle: {
    width: '90%',
    padding: 16,
    marginVertical: 16,
    backgroundColor: 'white',
  },
  buttonTextStyle: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'SpaceMono-Bold',
    textTransform: 'lowercase',
  },
  hiddenInput: {
    borderColor: '#fff3',
    marginTop: 20,
    borderRadius: 3,
    color: 'white',
    padding: 14,
    display: 'none',
    borderWidth: 1,
    fontFamily: 'SpaceMono-Bold',
  },
  fingerprintText: {
    color: '#9999A5',
    marginTop: 35,
    fontFamily: 'SpaceMono-Bold',
    textAlign: 'center',
  },
});

export default styles;
