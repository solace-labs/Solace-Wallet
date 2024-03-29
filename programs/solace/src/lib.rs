use anchor_lang::prelude::*;
use vipers::prelude::*;

mod errors;
mod instructions;
mod state;
mod utils;
mod validators;

use anchor_spl::token::Transfer;
pub use errors::*;
pub use instructions::*;
pub use state::*;
pub use validators::*;

declare_id!("8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U");

#[program]
pub mod solace {
    use super::*;
    // Create the wallet for a owner
    // #[access_control(ctx.accounts.validate())]
    pub fn create_wallet(
        ctx: Context<CreateWallet>,
        owner: Pubkey,
        guardian_keys: Vec<Pubkey>,
        // recovery_threshold: u8,
        name: String,
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.owner = owner;
        wallet.bump = *ctx.bumps.get("wallet").unwrap();
        wallet.name = name;
        wallet.approved_guardians = vec![];
        wallet.pending_guardians = guardian_keys;
        wallet.recovery_mode = false;
        wallet.approval_threshold = 0;
        wallet.wallet_recovery_sequence = 0;
        wallet.created_at = Clock::get().unwrap().unix_timestamp;
        wallet.incubation_mode = true;
        Ok(())
    }

    /// End the incubation
    pub fn end_incubation(ctx: Context<Verified>) -> Result<()> {
        invariant!(
            ctx.accounts.wallet.incubation_mode,
            errors::Errors::WalletNotInIncubation
        );
        ctx.accounts.wallet.incubation_mode = false;
        Ok(())
    }

    /// Request an instant SPL transfer
    /// This can only be called if the wallet is in incubation mode
    /// Or if the address is trusted
    pub fn request_instant_spl_transfer(
        ctx: Context<RequestInstantSPLTransfer>,
        amount: u64,
    ) -> Result<()> {
        instructions::transfers::request_instant_spl_transfer(ctx, amount)
    }

    /// Request an instant SOL transfer
    /// This can only be called if the wallet is in incubation mode
    /// Or if the address is trusted
    pub fn request_instant_sol_transfer(
        ctx: Context<RequestInstantSOLTransfer>,
        amount: u64,
    ) -> Result<()> {
        instructions::transfers::request_instant_sol_transfer(ctx, amount)
    }

    /// Request for a new guarded SOL transfer
    pub fn request_guarded_spl_transfer(
        ctx: Context<RequestGuardedSplTransfer>,
        data: GuardedSPLTransferData,
    ) -> Result<()> {
        instructions::transfers::request_guarded_spl_transfer(ctx, &data)
    }

    /// Request for a new guarded SOL transfer
    pub fn request_guarded_sol_transfer(
        ctx: Context<RequestGuardedSolTransfer>,
        data: GuardedSOLTransferData,
    ) -> Result<()> {
        instructions::transfers::request_guarded_sol_transfer(ctx, &data)
    }

    /// Approve the transfer of funds by being a guardian signer
    pub fn approve_transfer(ctx: Context<ApproveTransfer>) -> Result<()> {
        instructions::transfers::approve_transfer(ctx)
    }

    /// Approve a SPL transaction and if applicable, execute it as well
    /// Else throw an error
    #[access_control(ctx.accounts.validate())]
    pub fn approve_and_execute_spl_transfer(
        ctx: Context<ApproveAndExecuteSPLTransfer>,
        seed_key: Pubkey,
    ) -> Result<()> {
        instructions::transfers::approve_and_execute_spl_transfer(ctx, seed_key)
    }

    /// Approve a SOL transaction and if applicable, execute it as well
    /// Else throw an error
    #[access_control(ctx.accounts.validate())]
    pub fn approve_and_execute_sol_transfer(
        ctx: Context<ApproveAndExecuteSOLTransfer>,
    ) -> Result<()> {
        instructions::transfers::approve_and_execute_sol_transfer(ctx)
    }

    /// Execute a trasnfer, as long as a transfer is already approved
    /// This acts as a proxy when all guardians have approved the transfer but the transfer is still not approved
    #[access_control(ctx.accounts.validate())]
    pub fn execute_transfer(ctx: Context<ExecuteSPLTransfer>) -> Result<()> {
        instructions::transfers::execute_transfer(ctx)
    }

