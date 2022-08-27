/* eslint-disable react-hooks/exhaustive-deps */
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
import {Contact} from '../../components/wallet/ContactItem/ContactItem';
import useLocalStorage from '../../hooks/useLocalStorage';
import {setAccountStatus, setUser} from '../actions/global';
import globalReducer from '../reducers/global';
import {KeyPair, SolaceSDK} from 'solace-sdk';
import {AwsCognito} from '../../utils/aws_cognito';
import {GoogleApi} from '../../utils/google_apis';
import {getMeta} from '../../utils/relayer';

type InitialStateType = {
  accountStatus: AccountStatus;
  user?: User;
  sdk?: SolaceSDK;
  googleApi?: GoogleApi;
  contact?: Contact;
  contacts?: Contact[];
  awsCognito?: AwsCognito;
  retrieveData?: RetrieveData;
};

export type RetrieveData = {
  encryptedSecretKey?: any;
  encryptedSolaceName?: any;
  decryptedSecretKey?: any;
  decryptedSolaceName?: any;
};

// export const PROGRAM_ADDRESS = '8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U';
export const PROGRAM_ADDRESS = '3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw';
export const NETWORK = 'local';
export const LAMPORTS_PER_SOL = 1000000000;

export const myPrivateKey = [
  64, 49, 21, 122, 173, 218, 147, 45, 207, 84, 138, 105, 6, 50, 18, 81, 174,
  246, 20, 171, 195, 135, 70, 222, 225, 154, 217, 74, 218, 186, 191, 197, 49,
  170, 69, 11, 200, 3, 223, 9, 39, 74, 201, 163, 68, 222, 53, 183, 52, 220, 243,
  79, 228, 240, 168, 172, 218, 155, 91, 56, 123, 136, 222, 143,
];
export const myPublicKey = '4LsZkGUwZax7x3qdNubwb9czWk2TJNysrVjzc2pGF91p';

export type User = {
  email: string;
  solaceName: string;
  ownerPrivateKey: string;
  publicKey?: string;
  isWalletCreated: boolean;
  pin: string;
};

export enum AccountStatus {
  LOADING = 'LOADING',
  EXISITING = 'EXISITING',
  RECOVERY = 'RECOVERY',
  NEW = 'NEW',
  ACTIVE = 'ACTIVE',
  SIGNED_UP = 'SIGNED_UP',
  LOGGED_ID = 'LOGGED_ID',
  RETRIEVE = 'RETRIEVE',
}

const initialState = {
  accountStatus: AccountStatus.LOADING,
  user: {
    email: '',
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
  const [tokens] = useLocalStorage('tokens');

  const checkInRecoverMode = useCallback(() => {
    console.log('in');
    return (
      storedUser &&
      storedUser.inRecovery &&
      storedUser.solaceName &&
      storedUser.ownerPrivateKey
    );
  }, [storedUser]);

  const checkRecovery = useCallback(async () => {
    // const accessToken = tokens.accesstoken;
    console.log({tokens});
    // getMeta(accessToken);
    const privateKey = storedUser.ownerPrivateKey! as string;
    const solaceName = storedUser.solaceName!;
    console.log('checking recovery', privateKey);
    const keypair = KeyPair.fromSecretKey(
      Uint8Array.from(privateKey.split(',').map(e => +e)),
    );
    console.log(keypair.publicKey.toString());
    const sdk = await SolaceSDK.retrieveFromName(solaceName, {
      network: NETWORK,
      owner: keypair,
      programAddress: PROGRAM_ADDRESS,
    });
    const res = await sdk.fetchWalletData();
    console.log(res);
  }, [storedUser]);

  const isUserValid = useCallback(() => {
    return (
      storedUser &&
      storedUser.pin &&
      storedUser.solaceName &&
      storedUser.ownerPrivateKey &&
      storedUser.isWalletCreated
    );
  }, [storedUser]);

  useEffect(() => {
    console.log({storedUser});
    if (checkInRecoverMode()) {
      console.log('inside recover');
      checkRecovery();
    } else if (isUserValid()) {
      // if (isUserValid()) {
      dispatch(setUser(storedUser));
      dispatch(setAccountStatus(AccountStatus.EXISITING));
    } else {
      dispatch(setAccountStatus(AccountStatus.NEW));
    }
  }, [storedUser]);

  return (
    <GlobalContext.Provider value={{state, dispatch}}>
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
