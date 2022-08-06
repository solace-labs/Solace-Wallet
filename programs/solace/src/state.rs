use anchor_lang::prelude::*;

#[account]
pub struct Wallet {
    // The guardians for this wallet
    pub pending_guardians: Vec<Pubkey>,
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
