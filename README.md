# Solace Wallet

Solace is a program based wallet for Solana which eases user's onboarding and enhances security using social recovery

### Idea

### Program Flow

1. Create a wallet
   Signer: Any

   Any user can create a wallet. The wallet owner need not be the one paying the gas for the wallet creation.

2. Add Guardians (Send request to guardians)
   Signer: Wallet Owner

   Wallet owners can add accounts as guardians to their wallet.
   TODO: Make it such that the owner need not pay the gas for the same

   The guardian public key is added to the list of Pending Guardian vector. These accounts are not "yet" guardians

3. Approve guardian request
   Signer: Guardian

   An account which has been requested to guard an existing wallet. Can either approve or decline to be the guardian of the requesting wallet

   TODO: Reject a guardian request

4. Remove guardian
   Signer: Wallet Owner

   A wallet owner can remove a guardian at any given time
   TODO: Add timelock to removing guardians

5. Initiate wallet recovery procedure
   Signer: Any

   Any new KeyPair wallet should be able to initiate a recovery procedure for an existing Solace Wallet

6. Approve wallet recovery request
   Signer: Guardian

   Approve a recovery request for a Solace Wallet, so that the recovery threshold can be met

7. Reject wallet recovery request
   Signer: Guardian

   Reject a recovery request for a Solace Wallet, so that the recovery threshold is not met
