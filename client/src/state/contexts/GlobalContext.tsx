import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  Dispatch,
  useEffect,
  useReducer,
  useState,
} from 'react';
import {Contact} from '../../components/wallet/ContactItem';
import {setAccountStatus, setUser} from '../actions/global';
import globalReducer from '../reducers/global';

type InitialStateType = {
  accountStatus: AccountStatus;
  user?: User;
  onboardingUser?: User;
  contact?: Contact;
  contacts?: Contact[];
};

export type User = {
  username: string;
  keyPair: string;
  seed: string;
  email: string;
  passcode: string;
};

export enum AccountStatus {
  EXISITING = 'EXISITING',
  RECOVERY = 'RECOVERY',
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
}

const initialState = {
  accountStatus: AccountStatus.NEW,
  onboardingUser: {
    username: '',
    email: '',
    keyPair: '',
    seed: '',
    passcode: '',
  },
  contacts: [
    {
      id: new Date().getTime().toString() + Math.random().toString(),
      name: 'ashwin prasad',
      username: 'ashwin.solace.money',
      address: '1231jkajsdkf02198487',
    },
    // {
    //   id: new Date().getTime().toString() + Math.random().toString(),
    //   name: 'sarthak sharma',
    //   username: 'sarthak.solace.money',
    //   address: 'alkjsdfoi1093890123909',
    // },
  ],
};

export const GlobalContext = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<any>;
}>({state: initialState, dispatch: () => {}});

const GlobalProvider = ({children}: {children: any}) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  useEffect(() => {
    const getInitialData = async () => {
      const response = await AsyncStorage.getItem('user');
      if (response) {
        console.log('response', response);
        const user = JSON.parse(response);
        dispatch(setUser(user));
        dispatch(setAccountStatus(AccountStatus.EXISITING));
      }
    };
    getInitialData();
  }, []);

  return (
    <GlobalContext.Provider value={{state, dispatch}}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
