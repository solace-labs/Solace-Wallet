# Solace Protocol Backend (Powered by ThreadDB)

The solace protocol backend acts a supplementary infrastructure to the Solace program. The client consuming the program also uses this backend to enable UX functionalities as follows

1. Airdrop Service for opening new wallets
2. Name Service for identifying wallet addresses with usernames
3. Guardian Service for storing guardian information identifiers off chain

## Let's dig a little deeper

### Airdrop Service

A solace wallet owner, needs to have some amount of SOL in their wallet, before opening a Solace wallet. But we cannot expect this to be the case 10/10 times, as the TG we are going behind are new to crypto (NTC) users and they seldom have this experience in crypto.

Thus, the airdrop service helps bridge this gap to get these new users on to Solace. Work is still needed to make this airdrop service more protected to avoid exploits. We can follow ArgentHQ from EVM for some inspiration on this

### Name service

Every user on Solace is required to identify themselves with an unique user alias, which gets stored on IPFS (filecoin) via ~~OrbitDB~~ ThreadDB. We chose to use ~~OrbitDB~~ ThreadDb for it's Key Value store and the quick access to data it provides.

The Name Mapping of these users are stored on ~~OrbitDB~~ ThreadDB, as this will be used for "Wallet Recovery". We don't expect our users to keep their 256-bit public key, hence this decentralized way of storing their names.

In case of this server going down or being controlled by a centralized authority, the community can always fork the names on this service and start their own Server with a new client, thus adhering to the philosophy of decentralization

### Guardian Service

Every user on Solace can choose their guardians. Guardians hold the power to accept or decline a particular wallet's recovery attempt. Hence, they play a key role in the Solace ecosystem.

The guardians of every wallet are stored onchain in the PDA for each wallet, but to access this data at the time of recovery, we use IPFS (filecoin) via ~~OrbitDB~~ ThreadDB to reverse-map users and their guardians, so the user experience is smooth

The Program itself has enough checks and bounds to ensure bad guardian actors don't get to alter the recovery process, then ensuring security, but ~~OrbitDB~~ ThreadDB helps add a clean UX layer, which helps user ensure security in the Solace ecosystem

---

## Technical Details

This server is written in Nest JS and uses Swagger for documenting the API's

~~OrbitDB~~ Thread DB from Textile helps in achieving decentralized data storage, which plays a critical role in the UX of the Solace Wallet.

ThreadDB, enables encrypting the data by user groups, which ensure data-privacy on IPFS

Link to the protocol program - https://github.com/d3fkon/solace-wallet

---

The core team behind the Solace Wallet is juggles between this and a full time job. So we are actively looking for contributors to help take the Solace Wallet forward. If you are proficient in React Native, Rust (Anchorlang) for Solana or Nest JS / NodeJS, feel free to open an issue or contact us on Twitter [![Twitter URL](https://img.shields.io/twitter/url/https/twitter.com/ashwinxprasad.svg?style=social&label=Follow%20%40ashwinxprasad)](https://twitter.com/ashwinxprasad)

Let's build the next wallet geared towards mass adoption on Solana
