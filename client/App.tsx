import React from 'react';
import Navigation from './src/navigation';
import GlobalProvider from './src/state/contexts/GlobalContext';
import GlobalContext from './src/state/contexts/GlobalContext';

const App = () => {
  // const isDarkMode = useColorScheme() === 'dark';
  return (
    <GlobalProvider>
      <Navigation />
    </GlobalProvider>
  );
};

export default App;
