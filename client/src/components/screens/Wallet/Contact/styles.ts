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
  mainText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
  },
  subHeadingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    width: '90%',
  },
  editText: {
    color: '#9999a5',
    fontFamily: 'SpaceMono-Bold',
    fontSize: 16,
  },
  subHeadingText: {
    color: 'white',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    textAlign: 'left',
  },
  container: {
    marginTop: 20,
    width: '90%',
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
  transactionContainer: {
    flex: 1,
    marginTop: 80,
    width: '90%',
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  transactionHeading: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
  },
  transactionImage: {
    width: '100%',
    alignItems: 'center',
  },
  contactImage: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  buttonText: {
    color: '#9999a5',
    textAlign: 'left',
    // marginTop: 12,
    fontFamily: 'SpaceMono-Regular',
  },
  secondaryText: {
    textDecorationLine: 'underline',
    color: 'white',
    fontFamily: 'SpaceMono-Bold',
  },
  image: {
    width: 40,
    resizeMode: 'contain',
  },
});

export default styles;
