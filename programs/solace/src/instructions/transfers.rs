use anchor_lang::{prelude::*, Key};
use anchor_spl::token::{Mint, Token, TokenAccount};
use vipers::{assert_keys_eq, invariant};

use crate::{
    errors::Errors,
    state::*,
    utils::{self, get_key_index},
    Wallet,
};

/// Request instant sol transfer
pub fn request_instant_sol_transfer(
    ctx: Context<RequestInstantSOLTransfer>,
    amount: u64,
) -> Result<()> {
    let from_account = &mut ctx.accounts.wallet;
    // TODO: Check if the pda is in recovery mode and abort transaction if then

    assert!(!from_account.recovery_mode, "Payments are disabled");
    let to = ctx.accounts.to_account.to_account_info();
    let from = ctx.accounts.wallet.to_account_info();

    **from.try_borrow_mut_lamports()? -= amount;
    **to.try_borrow_mut_lamports()? += amount;

    Ok(())
}

// Request for an instant transfer, knowing that the vault will allow for the same
// Should acomodate both SPL and SOL transfers
pub fn request_instant_spl_transfer(
    ctx: Context<RequestInstantSPLTransfer>,
    amount: u64,
) -> Result<()> {
    // TODO: Check if an instant transfer is event possible

    let bump = ctx.accounts.wallet.bump.clone().to_le_bytes();
    let wallet = ctx.accounts.wallet.clone();

    let inner = vec![b"SOLACE".as_ref(), wallet.name.as_str().as_ref(), &bump];
    let seeds = vec![inner.as_slice()];
    let token_account = ctx.accounts.token_account.to_account_info();
    let reciever_account = ctx.accounts.reciever_account.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();

    let wallet_mut = &mut ctx.accounts.wallet;
    utils::do_execute_transfer(
        token_account,
        reciever_account,
        wallet.to_account_info(),
        token_program,
        amount,
        &seeds,
        wallet_mut,
    )?;
    Ok(())
}

pub fn approve_transfer(ctx: Context<ApproveTransfer>) -> Result<()> {
    let accounts = ctx.accounts;
    let transfer_account = &mut accounts.transfer;
    transfer_account.approve_transfer(accounts.guardian.key())
}

/// 1. Check if the guardian is valid for this transfer
/// 2. Approve the transfer
/// 3. Check if the transfer can be executed
/// 4. If the transfer cannot be executed, then throw and error and undo the approval, as "approve" needs to be called, not "aprove_and_execute"
pub fn approve_and_execute_spl_transfer(
    ctx: Context<ApproveAndExecuteSPLTransfer>,
    seed_key: Pubkey,
) -> Result<()> {
    let accounts = ctx.accounts;
    let transfer_account = &mut accounts.transfer;

    // Ensure that the transfer type is SPL only
    invariant!(
        transfer_account.is_spl_transfer,
        Errors::InvalidTransferType
    );

    // Ensure that the transfer account is valid
    assert_keys_eq!(transfer_account.to.key(), accounts.reciever_account);

    // Approve transfer and check if the transfer is executable
    transfer_account.approve_transfer(accounts.guardian.key())?;
    invariant!(
        transfer_account.is_executable,
        Errors::TransferNotExecutable
    );

    let bump = accounts.wallet.bump.clone().to_le_bytes();
    let wallet = accounts.wallet.clone();
    let inner = vec![b"SOLACE".as_ref(), wallet.name.as_str().as_ref(), &bump];
    let seeds = vec![inner.as_slice()];
    utils::do_execute_transfer(
        accounts.token_account.to_account_info(),
        accounts.reciever_account.to_account_info(),
        accounts.wallet.to_account_info(),
        accounts.token_program.to_account_info(),
        transfer_account.amount,
        &seeds,
        &mut accounts.wallet,
    )?;

    let index = get_key_index(
        accounts.wallet.ongoing_transfers.clone(),
        transfer_account.key(),
    )
    .unwrap();
    accounts.wallet.ongoing_transfers.remove(index);
    Ok(())
}

