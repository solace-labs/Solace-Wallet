# Solace SDK

This SDK helps your react/react-native/angular/ionic application interact with the Solace Program (Smart Contract)

### Initialize the SDK

```ts
const program = anchor.workspace.Solace as Program<Solace>;
const owner = Keypair.generate();

const sdk = new SolaceSDK({
  apiProvider: new ApiProvider(BASE_URL_FOR_HOSTED_SERVER), // Your hosted server with IPFS support
  program, // Address to your fork of solace or the original solace program
  owner,
});
```

### Create Wallet With Name

This method will check for the availability of the name in the pool of users and create a new Solace Wallet.
Ensure that the signer has enough LAMPORTS in their account for paying the txn fees. This can be mitigated by having a `request-airdrop` API on your server which funds the initial signers

The SDK instance will now be initialized with the created solace user

```ts
const name = "solace.user";

await sdk.createWalletWithName(signer, name);
```

### Send LAMPORTS

This method is used to transfer a set amount of LAMPORTS to a given public Address

```ts
await sdk.sendSol(publicKey, AMOUNT_OF_SOL_IN_LAMPORTS);
```

### Add Guardian

Adds a new guardian by public-key to the solace-user's guardian list
The Guadian's public key can be derived from the API using the `/address` endpoint

```ts
await sdk.addGuardian(GUARDIAN_PUBLIC_KEY);
```

### Remove Guardian

Removes a guardian from the solace-user's wallet

```ts
await sdk.removeGuardian(GUARDIAN_PUBLIC_KEY);
```

### Initiate Recovery

The process for initiating recovery is as follows.

1. Create a new signer
2. Initiate Recovery of the existing wallet using the lost wallet's address

Both the above steps are handled by the `createWalletToRequestRecovery` method
This will put the wallet into `recovery` mode and no funds can be transferred from the wallet

```ts
await sdk.createWalletToRequestRecovery(NewOwnerSigner, WalletAddress);
```

### Approve recovery by KeyPair

From the guardian's perspective, the SDK can be used on the guardian's end to approve the recovery. This requires the signer of the wallet to be the guardian
The next major release will also have a guardian recovery approval by solace wallet

```ts
await guardianSdk.approveRecoveryByKeypair(WalletAddressToBeRecovered);
```