    /// Adds a guardian to the wallet appropriately
    /// Access Control - Owner Only
    pub fn add_guardians(ctx: Context<Verified>, guardian: Pubkey) -> Result<()> {
        instructions::guardians::add_guardian(ctx, guardian)
    }

    /// Set guardian threshold
    /// must be less than the total number of guardians
    /// use the same account - AddGuardians account, it is ok because we use the same account
    pub fn set_guardian_threshold(ctx: Context<Verified>, threshold: u8) -> Result<()> {
        instructions::guardians::set_guardian_threshold(ctx, threshold)
    }

    /// Approve a guardian to the wallet
    /// Remove the given guardian from the pending guardians vec and add them to the approved guardian vec
    /// This requires the guardian to be a keypair guardian and not a solace-guardian
    /// Check for time-lock
    pub fn approve_guardianship(ctx: Context<ApproveGuardian>, guardian: Pubkey) -> Result<()> {
        instructions::guardians::approve_guardianship(ctx, guardian)
    }

    /// Remove guardian
    /// TODO: Add timelock to remove guardians
    pub fn remove_guardians(_ctx: Context<RemoveGuardian>) -> Result<()> {
        todo!("Create a timelock and remove a guardian using it");
    }

    /// Initiate wallet recovery for an account
    pub fn initiate_wallet_recovery(
        ctx: Context<InitiateWalletRecovery>,
        new_owner: Pubkey,
    ) -> Result<()> {
        instructions::recovery::initiate_wallet_recovery(ctx, new_owner)
    }

    /// Approve the recovery attempt as a key pair guardian
    #[access_control(ctx.accounts.validate())]
    pub fn approve_recovery_by_keypair(ctx: Context<ApproveRecoveryByKeypair>) -> Result<()> {
        instructions::recovery::approve_recovery_by_keypair(ctx)
    }

    /// Approve the recovery attempt as a Solace Guardian
    #[access_control(ctx.accounts.validate())]
    pub fn approve_recovery_by_solace(ctx: Context<ApproveRecoveryBySolace>) -> Result<()> {
        todo!("Approve a wallet recovery using another solace wallet")
    }

    // Reject the recovery as a guardian for a wallet
    pub fn reject_recovery(_ctx: Context<NoAccount>) -> Result<()> {
        todo!("Reject a recovery from a guardian")
    }

    // ----------------------------------------

    /// Add a new trusted pubkey to the trusted list
    pub fn add_trusted_pubkey(ctx: Context<Verified>, pubkey: Pubkey) -> Result<()> {
        instructions::guardians::add_new_trusted_pubkey(ctx, pubkey)
    }
}

/// A helper struct to transfer data between the client and the program
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Debug)]
pub struct GuardedSPLTransferData {
    pub to: Pubkey,
    pub to_base: Pubkey,
    pub mint: Pubkey,
    pub from_token_account: Pubkey,
    pub token_program: Pubkey,
    pub amount: u64,
    pub random: Pubkey,
}

/// A helper struct to transfer data between the client and the program
#[derive(AnchorSerialize, AnchorDeserialize, Copy, Clone, Debug)]
pub struct GuardedSOLTransferData {
    pub to: Pubkey,
    pub amount: u64,
    pub random: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct Verified<'info> {
    #[account(mut, has_one=owner)]
    wallet: Account<'info, Wallet>,
    owner: Signer<'info>,
}

//checked - fixed size issue
// Access the name parameter passed to the txn
#[derive(Accounts)]
#[instruction(
    owner: Pubkey,
    guardian_keys: Vec<Pubkey>,
    // recovery_threshold: u8,
    name: String,
)]
pub struct CreateWallet<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    #[account(mut)]
    rent_payer: Signer<'info>,
    #[account(
        init,
        payer = rent_payer,
        space = 1000,
        seeds = [b"SOLACE".as_ref(), name.as_str().as_ref()],
        bump
    )]
    wallet: Account<'info, Wallet>,
    system_program: Program<'info, System>,
}
