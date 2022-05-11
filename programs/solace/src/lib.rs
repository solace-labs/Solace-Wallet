use anchor_lang::prelude::*;
use vipers::prelude::*;

mod state;
mod errors;
mod utils;
mod validators;

pub use state::*;
pub use errors::*;
pub use validators::*;

declare_id!("8FRYfiEcSPFuJd27jkKaPBwFCiXDFYrnfwqgH9JFjS2U");

#[program]
pub mod solace {

    use super::*;

    // Create the wallet for a owner
    #[access_control(ctx.accounts.validate())]
    pub fn create_wallet(ctx: Context<CreateWallet>, owner: Pubkey, guardian_keys: Vec<Pubkey>, recovery_threshold: u8, bump: u8) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        wallet.owner = owner;
        wallet.bump = bump;
        wallet.base = ctx.accounts.base.key();
        wallet.approved_guardians = vec![];
        wallet.pending_guardians= guardian_keys;
        wallet.recovery_mode = false;
        wallet.recovery_threshold = recovery_threshold;
        wallet.wallet_recovery_sequence = 0;
        Ok(())
    }

    // Add a token acount for a particular mint address. Ex. USDC
    pub fn add_token_account(_ctx: Context<NoAccount>) -> Result<()> {
        Ok(())
    }

    // Deposit SPL tokens for a given mint address
    pub fn deposit_spl_tokens(_ctx: Context<NoAccount>) -> Result<()> {
        Ok(())
    }

    // Deposit sol to the wallet
    pub fn deposit_sol(_ctx: Context<NoAccount>) -> Result<()> {
        Ok(())
    }

    /// Adds a guadian to the wallet's pending_guardian vector 
    /// Access Control - Owner Only
    pub fn add_guardians(ctx: Context<AddGuardians>, guardians: Vec<Pubkey>, recovery_threshold: u8) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        guardians.iter().for_each(|key| {
            wallet.pending_guardians.push(*key);
            ()
        });
        // TODO: Handle recovery thresholds based on how many guardians are approved
        wallet.recovery_threshold = recovery_threshold;
        msg!("Added new pending guardians");
        Ok(())
    }

    /// Approve a guardian to the wallet
    /// Remove the given guardian from the pending guardians vec and add them to the approved guardian vec
    pub fn approve_guardian(ctx: Context<ApproveGuardian>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let index = wallet.pending_guardians.iter().position(|&x| x == ctx.accounts.guardian.key()).ok_or(errors::Errors::InvalidGuardian).unwrap();

        wallet.pending_guardians.remove(index);
        wallet.approved_guardians.push(ctx.accounts.guardian.key());

        msg!("Guardian Approved");

        Ok(())
    }

    /// Remove guardian
    /// TODO: Add timelock to remove guardians
    pub fn remove_guardians(ctx: Context<RemoveGuardian>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let pending_guardians = wallet.pending_guardians.clone();
        let approved_guardians = wallet.approved_guardians.clone();
        let index = [pending_guardians, approved_guardians]
            .concat()
            .iter()
            .position(|&x| x == ctx.accounts.guardian.key())
            .ok_or(errors::Errors::InvalidGuardian)
            .unwrap();
        let pending_guardians_len = &wallet.pending_guardians.len();
        if index < *pending_guardians_len {
            wallet.pending_guardians.remove(index);
        } else {
            wallet.approved_guardians.remove(index - pending_guardians_len);
        }
        msg!("Guardain removed");
        Ok(())
    }

    /// Initiate wallet recovery for an account
    pub fn initiate_wallet_recovery(ctx: Context<InitiateWalletRecovery>, new_owner: Pubkey, recovery_bump: u8) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let recovery = &mut ctx.accounts.recovery;

        recovery.wallet = wallet.key();
        recovery.new_owner= new_owner;
        recovery.proposer = ctx.accounts.proposer.key();
        recovery.bump = recovery_bump;
        recovery.new_owner = ctx.accounts.proposer.key();

        wallet.recovery_mode = true;
        wallet.current_recovery = Some(recovery.key());

        Ok(())
    }


    /// Approve the recovery attempt as a key pair guardian
    #[access_control(ctx.accounts.validate())]
    pub fn approve_recovery_by_keypair(ctx: Context<ApproveRecoveryByKeypair>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet_to_recover;
        let recovery = &mut ctx.accounts.recovery_attempt;

        let index = utils::get_key_index::<Pubkey>(wallet.approved_guardians.clone(), ctx.accounts.guardian.key())
            .ok_or(Errors::InvalidGuardian)
            .unwrap();

        recovery.approvals[index] = true;

        let can_update = utils::can_update_owner(&wallet, &recovery).unwrap();
        if can_update {
            wallet.recovery_mode = false;
            wallet.owner = recovery.new_owner;
            recovery.is_executed = true;
        }
        Ok(())
    }
    
    /// Approve the recovery attempt as a Solace Guardian
    #[access_control(ctx.accounts.validate())]
    pub fn approve_recovery_by_solace(ctx: Context<ApproveRecoveryBySolace>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet_to_recover;
        let recovery = &mut ctx.accounts.recovery_attempt;

        let index = utils::get_key_index(wallet.approved_guardians.clone(), ctx.accounts.guardian_wallet.key())
            .ok_or(Errors::InvalidGuardian) 
            .unwrap();

        recovery.approvals[index] = true;

        let can_update = utils::can_update_owner(&wallet, &recovery).unwrap();
        if can_update {
            wallet.recovery_mode = false;
            wallet.owner = recovery.new_owner;
            recovery.is_executed = true;
        }
        Ok(())
    }

    // Reject the recovery as a guardian for a wallet
    pub fn reject_recovery(_ctx: Context<NoAccount>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct NoAccount {}

#[derive(Accounts)]
pub struct CreateWallet<'info> {
    #[account(mut)]
    signer: Signer<'info>,
    /// CHECK: Ignoring checks
    #[account()]
    base: AccountInfo<'info>,
    #[account(
        init, 
        payer = signer,
        space = 1000,
        seeds = [b"SOLACE".as_ref(), base.key().as_ref()],
        bump
    )]
    wallet: Account<'info, Wallet>,
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct AddGuardians<'info> {
    #[account(mut, has_one = owner)]
    wallet: Account<'info, Wallet>,
    #[account(mut)]
    owner: Signer<'info>
}

