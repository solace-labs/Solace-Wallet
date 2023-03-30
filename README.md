# Solace Protocol

Solace is a multi-chain smart-contract wallet SDK and wallet that facilitates the integration of seamless user-experience in web3 applications. Solace is well-positioned to capitalize on the growing adoption of web3 by social dApps and games, which will be the flagship sectors to watch in the upcoming cycles. 

Solace implements MPC wallets to ensure the user's funds are decentralized and non-custodial while providing a smooth experience. Here is a brief technical overview of how Solace utilizes MPC wallets to achieve this.

Program Address (Testnet) - `8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U`

Cronos Address (Testnet) - `0x59882BB120dF47DD39b07755d29f4EeAa55864d6`


![image](https://user-images.githubusercontent.com/103751566/191743628-80f07942-28e6-4cd9-b76f-cc7b5aedef00.png)

Solace provides a user-friendly SDK that can be easily integrated into modern applications, including game engines like Unity and Unreal as well as traditional interfaces that use TypeScript and React. 

Users can interact with their wallet through a web or mobile application, and the setup process involves signing in using various mechanisms like Web3Auth, Metamask, or Ledger. This approach enables users to choose their preferred level of security based on their sophistication and add more layers of security as they progress in their web3 journey.

### How does the Solace SDK work?

The Solace SDK serves as the central point of interaction for app developers to communicate with wallet-contracts and sign transactions. With the SDK, app developers can easily perform the following actions:

1. Register an Ephemeral Key to securely interact with the user's wallet.
2. Request the necessary permissions to perform the required actions.
3. Sign transactions on behalf of the user with ease.
4. Request User Metadata that is required for the application's functionality.

### Properties of ephemeral keys

- Time-bound: They expire after a finite amount of time, reducing the risk of unauthorised access to the user's MPC wallet.
- Permission-bound: They are bound by permissions approved by the user, ensuring that only authorised parties can access the user's MPC wallet.
- Revocable: They can be revoked using the user's Solace web or mobile app, giving the user complete control over who can access their MPC wallet and when.

### Registering Ephemeral Keys with the user's wallet

With the Solace SDK, DApp developers can easily register a new Ephemeral Key that can be used for specific use cases, in conjunction with the user's primary MPC wallet. Solace prompts the user for their approval through their smart-contract wallet instance.

Once the user approves, Solace's web or mobile application will use the stored Sᵤ (the secret share of the user) to add the new Ephemeral Key with the necessary permissions (also referred to as rules) to the user's MPC wallet.

This process enables a seamless and secure user experience, ensuring that only authorized parties can access the user's MPC wallet.

Note: The Solace SDK provides capabilities to help first-time users easily create a new Solace wallet within the host app with fewer than five clicks. We use in-app web-views to achieve the same.

<img width="705" alt="image" src="https://user-images.githubusercontent.com/103751566/227604097-37eec14a-6efd-4319-b64c-5b9ad8dab4bc.png">

### Request the necessary permissions to perform the required actions

By interacting the SDK, the application can either create new EKs or update the permissions of an existing and valid EK to enable it to perform more tasks on the user’s behalf.

This ruleset is initially stored on the user’s Solace Smart Contract instance for ease of access to dapps. But this can also be stored if the MPC wallet platform supports native smart-contracts (ex. ODSY).

The MPC Network will compute it’s signature share only if the requested transaction is allowed in the rules agreed by the user.

### Sign transactions on behalf of the user with ease

The Solace SDK's Ephemeral Key eliminates the need for web3 DApps to ask for user permission when submitting transactions to the target blockchain. Using the SDK, DApps can automatically compute transaction signatures and submit them to the target blockchain, as long as they follow the permission policy. This feature not only streamlines the user experience but also enhances the security of the transaction process by ensuring that only authorized parties can access the user's MPC wallet.

The SDK is particularly useful for interacting with Social Web3 DApps and for frequent in-game interactions, especially in player versus player (PvP) games, that require multiple blockchain transactions in a session. These use cases benefit from the Solace SDK's streamlined and secure transaction process, which improves the user experience.

<img width="700" alt="image" src="https://user-images.githubusercontent.com/103751566/227604319-335524d6-d661-4b0c-ba96-d1e5347db3a2.png">


### Request User Metadata that is required for the application's functionality

Sharing user metadata across applications, especially in the context of games and social networks, can significantly enhance the user experience. However, this must be done in a controlled and authorised way. Traditionally, web2 systems rely on invasive methods like cookies or KYC processes to achieve this. With Solace, users can choose to share specific pieces of their profile with applications in a secure manner using TSS. 

All user information can be stored on IPFS in encrypted form using algorithms like BLS, which leverage TSS. Applications can request to read specific user information, which the user can then approve or deny, giving Ephemeral Keys the authority to decrypt the publicly stored encrypted user information. This approach enhances the privacy and security of user data while enabling smooth experiences across applications. 

---

## License

Solace is released under the MIT license. For details check the [LICENSE](LICENSE) file
