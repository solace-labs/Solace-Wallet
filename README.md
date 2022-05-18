# Solace Wallet

Solace is a program (smart-contract) based non-custodial wallet for Solana which eases user's onboarding and enhances security using social recovery, written in Rust

Program Address (Testnet) - `8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U`

![solace](./assets/Solace.jpg)

### The Problem

Seed Phrases deter mass adoption of crypto wallets.
Users tend to lose their seed phrases or they are a vector of attack by hackers. Having a single point of failure for user's funds, was never a good thing.

Social recovery based smart-contract / program wallets are the way of the future. They remove barrier to adoption by making seed-phrases a thing of the past and provide multiple layers of security to the user's funds.

### How does it work

1. User creates a Solace Program Wallet Account, signed by a Keypair generated for them
2. This signing keypair becomes the owner of the Program Wallet and is required for signing any transaction
3. The user then adds guardians to guard the Program Wallet. These guardians can be friends / family or other wallets the user has access to (Phantom, Ledger, ...)
4. In case of losing access to the signing key pair (device theft, damage, hack, ...), the user can initiate the recovery process for their existing Program Wallet with a new Signing Keypair, and request the guardians to approve the request on-chain
5. If the guardians approve of this over a threshold (3/5 or 5/7 majority as set initially), the program wallet's new owner now becomes keypair requesting for recovery.
6. Thus, the user's funds were never jeopardized as a result of losing the device or the seed phrase as a recovery request freezes any funds from moving out
7. A timelock is used to prevent the hacker / malicious user from changing the guardian, such that a recovery is always prioritized over changing a guardian

### Advantages

1. **_Ease of Onboarding_** - Seed phrase to the user's signing account is redundant, and not as important as it would've been if it held all of the user's assets
2. **_Fund Security_** Funds are stored in the program (smart-contract), and is protected by the `recovery_mode` flag, which prevents funds from leaving the system

### Protocol

Solace is a wallet protocol, which allows anyone to build their UI Layer on top of it. We have built the Solace Wallet App and the Solace Backend to demonstrate the capabilities of Solace

### IPFS

We use Orbit DB and IPFS to store user's guardian information. Improvisations can be made where the addresses are hashed to prevent any social engineering attacks on the user.
Current use cases of IPFS for Solace are as follows:

1. Store user's unique names (user_names) so as to make paying to other solace users convenient
2. Store user's guardian information so as to notify the guardian of recovery requests

### Comparision between Keypair wallets and Program (Smart Contract) based wallets

![comparison](./assets/image.jpeg)

### Looking for contributors

The core team is building Solace and juggling a Full Time Job. If you have experience with React Native, Rust (Anchor) or Node JS / Typescript, create an issue an in of the following repos and let's collaborate

**Solace Protocol Repo** - https://github.com/d3fkon/solace

**Solace Mobile App** https://github.com/d3fkon/solace-rn

Let's build Solana's adoption driven wallet together

