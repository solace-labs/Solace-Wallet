/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';

export default function useLocalStorage(key: string, initialValue?: any) {
  const [storedValue, setStoredValue] = useState(initialValue);
  const getStoredItem = async () => {
    try {
      const item = await EncryptedStorage.getItem(key);
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
        await EncryptedStorage.removeItem(key);
      } else {
        await EncryptedStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log('Error storing value to local storage');
    }
  };

  return [storedValue, setValue];
}
