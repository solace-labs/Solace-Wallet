import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: '#131313',
    paddingTop: 50,
    flex: 1,
  },
  passcodeContainer: {
    flexDirection: 'row',
    marginVertical: 50,
    justifyContent: 'center',
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
    width: '90%',
    backgroundColor: '#131313',
  },
  heading: {
    textAlign: 'center',
    marginTop: 20,
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
  fingerprint: {
    color: '#9999A5',
    fontFamily: 'SpaceMono-Bold',
    textAlign: 'center',
  },
  passcode: {
    width: 14,
    height: 14,
    marginLeft: 16,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default styles;
