use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use vipers::prelude::*;

mod errors;
mod state;
mod utils;
mod validators;

use crate::utils::get_key_index;
use anchor_spl::token::Transfer;
pub use errors::*;
pub use state::*;
pub use validators::*;

declare_id!("3CvPZTk1PYMs6JzgiVNFtsAeijSNwbhrQTMYeFQKWpFw");

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
        wallet.ongoing_transfer = OngoingTransfer::default();
        // Set that the ongoing transfer is complete, so no new transfers get held up
        wallet.ongoing_transfer.is_complete = true;
        wallet.incubation_mode = true;
        Ok(())
    }

    // Add a token acount for a particular mint address. Ex. USDC
    pub fn create_ata(_ctx: Context<CreateATA>) -> Result<()> {
        Ok(())
    }

    // Check if a token account is valid
    pub fn check_ata(_ctx: Context<CheckATA>) -> Result<()> {
        Ok(())
    }

    // Deposit SPL tokens for a given mint address
    pub fn deposit_spl_tokens(_ctx: Context<NoAccount>) -> Result<()> {
        todo!();
        Ok(())
    }

    // Deposit sol to the wallet. But why would anyone ever do that?
    pub fn deposit_sol(_ctx: Context<NoAccount>) -> Result<()> {
        Ok(())
    }

    // Send sol to a particular account
    pub fn send_sol(ctx: Context<SendSol>, amount_of_lamports: u64) -> Result<()> {
        let from_account = &mut ctx.accounts.wallet;
        // TODO: Check if the pda is in recovery mode and abort transaction if then

        assert!(!from_account.recovery_mode, "Payments are disabled");
        let to = ctx.accounts.to_account.to_account_info();
        let from = ctx.accounts.wallet.to_account_info();

        **from.try_borrow_mut_lamports()? -= amount_of_lamports;
        **to.try_borrow_mut_lamports()? += amount_of_lamports;

        Ok(())
    }

    pub fn end_incubation(ctx: Context<Verified>) -> Result<()> {
        invariant!(
            ctx.accounts.wallet.incubation_mode,
            errors::Errors::WalletNotInIncubation
        );
        ctx.accounts.wallet.incubation_mode = false;
        Ok(())
    }

    pub fn request_transaction(ctx: Context<SendSPL>, amount: u64) -> Result<()> {
        let token_mint = ctx.accounts.token_mint.key().clone();
        let bump = ctx.accounts.wallet.bump.clone().to_le_bytes();
        let wallet = ctx.accounts.wallet.clone();
        // [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],

        let inner = vec![b"SOLACE".as_ref(), wallet.name.as_str().as_ref(), &bump];
        let seeds = vec![inner.as_slice()];
        let ongoing_transfer = wallet.ongoing_transfer.clone();
        let token_account = ctx.accounts.token_account.to_account_info();
        let reciever_account = ctx.accounts.reciever_account.to_account_info();
        let token_program = ctx.accounts.token_program.to_account_info();
        invariant!(wallet.ongoing_transfer.is_complete);

        let wallet_mut = &mut ctx.accounts.wallet;
        wallet_mut.ongoing_transfer.is_complete = false;
        wallet_mut.ongoing_transfer.program_id = Some(ctx.accounts.token_program.key());
        wallet_mut.ongoing_transfer.to = ctx.accounts.reciever_account.key();
        wallet_mut.ongoing_transfer.from = ctx.accounts.token_account.key();
        wallet_mut.ongoing_transfer.amount = amount;
        wallet_mut.ongoing_transfer.token_mint = ctx.accounts.token_mint.key();
        wallet_mut.ongoing_transfer.to_base = ctx.accounts.reciever_base.key();

        // If the wallet is in incubation mode or if the wallet is not guarded
        if wallet_mut.check_incubation()
            || !wallet.has_guardians()
            || wallet.is_pubkey_trusted(reciever_account.key())
        {
            utils::do_execute_transfer(
                token_account,
                reciever_account,
                wallet.to_account_info(),
                token_program,
                amount,
                &seeds,
                wallet_mut,
            )?;
            if utils::get_key_index(
                wallet.pubkey_history.clone(),
                ctx.accounts.reciever_account.key(),
            )
            .is_none()
            {
                wallet_mut
                    .pubkey_history
                    .push(ctx.accounts.reciever_account.clone().key());
            }
            // Set that the transfer is complete
            wallet_mut.ongoing_transfer.is_complete = true;
        } else {
            wallet_mut.ongoing_transfer.is_complete = false;
            wallet_mut.ongoing_transfer.approvers = wallet.approved_guardians.clone();
            wallet_mut.ongoing_transfer.approvals = vec![false; wallet.approved_guardians.len()];
        }
        Ok(())
    }

    /// Approve the transfer of funds by being a guardian signer
    pub fn approve_transfer(ctx: Context<ApproveTransfer>) -> Result<()> {
        let guardian = ctx.accounts.guardian.key();
        assert!(ctx.accounts.wallet.validate_guardian(guardian));
        // Now that the guardian is validated, we can approve the transaction by the guardian
        let wallet = &mut ctx.accounts.wallet;
        wallet.approve_transfer(guardian);

        Ok(())
    }

    /// Approve a transaction and if applicable, execute it as well
    pub fn approve_and_execute_transfer(ctx: Context<ApproveAndExecuteTransfer>) -> Result<()> {
        let guardian = ctx.accounts.guardian.key();
        assert!(ctx.accounts.wallet.validate_guardian(guardian));
        // Now that the guardian is validated, we can approve the transaction by the guardian
        let wallet_mut = &mut ctx.accounts.wallet;
        let is_executable = wallet_mut.approve_transfer(guardian);
        msg!(format!(
            "guardian approval complete - is executable: {}",
            is_executable
        )
        .as_str());
        if is_executable {
            let bump = ctx.accounts.wallet.bump.clone().to_le_bytes();
            let wallet = ctx.accounts.wallet.clone();
            let inner = vec![b"SOLACE".as_ref(), wallet.name.as_str().as_ref(), &bump];
            let seeds = vec![inner.as_slice()];
            let ongoing_transfer = wallet.ongoing_transfer.clone();
            let token_account = ctx.accounts.token_account.to_account_info();
            let reciever_account = ctx.accounts.reciever_account.to_account_info();
            let authority = ctx.accounts.wallet.to_account_info();
            let token_program = ctx.accounts.token_program.to_account_info();
            let amount = wallet.ongoing_transfer.amount;
            // Checks to ensure that the transfer is legitimate
            assert_eq!(ongoing_transfer.from, token_account.key());
            assert_eq!(ongoing_transfer.to, reciever_account.key());
            assert!(ongoing_transfer.is_executable);

            utils::do_execute_transfer(
                token_account,
                reciever_account,
                authority,
                token_program,
                amount,
                &seeds,
                &mut ctx.accounts.wallet,
            )?;
            ctx.accounts.wallet.ongoing_transfer.is_complete = true;
        }
        Ok(())
    }

    pub fn execute_transfer(ctx: Context<ExecuteTransfer>) -> Result<()> {
        let bump = ctx.accounts.wallet.bump.clone().to_le_bytes();
        let wallet = ctx.accounts.wallet.clone();
        let inner = vec![b"SOLACE".as_ref(), wallet.name.as_str().as_ref(), &bump];
        let seeds = vec![inner.as_slice()];
        let ongoing_transfer = wallet.ongoing_transfer.clone();
        let token_account = ctx.accounts.token_account.to_account_info();
        let reciever_account = ctx.accounts.reciever_account.to_account_info();
        let authority = ctx.accounts.wallet.to_account_info();
        let token_program = ctx.accounts.token_program.to_account_info();
        let amount = wallet.ongoing_transfer.amount;

        // Checks to ensure that the transfer is legitimate
        assert_keys_eq!(
            ongoing_transfer.from,
            token_account.key(),
            errors::Errors::KeyMisMatch,
        );
        assert_keys_eq!(
            ongoing_transfer.to,
            reciever_account.key(),
            errors::Errors::KeyMisMatch,
        );
        invariant!(
            ongoing_transfer.is_executable,
            errors::Errors::TransferNotExecutable
        );
        invariant!(
            !ongoing_transfer.is_complete,
            errors::Errors::TransferAlreadyComplete
        );

        utils::do_execute_transfer(
            token_account,
            reciever_account,
            authority,
            token_program,
            amount,
            &seeds,
            &mut ctx.accounts.wallet,
        )?;

        Ok(())
    }

    /// Adds a guadian to the wallet's pending_guardians vector
    /// Access Control - Owner Only
    pub fn add_guardians(
        ctx: Context<AddGuardians>,
        guardian: Pubkey,
        recovery_threshold: u8,
    ) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let now = Clock::get().unwrap().unix_timestamp;
        // Check if the wallet is in incubation mode
        if wallet.created_at < now * 12 * 36000 {
            wallet.approved_guardians.push(guardian);
        } else {
            // Pending guardian only if a guardian is added post the incubation time
            // Approval can happen only after 36 hours
            wallet.pending_guardians.push(guardian);
            wallet
                .pending_guardians_approval_from
                .push(now + 36 * 36000);
        }
        // TODO: Handle recovery thresholds based on how many guardians are approved
        wallet.recovery_threshold = recovery_threshold;
        msg!("Added new pending guardians");
        Ok(())
    }

    /// Approve a guardian to the wallet
    /// Remove the given guardian from the pending guardians vec and add them to the approved guardian vec
    /// This requires the guardian to be a keypair guardian and not a solace-guardian
    /// Check for time-lock
    pub fn approve_guardianship(ctx: Context<ApproveGuardian>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let index = wallet
            .pending_guardians
            .iter()
            .position(|&x| x == ctx.accounts.guardian.key())
            .ok_or(errors::Errors::InvalidGuardian)
            .unwrap();

        let now = Clock::get().unwrap().unix_timestamp;

        let approval_time = wallet.pending_guardians_approval_from[index];
        // Ensure that the require amount of wait time has passed
        assert!(
            now > approval_time,
            "required wait-time has not yet been elapsed"
        );
        wallet.pending_guardians.remove(index);
        wallet.pending_guardians_approval_from.remove(index);
        wallet.approved_guardians.push(ctx.accounts.guardian.key());

        msg!("Guardian Approved");
        Ok(())
    }

    /// Remove guardian
    /// TODO: Add timelock to remove guardians
    pub fn remove_guardians(ctx: Context<RemoveGuardian>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let approved_guardians = wallet.approved_guardians.clone();
        let index = approved_guardians
            .iter()
            .position(|&x| x == ctx.accounts.guardian.key())
            .ok_or(errors::Errors::InvalidGuardian)
            .unwrap();
        wallet.approved_guardians.remove(index);
        msg!("Guardain removed");
        Ok(())
    }

    /// Initiate wallet recovery for an account
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

    /// Approve the recovery attempt as a key pair guardian
    #[access_control(ctx.accounts.validate())]
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

    /// Approve the recovery attempt as a Solace Guardian
    #[access_control(ctx.accounts.validate())]
    pub fn approve_recovery_by_solace(ctx: Context<ApproveRecoveryBySolace>) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet_to_recover;
        let recovery = &mut ctx.accounts.recovery_attempt;

        let index = utils::get_key_index(
            wallet.approved_guardians.clone(),
            ctx.accounts.guardian_wallet.key(),
        )
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

    // ----------------------------------------

    pub fn add_trusted_pubkey(ctx: Context<Verified>, pubkey: Pubkey) -> Result<()> {
        let wallet = &mut ctx.accounts.wallet;
        let wallet_clone = wallet.clone();

        if get_key_index(wallet_clone.trusted_pubkeys.clone(), pubkey).is_some() {
            return Err(errors::Errors::TrustedPubkeyAlreadyTrusted.into());
        }

        let is_in_incubation = wallet.check_incubation();
        let trusted_pubkeys = &mut wallet.trusted_pubkeys;

        // check if the app is in the incubation period
        // if yes then add the pubkey to the list blindly
        if is_in_incubation {
            trusted_pubkeys.push(pubkey);
            msg!("wallet added to trusted pubkey list");
            return Ok(());
        }

        // check if the pubkey is in the transaciton history
        // then create a new deterministic PDA which carries the expiry for adding this pubkey to the trusted list
        match get_key_index(wallet_clone.pubkey_history.clone(), pubkey) {
            Some(index) => {
                trusted_pubkeys.push(pubkey);
                // The wallet is in the transaction history
            }
            None => {
                // The wallet isn't in the transaction history and hence, can't be added to the trusted list
                return Err(errors::Errors::TrustedPubkeyNoTransactions.into());
            }
        }

        // [Use a jobs service to trigger the transaction]

        Ok(())
    }
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

