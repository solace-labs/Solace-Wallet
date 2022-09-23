use anchor_lang::prelude::*;

use crate::{errors::Errors, state::*, utils, Wallet};

/// Given a new owner, initiate a wallet recovery
/// Create a new Recovery PDA and load it with required information
/// Set the wallet in recovery_mode and assign the current recovery key
pub fn initiate_wallet_recovery(
    ctx: Context<InitiateWalletRecovery>,
    new_owner: Pubkey,
) -> Result<()> {
    let wallet = &mut ctx.accounts.wallet;
    let recovery = &mut ctx.accounts.recovery;

    recovery.wallet = wallet.key();
    recovery.new_owner = new_owner;
    recovery.proposer = ctx.accounts.proposer.key();
    recovery.bump = *ctx.bumps.get("recovery").unwrap();
    recovery.new_owner = ctx.accounts.proposer.key();
    recovery.approvals = vec![false; wallet.approved_guardians.len()];

    wallet.recovery_mode = true;
    wallet.current_recovery = Some(recovery.key());

    Ok(())
}

/// Approve the wallet recovery using a guardian keypair
/// The guardian has to be a keypair guardian and not a solace guardian
pub fn approve_recovery_by_keypair(ctx: Context<ApproveRecoveryByKeypair>) -> Result<()> {
    let wallet = &mut ctx.accounts.wallet_to_recover;
    let recovery = &mut ctx.accounts.recovery_attempt;

    let index = utils::get_key_index::<Pubkey>(
        wallet.approved_guardians.clone(),
        ctx.accounts.guardian.key(),
    )
    .ok_or(Errors::InvalidGuardian)
    .unwrap();

    msg!("Guardian found at index {:?}", &index);

    recovery.approvals[index] = true;

    let can_update = utils::can_update_owner(&wallet, &recovery).unwrap();
    if can_update {
        wallet.recovery_mode = false;
        wallet.owner = recovery.new_owner;
        recovery.is_executed = true;
    }
    msg!("New owner set");
    Ok(())
}

/// Initiate a wallet recovery for a particular Solace Wallet
/// This can be anyone signing for recover (Ideally the new wallet of the user)
#[derive(Accounts)]
pub struct InitiateWalletRecovery<'info> {
    #[account(mut)]
    rent_payer: Signer<'info>,
    #[account(mut)] // TODO: Add constraint to check guardian
    pub wallet: Account<'info, Wallet>,
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
    pub wallet_to_recover: Account<'info, Wallet>,
    // The guardian approving the recovery - Must be a keypair guardian
    #[account(mut)]
    pub guardian: Signer<'info>,
    // The recovery account
    #[account(mut)]
    recovery_attempt: Account<'info, RecoveryAttempt>,
}

/// Approve a wallet recovery by Solace Wallet
#[derive(Accounts)]
pub struct ApproveRecoveryBySolace<'info> {
    #[account(mut)]
    pub wallet_to_recover: Account<'info, Wallet>,
    // The guardian approving the recovery - Must be a keypair guardian
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut, has_one=owner)]
    pub guardian_wallet: Account<'info, Wallet>,
    // The recovery account
    #[account(mut)]
    recovery_attempt: Account<'info, RecoveryAttempt>,
}
