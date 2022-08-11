import React, {useContext, useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AccountStatus, GlobalContext} from '../state/contexts/GlobalContext';
import AuthStack from './Auth';
import WalletStack from './Wallet';
import OnboardingStack from './Onboarding';
import {setAccountStatus} from '../state/actions/global';
import SignUpStack from './SignUp';

const Navigation = () => {
  const {state, dispatch} = useContext(GlobalContext);

  useEffect(() => {
    dispatch(setAccountStatus(AccountStatus.EXISITING));
  }, [dispatch]);

  const renderContent = () => {
    switch (state.accountStatus) {
      case AccountStatus.NEW:
        return <SignUpStack />;
      case AccountStatus.SIGNED_UP:
        return <OnboardingStack />;
      case AccountStatus.EXISITING:
        return <AuthStack />;
      case AccountStatus.ACTIVE:
        return <WalletStack />;
    }
  };

  return <NavigationContainer>{renderContent()}</NavigationContainer>;
};

export default Navigation;
