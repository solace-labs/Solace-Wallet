import React from 'react';
import FlashMessage from 'react-native-flash-message';
import Navigation from './src/navigation/Navigation';
import GlobalProvider from './src/state/contexts/GlobalContext';

const App = () => {
  // const isDarkMode = useColorScheme() === 'dark';
  return (
    <GlobalProvider>
      <Navigation />
      <FlashMessage position="top" />
    </GlobalProvider>
  );
};

export default App;
