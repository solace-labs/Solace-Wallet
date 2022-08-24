// import * as Aes from 'react-native-aes-crypto';
import {NativeModules, Platform} from 'react-native';

const Aes = NativeModules.Aes;

export const generateKey = (
  password: string,
  salt: string,
  cost: number,
  length: number,
) => Aes.pbkdf2(password, salt, cost, length);

export const encryptData = (text: string, key: string) => {
  return Aes.randomKey(16).then((iv: string) => {
    return Aes.encrypt(text, key, iv, 'aes-256-cbc').then((cipher: any) => {
      return {
        cipher,
        iv,
      };
    });
  });
};

export const decryptData = (encryptedData: any, key: string) =>
  Aes.decrypt(encryptedData.cipher, key, encryptedData.iv, 'aes-256-cbc');

export const encryptKey = async (secretKey: string, pin: string) => {
  const key = await generateKey(pin, 'salt', 5000, 256);
  const encryptedData = await encryptData(secretKey, key);
  return encryptedData;
};

export const decryptKey = async (encryptedData: any, pin: string) => {
  const key = await generateKey(pin, 'salt', 5000, 256);
  const decryptedData = await decryptData(encryptedData, key);
  return decryptedData;
};

export const tryAes = () => {
  try {
    generateKey('Arnold', 'salt', 5000, 256).then((key: string) => {
      encryptData('These violent delights have violent ends', key)
        .then(({cipher, iv}: {cipher: string; iv: string}) => {
          decryptData({cipher, iv}, key)
            .then((text: string) => {
              console.log('Decrypted:', text);
            })
            .catch((error: any) => {
              console.log(error);
            });

          Aes.hmac256(cipher, key).then((hash: any) => {
            console.log('HMAC', hash);
          });
        })
        .catch((error: any) => {
          console.log(error);
        });
    });
  } catch (e) {
    console.error(e);
  }
};
