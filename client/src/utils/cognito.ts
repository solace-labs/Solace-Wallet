import ACI from 'amazon-cognito-identity-js';

export const signup = () => {
  const attributeList = [];
  var dataEmail = {
    Name: 'email',
    Value: 'ashwin@onpar.in',
  };
  attributeList.push(dataEmail);
  userPool.signUp(
    'username',
    '@Fuckyou1234',
    // @ts-ignore
    attributeList,
    null,
    (err: any, res: any) => {
      console.log('err', err);
      console.log('res', res);
    },
  );
};

const poolData = {
  UserPoolId: 'ap-south-1_XjxTKqrzF',
  ClientId: 'tprl1r5eloalkdc65q12hq2ib',
};

const authenticationData = {
  Username: 'username',
  Password: '@Fuckyou1234',
};

const authDetails = new ACI.AuthenticationDetails(authenticationData);

const userPool = new ACI.CognitoUserPool(poolData);

const cognitoUser = new ACI.CognitoUser({
  Username: 'username',
  Pool: userPool,
});

// Get a new access token
cognitoUser.refreshSession(
  new ACI.CognitoRefreshToken({
    RefreshToken: '',
  }),
  (res: any) => {},
);

// Login a user
cognitoUser.authenticateUser(authDetails, {
  onSuccess: (res: any) => {
    console.log('SUCCESS', res);
  },
  onFailure: (err: any) => {
    console.log('ERROR', err);
  },
});
