import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: '#131313',
    paddingTop: 50,
    flex: 1,
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
    display: 'flex',
    justifyContent: 'center',
    width: '90%',
    backgroundColor: '#131313',
  },
  heading: {
    marginTop: 20,
    color: 'white',
    fontSize: 22,
    fontFamily: 'Poppins-SemiBold',
  },
  passcodeContainer: {
    flexDirection: 'row',
    marginTop: 50,
    justifyContent: 'center',
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
});

export default styles;
