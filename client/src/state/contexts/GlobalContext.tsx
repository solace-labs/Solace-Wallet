import AsyncStorage from '@react-native-async-storage/async-storage';
import {use} from 'chai';
import React, {
  createContext,
  Dispatch,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import {unstable_batchedUpdates} from 'react-native';
import {Contact} from '../../components/wallet/ContactItem';
import useLocalStorage from '../../hooks/useLocalStorage';
import {setAccountStatus, setUser} from '../actions/global';
import globalReducer from '../reducers/global';
import {SolaceSDK} from 'solace-sdk';
import {
  decryptData,
  encryptData,
  generateKey,
  tryAes,
} from '../../utils/aes_encryption';

type InitialStateType = {
  accountStatus: AccountStatus;
  user?: User;
  contact?: Contact;
  contacts?: Contact[];
};

export type User = {
  solaceName: string;
  ownerPrivateKey: string;
  keypair?: ReturnType<typeof SolaceSDK.newKeyPair>;
  isWalletCreated: boolean;
  pin: string;
};

export enum AccountStatus {
  EXISITING = 'EXISITING',
  RECOVERY = 'RECOVERY',
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
}

const initialState = {
  accountStatus: AccountStatus.NEW,
  user: {
    solaceName: '',
    ownerPrivateKey: '',
    isWalletCreated: false,
    pin: '',
  },
  contacts: [
    {
      id: new Date().getTime().toString() + Math.random().toString(),
      name: 'ashwin prasad',
      username: 'ashwin.solace.money',
      address: '1231jkajsdkf02198487',
    },
  ],
};

export const GlobalContext = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<any>;
}>({state: initialState, dispatch: () => {}});

const GlobalProvider = ({children}: {children: any}) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  const [storedUser, setStoredUser] = useLocalStorage('user', undefined);

  const isUserValid = useCallback(() => {
    return (
      storedUser &&
      storedUser.pin &&
      storedUser.solaceName &&
      storedUser.ownerPrivateKey &&
      storedUser.isWalletCreated
    );
  }, [storedUser]);

  // tryAes();

  useEffect(() => {
    console.log({storedUser});
    if (isUserValid()) {
      dispatch(setUser(storedUser));
      dispatch(setAccountStatus(AccountStatus.EXISITING));
    }
  }, [isUserValid, storedUser]);

  return (
    <GlobalContext.Provider value={{state, dispatch}}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
