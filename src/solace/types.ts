export type Solace = {
  "version": "0.1.0",
  "name": "solace",
  "instructions": [
    {
      "name": "createWallet",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "SOLACE"
              },
              {
                "kind": "arg",
                "type": "string",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "publicKey"
        },
        {
          "name": "guardianKeys",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "recoveryThreshold",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "endIncubation",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "requestInstantSplTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverBase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "requestInstantSolTransfer",
      "accounts": [
        {
          "name": "toAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "requestGuardedTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Wallet",
                "path": "wallet"
              },
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "random_key"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "GuardedTransferData"
          }
        }
      ]
    },
    {
      "name": "approveTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveAndExecuteSplTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverBase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveAndExecuteSolTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "executeTransfer",
      "accounts": [
        {
          "name": "transferAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverBase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addGuardians",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "guardian",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "approveGuardianship",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "guardian",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "removeGuardians",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initiateWalletRecovery",
      "accounts": [
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recovery",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Wallet",
                "path": "wallet"
              },
              {
                "kind": "account",
                "type": "u64",
                "account": "Wallet",
                "path": "wallet.wallet_recovery_sequence"
              }
            ]
          }
        },
        {
          "name": "proposer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "approveRecoveryByKeypair",
      "accounts": [
        {
          "name": "walletToRecover",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "recoveryAttempt",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveRecoveryBySolace",
      "accounts": [
        {
          "name": "walletToRecover",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "guardianWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recoveryAttempt",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "rejectRecovery",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addTrustedPubkey",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "pubkey",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "wallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pendingGuardians",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "pendingGuardiansApprovalFrom",
            "type": {
              "vec": "i64"
            }
          },
          {
            "name": "approvedGuardians",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "recoveryMode",
            "type": "bool"
          },
          {
            "name": "recoveryThreshold",
            "type": "u8"
          },
          {
            "name": "walletRecoverySequence",
            "type": "u64"
          },
          {
            "name": "currentRecovery",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "guarding",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "trustedPubkeys",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "pubkeyHistory",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "incubationMode",
            "type": "bool"
          },
          {
            "name": "ongoingTransfers",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "recoveryAttempt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "proposer",
            "type": "publicKey"
          },
          {
            "name": "newOwner",
            "type": "publicKey"
          },
          {
            "name": "guardians",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "approvals",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "isExecuted",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "guardedTransfer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isSplTransfer",
            "type": "bool"
          },
          {
            "name": "from",
            "type": "publicKey"
          },
          {
            "name": "to",
            "type": "publicKey"
          },
          {
            "name": "fromTokenAccount",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "toBase",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "tokenMint",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "programId",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "approvers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "approvals",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "isExecutable",
            "type": "bool"
          },
          {
            "name": "rentPayer",
            "type": "publicKey"
          },
          {
            "name": "random",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GuardedTransferData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "to",
            "type": "publicKey"
          },
          {
            "name": "toBase",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "mint",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "fromTokenAccount",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "tokenProgram",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "random",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGuardian",
      "msg": "Invalid guardian"
    },
    {
      "code": 6001,
      "name": "FullfillmentAmountNotExact",
      "msg": "Amount not exact"
    },
    {
      "code": 6002,
      "name": "NoApprovedGuardians",
      "msg": "No approved guardian"
    },
    {
      "code": 6003,
      "name": "GuardianAlreadyAdded",
      "msg": "Guardian already added"
    },
    {
      "code": 6004,
      "name": "GuardianApprovalTimeNotElapsed",
      "msg": "Guardian approval time not elapsed"
    },
    {
      "code": 6005,
      "name": "KeyNotFound",
      "msg": "Key not found"
    },
    {
      "code": 6006,
      "name": "PaymentsDisabled",
      "msg": "Payments are disabled - Wallet in recovery mode"
    },
    {
      "code": 6007,
      "name": "TransferNotExecutable",
      "msg": "Requested transfer is not executable"
    },
    {
      "code": 6008,
      "name": "TransferAlreadyComplete",
      "msg": "Requested transfer is already completed"
    },
    {
      "code": 6009,
      "name": "KeyMisMatch",
      "msg": "Keys mismatch"
    },
    {
      "code": 6010,
      "name": "WalletNotInIncubation",
      "msg": "Wallet is not in incubation mode"
    },
    {
      "code": 6011,
      "name": "TrustedPubkeyNoTransactions",
      "msg": "No transaction history with pub key"
    },
    {
      "code": 6012,
      "name": "TrustedPubkeyAlreadyTrusted",
      "msg": "Pubkey is already trusted"
    },
    {
      "code": 6013,
      "name": "OngoingTransferIncomplete",
      "msg": "Ongoing transfer is incomplete"
    },
    {
      "code": 6014,
      "name": "InvalidTransferType",
      "msg": "The requested transfer type is invalid"
    },
    {
      "code": 6015,
      "name": "InvalidTransferData",
      "msg": "Invalid transfer data"
    }
  ]
};

export const IDL: Solace = {
  "version": "0.1.0",
  "name": "solace",
  "instructions": [
    {
      "name": "createWallet",
      "accounts": [
        {
          "name": "signer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "type": "string",
                "value": "SOLACE"
              },
              {
                "kind": "arg",
                "type": "string",
                "path": "name"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "owner",
          "type": "publicKey"
        },
        {
          "name": "guardianKeys",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "recoveryThreshold",
          "type": "u8"
        },
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "endIncubation",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "requestInstantSplTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverBase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "requestInstantSolTransfer",
      "accounts": [
        {
          "name": "toAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "requestGuardedTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Wallet",
                "path": "wallet"
              },
              {
                "kind": "arg",
                "type": "publicKey",
                "path": "random_key"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "data",
          "type": {
            "defined": "GuardedTransferData"
          }
        }
      ]
    },
    {
      "name": "approveTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveAndExecuteSplTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "transfer",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverBase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveAndExecuteSolTransfer",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "executeTransfer",
      "accounts": [
        {
          "name": "transferAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "tokenAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recieverBase",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "tokenMint",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addGuardians",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "guardian",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "approveGuardianship",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "guardian",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "removeGuardians",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initiateWalletRecovery",
      "accounts": [
        {
          "name": "rentPayer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recovery",
          "isMut": true,
          "isSigner": false,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "type": "publicKey",
                "account": "Wallet",
                "path": "wallet"
              },
              {
                "kind": "account",
                "type": "u64",
                "account": "Wallet",
                "path": "wallet.wallet_recovery_sequence"
              }
            ]
          }
        },
        {
          "name": "proposer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "newOwner",
          "type": "publicKey"
        }
      ]
    },
    {
      "name": "approveRecoveryByKeypair",
      "accounts": [
        {
          "name": "walletToRecover",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "guardian",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "recoveryAttempt",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "approveRecoveryBySolace",
      "accounts": [
        {
          "name": "walletToRecover",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "guardianWallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "recoveryAttempt",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "rejectRecovery",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "addTrustedPubkey",
      "accounts": [
        {
          "name": "wallet",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "owner",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "pubkey",
          "type": "publicKey"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "wallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "pendingGuardians",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "pendingGuardiansApprovalFrom",
            "type": {
              "vec": "i64"
            }
          },
          {
            "name": "approvedGuardians",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "recoveryMode",
            "type": "bool"
          },
          {
            "name": "recoveryThreshold",
            "type": "u8"
          },
          {
            "name": "walletRecoverySequence",
            "type": "u64"
          },
          {
            "name": "currentRecovery",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "guarding",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "trustedPubkeys",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "pubkeyHistory",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "incubationMode",
            "type": "bool"
          },
          {
            "name": "ongoingTransfers",
            "type": {
              "vec": "publicKey"
            }
          }
        ]
      }
    },
    {
      "name": "recoveryAttempt",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "proposer",
            "type": "publicKey"
          },
          {
            "name": "newOwner",
            "type": "publicKey"
          },
          {
            "name": "guardians",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "approvals",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "isExecuted",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "guardedTransfer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "isSplTransfer",
            "type": "bool"
          },
          {
            "name": "from",
            "type": "publicKey"
          },
          {
            "name": "to",
            "type": "publicKey"
          },
          {
            "name": "fromTokenAccount",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "toBase",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "tokenMint",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "programId",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "approvers",
            "type": {
              "vec": "publicKey"
            }
          },
          {
            "name": "approvals",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "threshold",
            "type": "u8"
          },
          {
            "name": "isExecutable",
            "type": "bool"
          },
          {
            "name": "rentPayer",
            "type": "publicKey"
          },
          {
            "name": "random",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GuardedTransferData",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "to",
            "type": "publicKey"
          },
          {
            "name": "toBase",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "mint",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "fromTokenAccount",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "tokenProgram",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "random",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidGuardian",
      "msg": "Invalid guardian"
    },
    {
      "code": 6001,
      "name": "FullfillmentAmountNotExact",
      "msg": "Amount not exact"
    },
    {
      "code": 6002,
      "name": "NoApprovedGuardians",
      "msg": "No approved guardian"
    },
    {
      "code": 6003,
      "name": "GuardianAlreadyAdded",
      "msg": "Guardian already added"
    },
    {
      "code": 6004,
      "name": "GuardianApprovalTimeNotElapsed",
      "msg": "Guardian approval time not elapsed"
    },
    {
      "code": 6005,
      "name": "KeyNotFound",
      "msg": "Key not found"
    },
    {
      "code": 6006,
      "name": "PaymentsDisabled",
      "msg": "Payments are disabled - Wallet in recovery mode"
    },
    {
      "code": 6007,
      "name": "TransferNotExecutable",
      "msg": "Requested transfer is not executable"
    },
    {
      "code": 6008,
      "name": "TransferAlreadyComplete",
      "msg": "Requested transfer is already completed"
    },
    {
      "code": 6009,
      "name": "KeyMisMatch",
      "msg": "Keys mismatch"
    },
    {
      "code": 6010,
      "name": "WalletNotInIncubation",
      "msg": "Wallet is not in incubation mode"
    },
    {
      "code": 6011,
      "name": "TrustedPubkeyNoTransactions",
      "msg": "No transaction history with pub key"
    },
    {
      "code": 6012,
      "name": "TrustedPubkeyAlreadyTrusted",
      "msg": "Pubkey is already trusted"
    },
    {
      "code": 6013,
      "name": "OngoingTransferIncomplete",
      "msg": "Ongoing transfer is incomplete"
    },
    {
      "code": 6014,
      "name": "InvalidTransferType",
      "msg": "The requested transfer type is invalid"
    },
    {
      "code": 6015,
      "name": "InvalidTransferData",
      "msg": "Invalid transfer data"
    }
  ]
};
