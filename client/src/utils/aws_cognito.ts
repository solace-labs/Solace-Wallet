import {
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  ICognitoUserAttributeData,
  ISignUpResult,
} from 'amazon-cognito-identity-js';
import {resolveConfig} from 'prettier';

export class AwsCognito {
  userPool: CognitoUserPool;
  cognitoUser?: CognitoUser;

  constructor() {
    this.userPool = new CognitoUserPool({
      UserPoolId: 'ap-south-1_8Ylepg5f1',
      ClientId: '5p5t8mcggrifoftsc6ufe4467l',
    });
  }

  /**
   * Signup using username, email and password
   * @param username
   * @param email
   * @param password
   */
  emailSignUp = async (
    username: string,
    email: string,
    password: string,
  ): Promise<ISignUpResult | undefined> => {
    const dataEmail = {
      Name: 'email',
      Value: email,
    } as CognitoUserAttribute;

    const attributeList: CognitoUserAttribute[] = [];
    attributeList.push(dataEmail);
    return await new Promise((resolve, reject) => {
      this.userPool.signUp(
        username,
        password,
        attributeList,
        [],
        (err?: Error, res?: ISignUpResult) => {
          if (err) {
            console.log('err', err);
            reject(err);
          } else {
            console.log('res', res);
            resolve(res);
          }
        },
      );
    });
  };

  /**
   * Send email verificaiton code
   * @returns
   */
  sendEmailVerificationCode = async (): Promise<string> => {
    return await new Promise((resolve, reject) => {
      this.cognitoUser!.getAttributeVerificationCode('email', {
        onSuccess: (result: string) => {
          console.log('result', result);
          resolve(result);
        },
        onFailure: (err: Error) => {
          console.log('err', err);
          reject(err);
        },
      });
    });
  };

  /**
   * Verify Email Verification Code
   * @param code
   * @returns
   */
  verifyEmailVerificationCode = async (code: string) => {
    return await new Promise((resolve, reject) => {
      this.cognitoUser!.verifyAttribute('email', code, {
        onSuccess: (success: string) => {
          console.log('success', success);
          resolve(success);
        },
        onFailure: (err: Error) => {
          console.log('err', err);
          reject(err);
        },
      });
    });
  };

  /**
   * Confirm registration
   * @param otp
   * @returns
   */
  confirmRegistration = async (otp: string): Promise<string> => {
    return await new Promise((resolve, reject) => {
      this.cognitoUser!.confirmRegistration(
        otp,
        false,
        (err: Error, result: string) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });
  };

  /**
   * Set a cognito user
   * @param Username
   */
  setCognitoUser = (Username: string) => {
    try {
      this.cognitoUser = new CognitoUser({
        Username,
        Pool: this.userPool,
      });
    } catch (e) {
      console.log('Set Cognito User', e);
    }
  };

  /**
   * Get new access token
   * @param refreshToken
   */
  refreshSession = async (refreshToken: CognitoRefreshToken) => {
    return await new Promise((resolve, reject) => {
      this.cognitoUser!.refreshSession(refreshToken, (err, res) => {
        if (err) {
          console.log('err', err);
          reject(err);
        }
        console.log('res', res);
        resolve(res);
      });
    });
  };

  /**
   * Login a user using email and password
   * @param Username
   * @param Password
   * @returns
   */
  emailLogin = async (Username: string, Password: string): Promise<any> => {
    const authDetails = new AuthenticationDetails({
      Username,
      Password,
    });

    return await new Promise((resolve, reject) => {
      this.cognitoUser!.authenticateUser(authDetails, {
        onSuccess: (session: CognitoUserSession) => {
          resolve(session);
        },
        onFailure: (err: any) => {
          console.log('ERROR', err);
          reject(err);
        },
      });
    });
  };

  /**
   * Change password of a user
   * @param oldPassword
   * @param newPassword
   * @returns
   */
  changePassword = async (
    oldPassword: string,
    newPassword: string,
  ): Promise<'SUCCESS' | undefined> => {
    return await new Promise((resolve, reject) => {
      this.cognitoUser!.changePassword(oldPassword, newPassword, (err, res) => {
        if (err) {
          console.log('err', err);
          reject(err);
        }
        console.log('res', res);
        resolve(res);
      });
    });
  };

  getTokens = async (): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }> => {
    return await new Promise((resolve, reject) => {
      this.cognitoUser!.getSession(
        (err: Error | null, session: CognitoUserSession | null) => {
          if (err) {
            console.log('err', err);
            reject(err);
          }
          console.log('session', session);
          resolve({
            accessToken: session!.getAccessToken().getJwtToken(),
            idToken: session?.getIdToken().getJwtToken()!,
            refreshToken: session?.getRefreshToken().getToken()!,
          });
        },
      );
    });
  };

  updateAttribute = async (name: string, value: string) => {
    const attributeList: ICognitoUserAttributeData[] = [];
    const attribute = new CognitoUserAttribute({
      Name: name,
      Value: value,
    });
    attributeList.push(attribute);
    return await new Promise((resolve, reject) => {
      this.cognitoUser?.updateAttributes(attributeList, function (err, result) {
        if (err) {
          console.log(err.message || JSON.stringify(err));
          reject(err);
        }
        resolve(result);
      });
    });
  };
}
