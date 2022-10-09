use crate::*;
use crate::{instructions::*, Errors};

impl<'info> Validate<'info> for CreateWallet<'info> {
    fn validate(&self) -> Result<()> {
        Ok(())
    }
}

// Check if the wallet recovery process can be initiataed
impl<'info> Validate<'info> for InitiateWalletRecovery<'info> {
    fn validate(&self) -> Result<()> {
        let wallet = &self.wallet;
        invariant!(
            wallet.approved_guardians.len() > 0,
            Errors::NoApprovedGuardians
        );
        Ok(())
    }
}

/// Check if the keypair guardian is a part of the approved_guardians
impl<'info> Validate<'info> for ApproveRecoveryByKeypair<'info> {
    fn validate(&self) -> Result<()> {
        let wallet = &self.wallet_to_recover;
        let index = wallet
            .approved_guardians
            .iter()
            .position(|x| x.key() == self.guardian.key())
            .ok_or(Errors::InvalidGuardian)
            .unwrap();
        assert_keys_eq!(wallet.approved_guardians[index], self.guardian);

        Ok(())
    }
}

/// Check if the Solace Guardian is a legitimate guardian for the wallet to be recovered
impl<'info> Validate<'info> for ApproveRecoveryBySolace<'info> {
    fn validate(&self) -> Result<()> {
        // Using the has_one constraint
        // let guardian_wallet = &self.guardian_wallet;
        // assert_keys_eq!(guardian_wallet.owner, self.owner);

        let wallet = &self.wallet_to_recover;
        let index = wallet
            .approved_guardians
            .iter()
            .position(|x| x.key() == self.guardian_wallet.key())
            .ok_or(Errors::InvalidGuardian)
            .unwrap();
        assert_keys_eq!(wallet.approved_guardians[index], self.guardian_wallet);

        Ok(())
    }
}

impl<'info> Validate<'info> for ExecuteSPLTransfer<'info> {
    fn validate(&self) -> Result<()> {
        let wallet = &self.wallet;
        let transfers = wallet.ongoing_transfers.clone();
        let transfer = &self.transfer_account;
        // Ensure that the transfer account exists in the ongoing transfers vec
        invariant!(transfers.contains(&transfer.key()));
        invariant!(transfer.is_executable);
        assert_keys_eq!(transfer.to, self.reciever_account);
        assert_keys_eq!(transfer.to_base.unwrap().key(), self.reciever_base);
        Ok(())
    }
}

impl<'info> Validate<'info> for ApproveAndExecuteSOLTransfer<'info> {
    fn validate(&self) -> Result<()> {
        // Ensure the guardians are legit
        // Ensure the transaction accounts are legit
        // Ensure the transfer acount is legit
        Ok(())
    }
}

impl<'info> Validate<'info> for ApproveAndExecuteSPLTransfer<'info> {
    fn validate(&self) -> Result<()> {
        // Ensure the guardians are legit
        // Ensure the transaction accounts are legit
        // Ensure the transfer acount is legit
        Ok(())
    }
}
