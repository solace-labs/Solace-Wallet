use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use vipers::prelude::*;

mod errors;
mod instructions;
mod state;
mod utils;
mod validators;

use anchor_spl::token::Transfer;
pub use errors::*;
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
        recovery_threshold: u8,
        name: String,
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.owner = owner;
        wallet.bump = *ctx.bumps.get("wallet").unwrap();
        wallet.name = name;
        wallet.approved_guardians = vec![];
        wallet.pending_guardians = guardian_keys;
        wallet.recovery_mode = false;
        wallet.recovery_threshold = recovery_threshold;
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

    /// Request for a new guarded transfer
    /// This can be used for both SOL and SPL transfers
    pub fn request_guarded_transfer(
        ctx: Context<RequestGuardedTransfer>,
        data: GuardedTransferData,
    ) -> Result<()> {
        instructions::transfers::request_guarded_transfer(ctx, &data)
    }

    /// Approve the transfer of funds by being a guardian signer
    pub fn approve_transfer(ctx: Context<ApproveTransfer>) -> Result<()> {
        instructions::transfers::approve_transfer(ctx)
    }

    /// Approve a SPL transaction and if applicable, execute it as well
    /// Else throw an error
    pub fn approve_and_execute_spl_transfer(
        ctx: Context<ApproveAndExecuteSPLTransfer>,
    ) -> Result<()> {
        instructions::transfers::approve_and_execute_spl_transfer(ctx)
    }

    /// Approve a SOL transaction and if applicable, execute it as well
    /// Else throw an error
    pub fn approve_and_execute_sol_transfer(_ctx: Context<NoAccount>) -> Result<()> {
        todo!("Based on the implementation of approve_and_execute_spl_transfer, implement sol transfer")
    }

    /// Execute a trasnfer, as long as a transfer is already approved
    /// This acts as a proxy when all guardians have approved the transfer but the transfer is still not approved
    pub fn execute_transfer(ctx: Context<ExecuteTransfer>) -> Result<()> {
        instructions::transfers::execute_transfer(ctx)
    }

    /// Adds a guardian to the wallet appropriately
    /// Access Control - Owner Only
    pub fn add_guardians(ctx: Context<AddGuardians>, guardian: Pubkey) -> Result<()> {
        instructions::guardians::add_guardian(ctx, guardian)
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
pub struct GuardedTransferData {
    pub to: Pubkey,
    pub to_base: Option<Pubkey>,
    pub mint: Option<Pubkey>,
    pub from_token_account: Option<Pubkey>,
    pub token_program: Option<Pubkey>,
    pub amount: u64,
    pub random: Pubkey,
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct NoAccount<'info> {
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
}

#[derive(Accounts)]
pub struct Verified<'info> {
    #[account(mut, has_one=owner, constraint=wallet.owner == owner.key())]
    wallet: Account<'info, Wallet>,
    owner: Signer<'info>,
}

// Access the name parameter passed to the txn
#[derive(Accounts)]
#[instruction(
    owner: Pubkey,
    guardian_keys: Vec<Pubkey>,
    recovery_threshold: u8,
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

#[derive(Accounts)]
pub struct AddGuardians<'info> {
    #[account(mut, has_one = owner)]
    wallet: Account<'info, Wallet>,
    #[account(mut)]
    owner: Signer<'info>,
}

/// Any keypair can invoke this transaction as
/// all it does is approve a pending guardian
#[derive(Accounts)]
pub struct ApproveGuardian<'info> {
    #[account(mut)]
    wallet: Account<'info, Wallet>,
}

#[derive(Accounts)]
pub struct RemoveGuardian<'info> {
    #[account(mut, has_one = owner)]
    wallet: Account<'info, Wallet>,
    /// CHECK: The guardian account to remove
    #[account()]
    guardian: AccountInfo<'info>,
    #[account(mut)]
    owner: Signer<'info>,
}

/// Request an instant SOL Transfer
#[derive(Accounts)]
pub struct RequestInstantSOLTransfer<'info> {
    /// CHECK: The account to which sol needs to be sent to
    #[account(mut)]
    to_account: AccountInfo<'info>,

    #[account(mut, has_one = owner)]
    wallet: Account<'info, Wallet>,

    #[account(mut)]
    owner: Signer<'info>,
}

