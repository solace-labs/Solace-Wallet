use anchor_lang::*;

#[error_code]
pub enum Errors {
    #[msg("Invalid guardian")]
    InvalidGuardian,

    #[msg("Amount not exact")]
    FullfillmentAmountNotExact,
}
