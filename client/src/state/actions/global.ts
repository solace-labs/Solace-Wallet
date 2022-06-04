import {Contact} from '../../components/wallet/ContactItem';
import {AccountStatus} from '../contexts/GlobalContext';

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

export const setOnboardingUser = (user: any) => {
  return {
    type: 'SET_ONBOARDING_USER',
    payload: user,
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