#[derive(Accounts)]
pub struct ApproveGuardian<'info> {
    #[account(mut)]
    wallet: Account<'info, Wallet>,
    // The guardian who is approving the txn
    #[account(mut)]
    guardian: Signer<'info>,
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

#[derive(Accounts)]
pub struct SendSol<'info> {
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

#[derive(Accounts)]
pub struct ExecuteTransfer<'info> {
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

#[derive(Accounts)]
pub struct ApproveAndExecuteTransfer<'info> {
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
    #[account(mut)]
    guardian: Signer<'info>,
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

#[derive(Accounts)]
pub struct SendSPL<'info> {
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

#[derive(Accounts)]
pub struct CreateATA<'info> {
    #[account(mut, has_one=owner)]
    wallet: Box<Account<'info, Wallet>>,
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        init,
        payer = rent_payer,
        seeds=[b"wallet".as_ref(),
            wallet.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    rent_payer: Signer<'info>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
    rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct CheckATA<'info> {
    #[account(mut)]
    wallet: Account<'info, Wallet>,
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut)]
    rent_payer: Signer<'info>,
    #[account(
        seeds=[b"wallet".as_ref(),
            wallet.key().as_ref(),
            token_mint.key().as_ref()
        ],
        bump,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    token_account: Account<'info, TokenAccount>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
}

#[derive(Accounts)]
pub struct ApproveTransfer<'info> {
    #[account(mut)]
    wallet: Account<'info, Wallet>,
    guardian: Signer<'info>,
}