/// Initiate a wallet recovery for a particular Solace Wallet
/// This can be anyone signing for recover (Ideally the new wallet of the user)
#[derive(Accounts)]
pub struct InitiateWalletRecovery<'info> {
    #[account(mut)]
    rent_payer: Signer<'info>,
    #[account(mut)] // TODO: Add constraint to check guardian
    wallet: Account<'info, Wallet>,
    #[account(
        init,
        payer = rent_payer,
        space = 1000, // TODO: Add dynamic spacing
        seeds = [wallet.key().as_ref(), wallet.wallet_recovery_sequence.to_le_bytes().as_ref()],
        bump
    )]
    recovery: Account<'info, RecoveryAttempt>,
    #[account(mut)]
    proposer: Signer<'info>,
    system_program: Program<'info, System>,
}

/// Approve a Wallet Recovery by a KeyPair
#[derive(Accounts)]
pub struct ApproveRecoveryByKeypair<'info> {
    #[account(mut)]
    wallet_to_recover: Account<'info, Wallet>,
    // The guardian approving the recovery - Must be a keypair guardian
    #[account(mut)]
    guardian: Signer<'info>,
    // The recovery account
    #[account(mut)]
    recovery_attempt: Account<'info, RecoveryAttempt>,
}

/// Approve a wallet recovery by Solace Wallet
#[derive(Accounts)]
pub struct ApproveRecoveryBySolace<'info> {
    #[account(mut)]
    wallet_to_recover: Account<'info, Wallet>,
    // The guardian approving the recovery - Must be a keypair guardian
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut, has_one=owner)]
    guardian_wallet: Account<'info, Wallet>,
    // The recovery account
    #[account(mut)]
    recovery_attempt: Account<'info, RecoveryAttempt>,
}

/// Execute a new SPL Transfer if the all the conditions are met
#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
    #[account(mut)]
    transfer_account: Account<'info, GuardedTransfer>,
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
    #[account(
        mut,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    reciever_account: Account<'info, TokenAccount>,
    // TODO: Derive the token address from the base inside the program, instead of deriving it from the client
    /// CHECK: Account to check in whitelist
    reciever_base: AccountInfo<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
}

/// Approve an ongoing transfer to a wallet
/// Signed by the guardian approving the transaction
#[derive(Accounts)]
pub struct ApproveTransfer<'info> {
    // The wallet in context
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
    // The guardian approving
    #[account(mut)]
    guardian: Signer<'info>,
    // The GuardedTransfer Account containing the data
    #[account(mut)]
    transfer: Account<'info, GuardedTransfer>,
}

/// Approve and Execute a new SPL Transfer
#[derive(Accounts)]
pub struct ApproveAndExecuteSPLTransfer<'info> {
    // The wallet in context
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
    // The guardian approving
    #[account(mut)]
    guardian: Signer<'info>,
    // The token account transferring the funds
    #[account(
        mut,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    token_account: Account<'info, TokenAccount>,
    // The GuardedTransfer Account containing the data
    #[account(mut)]
    transfer: Account<'info, GuardedTransfer>,
    // The reciever token account
    #[account(mut)]
    reciever_account: Account<'info, TokenAccount>,
    // TODO: Derive the token address from the base inside the program, instead of deriving it from the client
    /// CHECK: Account to check in whitelist
    reciever_base: AccountInfo<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
}

#[derive(Accounts)]
#[instruction(random_key: Pubkey)]
pub struct RequestGuardedTransfer<'info> {
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut)]
    rent_payer: Signer<'info>,
    #[account(
        init,
        payer = rent_payer,
        space = GuardedTransfer::space(10),
        seeds = [wallet.key().as_ref(), random_key.key().as_ref()],
        bump
    )]
    transfer: Account<'info, GuardedTransfer>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RequestInstantSPLTransfer<'info> {
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        mut,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    token_account: Account<'info, TokenAccount>,
    // [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    // associatedTokenProgramId
    #[account(mut)]
    reciever_account: Account<'info, TokenAccount>,
    // TODO: Derive the token address from the base inside the program, instead of deriving it from the client
    /// CHECK: Account to check in whitelist
    reciever_base: AccountInfo<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
}
