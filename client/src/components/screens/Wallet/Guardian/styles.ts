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
    justifyContent: 'space-between',
    marginVertical: 20,
    alignItems: 'center',
    width: '90%',
  },
  subHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 24,
  },
  buttonStyle: {
    marginVertical: 24,
    width: '100%',
    padding: 16,
    justifyContent: 'flex-end',
    backgroundColor: 'white',
  },
  endContainer: {
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
  tabs: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tab: {
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 4,
    width: '50%',
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: 'SpaceMono-Bold',
    color: '#9999a5',
    textAlign: 'center',
    fontSize: 14,
  },
  mainContainer: {
    flex: 1,
    width: '90%',
    paddingTop: 20,
  },
});

export default styles;
