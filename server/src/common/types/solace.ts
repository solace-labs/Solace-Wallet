export type Solace = {
  version: '0.1.0';
  name: 'solace';
  instructions: [
    {
      name: 'createWallet';
      accounts: [
        {
          name: 'signer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'base';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'wallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'owner';
          type: 'publicKey';
        },
        {
          name: 'guardianKeys';
          type: {
            vec: 'publicKey';
          };
        },
        {
          name: 'recoveryThreshold';
          type: 'u8';
        },
        {
          name: 'bump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'addTokenAccount';
      accounts: [];
      args: [];
    },
    {
      name: 'depositSplTokens';
      accounts: [];
      args: [];
    },
    {
      name: 'depositSol';
      accounts: [];
      args: [];
    },
    {
      name: 'addGuardians';
      accounts: [
        {
          name: 'wallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [
        {
          name: 'guardians';
          type: {
            vec: 'publicKey';
          };
        },
        {
          name: 'recoveryThreshold';
          type: 'u8';
        },
      ];
    },
    {
      name: 'approveGuardian';
      accounts: [
        {
          name: 'wallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'guardian';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'removeGuardians';
      accounts: [
        {
          name: 'wallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'guardian';
          isMut: false;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
      ];
      args: [];
    },
    {
      name: 'initiateWalletRecovery';
      accounts: [
        {
          name: 'wallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'recovery';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'proposer';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'systemProgram';
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: 'newOwner';
          type: 'publicKey';
        },
        {
          name: 'recoveryBump';
          type: 'u8';
        },
      ];
    },
    {
      name: 'approveRecoveryByKeypair';
      accounts: [
        {
          name: 'walletToRecover';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'guardian';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'recoveryAttempt';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'approveRecoveryBySolace';
      accounts: [
        {
          name: 'walletToRecover';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'owner';
          isMut: true;
          isSigner: true;
        },
        {
          name: 'guardianWallet';
          isMut: true;
          isSigner: false;
        },
        {
          name: 'recoveryAttempt';
          isMut: true;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: 'rejectRecovery';
      accounts: [];
      args: [];
    },
  ];
  accounts: [
    {
      name: 'wallet';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'pendingGuardians';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'approvedGuardians';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'base';
            type: 'publicKey';
          },
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'recoveryMode';
            type: 'bool';
          },
          {
            name: 'recoveryThreshold';
            type: 'u8';
          },
          {
            name: 'walletRecoverySequence';
            type: 'u64';
          },
          {
            name: 'currentRecovery';
            type: {
              option: 'publicKey';
            };
          },
          {
            name: 'guarding';
            type: {
              vec: 'publicKey';
            };
          },
        ];
      };
    },
    {
      name: 'recoveryAttempt';
      type: {
        kind: 'struct';
        fields: [
          {
            name: 'bump';
            type: 'u8';
          },
          {
            name: 'wallet';
            type: 'publicKey';
          },
          {
            name: 'owner';
            type: 'publicKey';
          },
          {
            name: 'proposer';
            type: 'publicKey';
          },
          {
            name: 'newOwner';
            type: 'publicKey';
          },
          {
            name: 'guardians';
            type: {
              vec: 'publicKey';
            };
          },
          {
            name: 'approvals';
            type: {
              vec: 'bool';
            };
          },
          {
            name: 'isExecuted';
            type: 'bool';
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: 'InvalidGuardian';
      msg: 'Invalid guardian';
    },
    {
      code: 6001;
      name: 'FullfillmentAmountNotExact';
      msg: 'Amount not exact';
    },
    {
      code: 6002;
      name: 'NoApprovedGuardians';
      msg: 'No approved guardian';
    },
    {
      code: 6003;
      name: 'KeyNotFound';
      msg: 'Key not found';
    },
  ];
};

export const IDL: Solace = {
  version: '0.1.0',
  name: 'solace',
  instructions: [
    {
      name: 'createWallet',
      accounts: [
        {
          name: 'signer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'base',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'wallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'owner',
          type: 'publicKey',
        },
        {
          name: 'guardianKeys',
          type: {
            vec: 'publicKey',
          },
        },
        {
          name: 'recoveryThreshold',
          type: 'u8',
        },
        {
          name: 'bump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'addTokenAccount',
      accounts: [],
      args: [],
    },
    {
      name: 'depositSplTokens',
      accounts: [],
      args: [],
    },
    {
      name: 'depositSol',
      accounts: [],
      args: [],
    },
    {
      name: 'addGuardians',
      accounts: [
        {
          name: 'wallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [
        {
          name: 'guardians',
          type: {
            vec: 'publicKey',
          },
        },
        {
          name: 'recoveryThreshold',
          type: 'u8',
        },
      ],
    },
    {
      name: 'approveGuardian',
      accounts: [
        {
          name: 'wallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'guardian',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'removeGuardians',
      accounts: [
        {
          name: 'wallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'guardian',
          isMut: false,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
      ],
      args: [],
    },
    {
      name: 'initiateWalletRecovery',
      accounts: [
        {
          name: 'wallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'recovery',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'proposer',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'systemProgram',
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: 'newOwner',
          type: 'publicKey',
        },
        {
          name: 'recoveryBump',
          type: 'u8',
        },
      ],
    },
    {
      name: 'approveRecoveryByKeypair',
      accounts: [
        {
          name: 'walletToRecover',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'guardian',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'recoveryAttempt',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'approveRecoveryBySolace',
      accounts: [
        {
          name: 'walletToRecover',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'owner',
          isMut: true,
          isSigner: true,
        },
        {
          name: 'guardianWallet',
          isMut: true,
          isSigner: false,
        },
        {
          name: 'recoveryAttempt',
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: 'rejectRecovery',
      accounts: [],
      args: [],
    },
  ],
  accounts: [
    {
      name: 'wallet',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'pendingGuardians',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'approvedGuardians',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'base',
            type: 'publicKey',
          },
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'recoveryMode',
            type: 'bool',
          },
          {
            name: 'recoveryThreshold',
            type: 'u8',
          },
          {
            name: 'walletRecoverySequence',
            type: 'u64',
          },
          {
            name: 'currentRecovery',
            type: {
              option: 'publicKey',
            },
          },
          {
            name: 'guarding',
            type: {
              vec: 'publicKey',
            },
          },
        ],
      },
    },
    {
      name: 'recoveryAttempt',
      type: {
        kind: 'struct',
        fields: [
          {
            name: 'bump',
            type: 'u8',
          },
          {
            name: 'wallet',
            type: 'publicKey',
          },
          {
            name: 'owner',
            type: 'publicKey',
          },
          {
            name: 'proposer',
            type: 'publicKey',
          },
          {
            name: 'newOwner',
            type: 'publicKey',
          },
          {
            name: 'guardians',
            type: {
              vec: 'publicKey',
            },
          },
          {
            name: 'approvals',
            type: {
              vec: 'bool',
            },
          },
          {
            name: 'isExecuted',
            type: 'bool',
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: 'InvalidGuardian',
      msg: 'Invalid guardian',
    },
    {
      code: 6001,
      name: 'FullfillmentAmountNotExact',
      msg: 'Amount not exact',
    },
    {
      code: 6002,
      name: 'NoApprovedGuardians',
      msg: 'No approved guardian',
    },
    {
      code: 6003,
      name: 'KeyNotFound',
      msg: 'Key not found',
    },
  ],
};
