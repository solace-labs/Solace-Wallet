/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function useLocalStorage(key: string, initialValue?: any) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const getStoredItem = async () => {
    try {
      const item = await AsyncStorage.getItem(key);
      const value = item ? JSON.parse(item) : initialValue;
      await setStoredValue(value);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getStoredItem();
  }, []);

  const setValue = async (value: any) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (valueToStore === undefined || valueToStore === null) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log('Error storing value to local storage');
    }
  };

  return [storedValue, setValue];
}
