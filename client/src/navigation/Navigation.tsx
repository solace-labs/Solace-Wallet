import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AccountStatus, GlobalContext} from '../state/contexts/GlobalContext';
import AuthStack from './Auth';
import WalletStack from './Wallet';
import OnboardingStack from './Onboarding';
import SignUpStack from './SignUp';
import LoadingStack from './Loading';

const Navigation = () => {
  const {state} = useContext(GlobalContext);

  const renderContent = () => {
    switch (state.accountStatus) {
      case AccountStatus.LOADING:
        return <LoadingStack />;
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
