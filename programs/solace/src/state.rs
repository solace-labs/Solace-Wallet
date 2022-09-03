use anchor_lang::prelude::*;

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
    // The recovery threshold
    pub recovery_threshold: u8,
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
    // Ongoing trasnfer which requires guardian approval
    pub ongoing_transfer: OngoingTransfer,
}

#[derive(AnchorSerialize, AnchorDeserialize, Debug, PartialEq, Clone, Default)]
pub struct OngoingTransfer {
    pub from: Pubkey,
    pub to: Pubkey,
    // In the case that the to_key was derived
    pub to_base: Pubkey,
    // None of SOL transfer and Some(Pubkey) for SPL transfers
    pub program_id: Option<Pubkey>,
    // The amount to be transacted
    pub amount: u64,
    // The approvers of the transactions
    pub approvers: Vec<Pubkey>,
    // The approvals by guardians
    pub approvals: Vec<bool>,
    // Flag if the transfer is executable or not
    pub is_executable: bool,
    // Flag to check if the current ongoing transaction is complete
    pub is_complete: bool,
    // Mint of the token to be transferred
    pub token_mint: Pubkey,
}

impl Wallet {
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

    /// Check if a given guardian pubkey is a valid guardian or not
    pub fn validate_guardian(&self, guardian: Pubkey) -> bool {
        match crate::utils::get_key_index(self.approved_guardians.clone(), guardian) {
            Some(i) => true,
            None => false,
        }
    }

    /// Helper to approve a transfer and check if the transfer is executable
    pub fn approve_transfer(&mut self, guardian: Pubkey) -> bool {
        let is_executable =
            match crate::utils::get_key_index(self.approved_guardians.clone(), guardian) {
                Some(i) => {
                    assert!(
                        !self.ongoing_transfer.approvals[i],
                        "transfer already approved by guardian"
                    );
                    self.ongoing_transfer.approvals[i] = true;
                    let mut is_approval_pending = false;
                    self.ongoing_transfer.approvals.iter().for_each(|a| {
                        if !a {
                            is_approval_pending = true
                        };
                    });
                    // Return false if approval is still pending and true otherwise
                    !is_approval_pending
                }
                None => false,
            };
        if is_executable {
            self.ongoing_transfer.is_executable = true;
        }
        self.ongoing_transfer.is_executable
    }
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
