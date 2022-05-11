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
}
