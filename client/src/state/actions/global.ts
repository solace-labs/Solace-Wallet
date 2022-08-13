import {SolaceSDK} from 'solace-sdk';
import {Contact} from '../../components/wallet/ContactItem/ContactItem';
import {AwsCognito} from '../../utils/aws_cognito';
import {GoogleApi} from '../../utils/google_apis';
import {AccountStatus, RetrieveData, User} from '../contexts/GlobalContext';

export const setUser = (user: any) => {
  return {
    type: 'SET_USER',
    payload: user,
  };
};

export const setAccountStatus = (status: AccountStatus) => {
  return {
    type: 'SET_ACCOUNT_STATUS',
    payload: status,
  };
};

export const setSDK = (sdk: SolaceSDK) => {
  return {
    type: 'SET_SDK',
    payload: sdk,
  };
};

export const setGoogleApi = (googleApi: GoogleApi) => {
  return {
    type: 'SET_GOOGLE_API',
    payload: googleApi,
  };
};

export const setAwsCognito = (awsCognito: AwsCognito) => {
  return {
    type: 'SET_AWS_COGNITO',
    payload: awsCognito,
  };
};

export const setRetrieveData = (retrieveData: RetrieveData) => {
  return {
    type: 'SET_RETRIEVE_DATA',
    payload: retrieveData,
  };
};

export const changeUserName = (name: string) => {
  return {
    type: 'CHANGE_NAME',
    payload: name,
  };
};

export const addNewContact = (contact: Contact) => {
  return {
    type: 'ADD_CONTACT',
    payload: contact,
  };
};

export const getContact = (id: string) => {
  return {
    type: 'GET_CONTACT',
    payload: id,
  };
};