#[derive(Accounts)]
pub struct ApproveGuardian<'info> {
    #[account(mut)]
    wallet: Account<'info, Wallet>,
    // The guardian who is approving the txn
    #[account(mut)]
    guardian: Signer<'info>
}

#[derive(Accounts)]
pub struct RemoveGuardian<'info> {
    #[account(mut, has_one = owner)]
    wallet: Account<'info, Wallet>,
    /// CHECK: The guardian account to remove
    #[account()]
    guardian: AccountInfo<'info>,
    #[account(mut)]
    owner: Signer<'info>
}

/// Initiate a wallet recovery for a particular Solace Wallet
/// This can be anyone signing for recover (Ideally the new wallet of the user)
#[derive(Accounts)]
pub struct InitiateWalletRecovery<'info> {
    #[account(mut)] // TODO: Add constraint to check guardian
    wallet: Account<'info, Wallet>,
    #[account(
        init,
        payer = proposer,
        space = 1000, // TODO: Add dynamic spacing
        seeds = [wallet.key().as_ref(), wallet.wallet_recovery_sequence.to_le_bytes().as_ref()],
        bump
    )]
    recovery: Account<'info, RecoveryAttempt>,
    #[account(mut)]
    proposer: Signer<'info>,
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct ApproveRecoveryByKeypair<'info> {
    #[account(mut)]
    wallet_to_recover: Account<'info, Wallet>,
    // The guardian approving the recovery - Must be a keypair guardian
    #[account(mut)]
    guardian: Signer<'info>,
    // The recovery account
    #[account(mut)]
    recovery_attempt: Account<'info, RecoveryAttempt>
}

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
    recovery_attempt: Account<'info, RecoveryAttempt>
}
