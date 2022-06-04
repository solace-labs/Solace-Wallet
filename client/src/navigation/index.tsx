import React, {useContext} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {AccountStatus, GlobalContext} from '../state/contexts/GlobalContext';
import AuthStack from './Auth';
import WalletStack from './Wallet';
import OnboardingStack from './Onboarding';

const Navigation = () => {
  const {state} = useContext(GlobalContext);

  const renderContent = () => {
    switch (state.accountStatus) {
      case AccountStatus.NEW:
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
