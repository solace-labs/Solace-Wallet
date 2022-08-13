import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {
  GDrive,
  ListQueryBuilder,
  MimeTypes,
} from '@robinbobin/react-native-google-drive-api-wrapper';
import {Alert} from 'react-native';
import {showMessage} from 'react-native-flash-message';

export class GoogleApi {
  gdrive = new GDrive();
  constructor() {
    try {
      GoogleSignin.configure({
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.appfolder',
        ], // what API you want to access on behalf of the user, default is email and profile
        webClientId:
          '757682918669-642g9pqab06h33pl8i2tqjegi60a91ms.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
        offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
        hostedDomain: '', // specifies a hosted domain restriction
        forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
        accountName: '', // [Android] specifies an account name on the device that should be used
        iosClientId:
          '757682918669-r08gca3sbdn42o0onj5etmh86pp21qj6.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
        googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
        openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
        profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
      });
    } catch (e: any) {
      console.log(e);
      showMessage({
        message: e.message,
        type: 'danger',
      });
    }
  }

  /**
   * Sign in the user using google account
   * @returns
   */
  async signIn() {
    await GoogleSignin.hasPlayServices();
    return await GoogleSignin.signIn();
  }

  /**
   * Sign out the user's google account
   */
  async signOut() {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
  }

  /**
   * Initialize the google drive api
   */
  async setDrive() {
    this.gdrive.accessToken = (await GoogleSignin.getTokens()).accessToken;
    this.gdrive.fetchCoercesTypes = true;
    this.gdrive.fetchRejectsOnHttpErrors = true;
    this.gdrive.fetchTimeout = 3000;
  }

  /**
   * Upload a file to google drive
   * @param {string} name
   * @param {any} data
   */
  async uploadFileToDrive(name: string, data: any) {
    await this.gdrive.files
      .newMultipartUploader()
      .setData(JSON.stringify(data), MimeTypes.JSON)
      .setRequestBody({name})
      .execute();
  }

  /**
   * Check if the file exists in the google drive
   * @param {string} name
   * @returns {boolean}
   */
  async checkFileExists(name: string): Promise<boolean> {
    const data = await this.gdrive.files.list({
      q: new ListQueryBuilder().e('name', name),
    });
    return data.files.length > 0;
  }

  /**
   * Get file data from the google drive
   * @param {string} name
   * @returns
   */
  async getFileData(name: string): Promise<any> {
    const data = await this.gdrive.files.list({
      q: new ListQueryBuilder().e('name', name),
    });
    if (data.files.length > 0) {
      const [file] = data.files;
      return await this.gdrive.files.getJson(file.id);
    }
  }

  /**
   * Delete file if exists in the google drive
   * @param name
   * @returns
   */
  async deleteFile(name: string) {
    const data = await this.gdrive.files.list({
      q: new ListQueryBuilder().e('name', name),
    });
    if (data.files.length > 0) {
      const [file] = data.files;
      return await this.gdrive.files.delete(file.id);
    }
  }
}
