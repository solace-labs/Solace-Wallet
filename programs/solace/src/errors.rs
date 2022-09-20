use anchor_lang::*;

#[error_code]
pub enum Errors {
    #[msg("Invalid guardian")]
    InvalidGuardian,

    #[msg("Amount not exact")]
    FullfillmentAmountNotExact,

    #[msg("No approved guardian")]
    NoApprovedGuardians,

    #[msg("Key not found")]
    KeyNotFound,

    #[msg("Payments are disabled - Wallet in recovery mode")]
    PaymentsDisabled,

    #[msg("Requested transfer is not executable")]
    TransferNotExecutable,

    #[msg("Requested transfer is already completed")]
    TransferAlreadyComplete,

    #[msg("Keys mismatch")]
    KeyMisMatch,

    #[msg("Wallet is not in incubation mode")]
    WalletNotInIncubation,

    #[msg("No transaction history with pub key")]
    TrustedPubkeyNoTransactions,

    #[msg("Pubkey is already trusted")]
    TrustedPubkeyAlreadyTrusted,

    #[msg("Ongoing transfer is incomplete")]
    OngoingTransferIncomplete,

    #[msg("The requested transfer type is invalid")]
    InvalidTransferType,
}
