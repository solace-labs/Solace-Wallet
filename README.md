# Solace Wallet

Solace is a program (smart-contract) based vault for Solana enhances security using social recovery.

Program Address (Testnet) - `8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U`

![image](https://user-images.githubusercontent.com/103751566/191743628-80f07942-28e6-4cd9-b76f-cc7b5aedef00.png)


### How does it work

1. User creates a Solace Program Vault Account, signed by a Keypair generated for them
2. This signing keypair becomes the owner of the Program Vault and is required for signing any transaction
3. The user then adds guardians to guard the Program Vault. These guardians can be friends / family or other wallets the user has access to (Phantom, Ledger, ...)
4. In case of losing access to the signing key pair (device theft, damage, hack, ...), the user can initiate the recovery process for their existing Program Vault with a new Signing Keypair, and request the guardians to approve the request on-chain
5. If the guardians approve of this over a threshold (3/5 or 5/7 majority as set initially), the program vault's new owner now becomes keypair requesting for recovery.
6. Thus, the user's funds were never jeopardized as a result of losing the device or the seed phrase as a recovery request freezes any funds from moving out
7. A timelock is used to prevent the hacker / malicious user from changing the guardian, such that a recovery is always prioritized over changing a guardian

### Advantages

1. **_Ease of Onboarding_** - Seed phrase to the user's signing account is redundant, and not as important as it would've been if it held all of the user's assets
2. **_Fund Security_** Funds are stored in the program (smart-contract), and is protected by the `recovery_mode` flag, which prevents funds from leaving the system

### Protocol

Solace is a vault protocol, which allows anyone to build their UI Layer on top of it. We have built the Solace Wallet App and the Solace Backend to demonstrate the capabilities of Solace

### Comparision between Keypair wallets and Program (Smart Contract) based vaults

![comparison](./assets/image.jpeg)
---

## License

Solace is released under the MIT license. For details check the [LICENSE](LICENSE) file
