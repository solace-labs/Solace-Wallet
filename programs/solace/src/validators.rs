use crate::*;

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