/// 1. Check if the guardian is valid for this transfer
/// 2. Approve the transfer
/// 3. Check if the transfer can be executed
/// 4. If the transfer cannot be executed, then throw and error and undo the approval, as "approve" needs to be called, not "aprove_and_execute"
pub fn approve_and_execute_sol_transfer(ctx: Context<ApproveAndExecuteSOLTransfer>) -> Result<()> {
    let accounts = ctx.accounts;
    let transfer_account = &mut accounts.transfer;

    // Ensure that the transfer type is SOL only
    invariant!(
        !transfer_account.is_spl_transfer,
        Errors::InvalidTransferType
    );

    // Ensure that the transfer account is valid
    assert_keys_eq!(transfer_account.to.key(), accounts.to_account);

    // Approve transfer and check if the transfer is executable
    transfer_account.approve_transfer(accounts.guardian.key())?;
    invariant!(
        transfer_account.is_executable,
        Errors::TransferNotExecutable
    );

    let wallet = accounts.wallet.clone();
    assert!(!wallet.recovery_mode, "Payments are disabled");
    let to = accounts.to_account.to_account_info();
    let from = wallet.to_account_info();

    **from.try_borrow_mut_lamports()? -= transfer_account.amount;
    **to.try_borrow_mut_lamports()? += transfer_account.amount;

    let index = get_key_index(
        accounts.wallet.ongoing_transfers.clone(),
        transfer_account.key(),
    )
    .unwrap();
    accounts.wallet.ongoing_transfers.remove(index);

    Ok(())
}

/// Request for a guarded transfer
/// A new PDA for the transfer will be init'd and will be tracked in the wallet state
pub fn request_guarded_spl_transfer(
    ctx: Context<RequestGuardedSplTransfer>,
    data: &crate::GuardedSPLTransferData,
) -> Result<()> {
    // Add the data to the PDA and append it to the vec inside the wallet
    let transfer_account = &mut ctx.accounts.transfer;
    transfer_account.to = data.to;
    transfer_account.amount = data.amount;
    transfer_account.approvers = ctx.accounts.wallet.approved_guardians.clone();
    transfer_account.threshold = ctx.accounts.wallet.approval_threshold;
    transfer_account.approvals = vec![false; ctx.accounts.wallet.approved_guardians.len()];
    transfer_account.is_executable = false;
    transfer_account.rent_payer = ctx.accounts.rent_payer.key();

    // The following will be none or some based on the case
    transfer_account.token_mint = Some(data.mint);
    transfer_account.from_token_account = Some(data.from_token_account);
    transfer_account.program_id = Some(data.token_program);
    transfer_account.to_base = Some(data.to_base);

    // Random key used to derive the address
    transfer_account.random = data.random;

    // Ensure that all the required data is provided and nothing is missing
    transfer_account.is_spl_transfer = true;

    ctx.accounts
        .wallet
        .ongoing_transfers
        .push(transfer_account.key());

    Ok(())
}

/// Request a new guarded SOL transfer
pub fn request_guarded_sol_transfer(
    ctx: Context<RequestGuardedSolTransfer>,
    data: &crate::GuardedSOLTransferData,
) -> Result<()> {
    // Add the data to the PDA and append it to the vec inside the wallet
    let transfer_account = &mut ctx.accounts.transfer;
    transfer_account.to = data.to;
    transfer_account.amount = data.amount;
    transfer_account.approvers = ctx.accounts.wallet.approved_guardians.clone();
    transfer_account.approvals = vec![false; ctx.accounts.wallet.approved_guardians.len()];
    transfer_account.is_executable = false;
    transfer_account.rent_payer = ctx.accounts.rent_payer.key();
    transfer_account.threshold = ctx.accounts.wallet.approval_threshold;

    transfer_account.token_mint = None;
    transfer_account.from_token_account = None;
    transfer_account.program_id = None;
    transfer_account.to_base = None;

    // Random key used to derive the address
    transfer_account.random = data.random;

    // Ensure that all the required data is provided and nothing is missing
    transfer_account.is_spl_transfer = false;

    ctx.accounts
        .wallet
        .ongoing_transfers
        .push(transfer_account.key());

    Ok(())
}

