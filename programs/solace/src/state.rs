use anchor_lang::prelude::*;
use vipers::invariant;

use crate::{utils, Errors};

#[account]
pub struct Wallet {
    // The guardians for this wallet
    pub pending_guardians: Vec<Pubkey>,
    // The unix timestamps from when the approvals can be made
    pub pending_guardians_approval_from: Vec<i64>,
    // The guardians for this wallet
    pub approved_guardians: Vec<Pubkey>,
    // The owner for the wallet
    pub owner: Pubkey,
    // The base key for deriving PDA's for this wallet
    pub name: String,
    // The bump for the PDA
    pub bump: u8,
    // Checks if the wallet is in recovery mode
    pub recovery_mode: bool,
    // The threshold for approving recovery and transactions
    pub approval_threshold: u8,
    // Wallet recovery sequence
    pub wallet_recovery_sequence: u64,
    // Current recovery address
    pub current_recovery: Option<Pubkey>,
    // All the accounts the users are guarding
    pub guarding: Vec<Pubkey>,
    // The time at which the wallet was created. Used to calculate the incubation period
    pub created_at: i64,
    // A list of trusted pubkeys to which transactions can be instant
    pub trusted_pubkeys: Vec<Pubkey>,
    // History of all the pubkeys the wallet has transacted with
    pub pubkey_history: Vec<Pubkey>,
    // If the wallet is in incubation or not. To be checked on only within the H12 window
    pub incubation_mode: bool,
    // List of ongoing transfers
    pub ongoing_transfers: Vec<Pubkey>,
}

#[account]
pub struct RecoveryAttempt {
    pub bump: u8,
    // The parent wallet
    pub wallet: Pubkey,
    // The owner of the wallet
    pub owner: Pubkey,
    // The proposer of the recovery
    pub proposer: Pubkey,
    // New proposed owner
    pub new_owner: Pubkey,
    // The guardians of the recovery
    pub guardians: Vec<Pubkey>,
    // The approvals provided by the guardians
    pub approvals: Vec<bool>,
    // Is the wallet recovery executed
    pub is_executed: bool,
}

// PDA Account to handle SPL Transfers
#[account]
pub struct GuardedTransfer {
    // Flag to check if SPL Transfer
    pub is_spl_transfer: bool,
    // Usually the pubkey of the account itself
    pub from: Pubkey,
    // The associated token account to which the transfer needs to be made
    pub to: Pubkey,
    // ATA of the wallet
    pub from_token_account: Option<Pubkey>,
    // In the case that the to_key was derived
    pub to_base: Option<Pubkey>,
    // Mint of the token to be transferred
    pub token_mint: Option<Pubkey>,
    // None if SOL transfer and Some(Pubkey) for SPL transfers
    pub program_id: Option<Pubkey>,
    // The amount to be transacted
    pub amount: u64,
    // The approvers of the transactions
    pub approvers: Vec<Pubkey>,
    // The approvals by guardians
    pub approvals: Vec<bool>,
    // The threshold of approvals required for the transaction
    pub threshold: u8,
    // Flag if the transfer is executable or not
    pub is_executable: bool,
    // Payer pubkey for refunds
    pub rent_payer: Pubkey,
    // The random pubkey used to derive this account
    pub random: Pubkey,
}

impl GuardedTransfer {
    /// Get the space required to store the data about a transfer
    pub fn space(max_guardians: u8) -> usize {
        4 // Anchor discriminator
            + std::mem::size_of::<GuardedTransfer>()
            + 4 // 4 = the Vec discriminator
            + std::mem::size_of::<Pubkey>() * (max_guardians as usize)
    }
}

impl Wallet {
    /// Helper to check if the wallet has any approved guardians
    pub fn has_guardians(&self) -> bool {
        self.approved_guardians.len() != 0
    }

    /// Check if the wallet is in incubation mode or not
    pub fn check_incubation(&mut self) -> bool {
        let now = Clock::get().unwrap().unix_timestamp;
        // Check if the wallet is in incubation mode
        if self.created_at < now * 12 * 36000 {
            // if the wallet is in the incubation window, then respect the incubation_mode flag
            self.incubation_mode
        } else {
            false
        }
    }

    /// Check if a pubkey is trusted by the wallet
    pub fn is_pubkey_trusted(&self, pubkey: Pubkey) -> bool {
        crate::utils::get_key_index(self.trusted_pubkeys.clone(), pubkey).is_some()
    }

    /// Check if a given guardian pubkey is a valid guardian or not
    pub fn validate_guardian(&self, guardian: Pubkey) -> bool {
        crate::utils::get_key_index(self.approved_guardians.clone(), guardian).is_some()
    }
}

impl GuardedTransfer {
    /// Utility method to approve an ongoing transfer
    /// Checks if the guardian is a part of the transfer or not
    /// Sets the associated boolean to "true" if valid
    /// Panics if invalid
    pub fn approve_transfer(&mut self, guardian_pubkey: Pubkey) -> Result<()> {
        // Ensure that the signed guardian is a part of the transfer
        let index = utils::get_key_index(self.approvers.clone(), guardian_pubkey);
        invariant!(index.is_some(), Errors::InvalidGuardian);

        self.approvals[index.unwrap()] = true;
        self.is_executable = utils::is_action_approved(self.approvals.clone(), self.threshold);

        Ok(())
    }
}