/// Execute a guarded transfer, given the correct accounts
pub fn execute_transfer(ctx: Context<ExecuteSPLTransfer>) -> Result<()> {
    let bump = ctx.accounts.wallet.bump.clone().to_le_bytes();
    let wallet = ctx.accounts.wallet.clone();
    let inner = vec![b"SOLACE".as_ref(), wallet.name.as_str().as_ref(), &bump];
    let seeds = vec![inner.as_slice()];
    let token_account = ctx.accounts.token_account.to_account_info();
    let reciever_account = ctx.accounts.reciever_account.to_account_info();
    let authority = ctx.accounts.wallet.to_account_info();
    let token_program = ctx.accounts.token_program.to_account_info();
    let amount = ctx.accounts.transfer_account.amount;

    // TODO: Assert that all the values match from the Transfer account
    // Ensure that the transfer account is executable
    // Ensure that the transfer account is a part of the ongoing transfers
    utils::do_execute_transfer(
        token_account,
        reciever_account,
        authority,
        token_program,
        amount,
        &seeds,
        &mut ctx.accounts.wallet,
    )?;

    // Close the PDA
    // close_any(close_address, recipient_address, authority_address, program_address)

    Ok(())
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
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
}

/// Request an instant SOL Transfer
#[derive(Accounts)]
pub struct RequestInstantSOLTransfer<'info> {
    /// CHECK: This is not dangerous because we don't read or write from this account
    #[account(mut)]
    to_account: UncheckedAccount<'info>,

    #[account(mut, has_one = owner)]
    wallet: Account<'info, Wallet>,

    #[account(mut)]
    owner: Signer<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    data: crate::GuardedSOLTransferData
)]
pub struct RequestGuardedSolTransfer<'info> {
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
        seeds = [wallet.key().as_ref(), data.random.key().as_ref()],
        bump
    )]
    transfer: Account<'info, GuardedTransfer>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
    data: crate::GuardedSPLTransferData
)]
pub struct RequestGuardedSplTransfer<'info> {
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
        seeds = [wallet.key().as_ref(), data.random.key().as_ref()],
        bump
    )]
    transfer: Account<'info, GuardedTransfer>,
    system_program: Program<'info, System>,
}

/// Approve an ongoing transfer to a wallet
/// Signed by the guardian approving the transaction
#[derive(Accounts)]
pub struct ApproveTransfer<'info> {
    // The wallet in context
    #[account(mut)]
    pub wallet: Box<Account<'info, Wallet>>,
    // The guardian approving
    #[account(mut)]
    pub guardian: Signer<'info>,
    // The GuardedTransfer Account containing the data
    #[account(mut)]
    pub transfer: Account<'info, GuardedTransfer>,
}

/// Approve and Execute a new SPL Transfer
#[derive(Accounts)]
pub struct ApproveAndExecuteSPLTransfer<'info> {
    // The wallet in context
    #[account(mut)]
    pub wallet: Box<Account<'info, Wallet>>,
    // The guardian approving
    #[account(mut)]
    pub guardian: Signer<'info>,
    // The token account transferring the funds
    #[account(
        mut,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    pub token_account: Account<'info, TokenAccount>,
    // The GuardedTransfer Account containing the data
    #[account(mut)]
    pub transfer: Account<'info, GuardedTransfer>,
    // The reciever token account
    #[account(mut,
        token::mint=token_mint,
    )]
    pub reciever_account: Account<'info, TokenAccount>,
    system_program: Program<'info, System>,
    token_program: Program<'info, Token>,
    token_mint: Account<'info, Mint>,
}

/// Approve and Execute a new SOL Transfer
#[derive(Accounts)]
pub struct ApproveAndExecuteSOLTransfer<'info> {
    // The wallet in context
    #[account(mut)]
    pub wallet: Box<Account<'info, Wallet>>,
    // The guardian approving
    #[account(mut)]
    pub guardian: Signer<'info>,
    /// CHECK: The account to which sol needs to be sent to
    #[account(mut)]
    pub to_account: AccountInfo<'info>,
    // The GuardedTransfer Account containing the data
    #[account(mut)]
    pub transfer: Account<'info, GuardedTransfer>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct NoAccount<'info> {
    #[account(mut)]
    wallet: Box<Account<'info, Wallet>>,
}

/// Execute a new SPL Transfer if the all the conditions are met
#[derive(Accounts)]
pub struct ExecuteSPLTransfer<'info> {
    #[account(mut)]
    pub transfer_account: Account<'info, GuardedTransfer>,
    #[account(mut)]
    pub wallet: Box<Account<'info, Wallet>>,
    #[account(
        mut,
        token::mint=token_mint,
        token::authority=wallet,
    )]
    pub token_account: Account<'info, TokenAccount>,

    #[account(mut, token::mint=token_mint)]
    pub reciever_account: Account<'info, TokenAccount>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub token_mint: Account<'info, Mint>,
}
