use anchor_lang::{prelude::*, Key};
use vipers::{assert_keys_eq, invariant};

use crate::{
    errors::Errors, utils, ApproveAndExecuteSPLTransfer, ApproveTransfer, ExecuteTransfer,
    RequestGuardedTransfer, RequestInstantSOLTransfer, RequestInstantSPLTransfer,
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
pub fn approve_and_execute_spl_transfer(ctx: Context<ApproveAndExecuteSPLTransfer>) -> Result<()> {
    let accounts = ctx.accounts;
    let transfer_account = &mut accounts.transfer;

    // Ensure that the transfer type is SPL only
    invariant!(
        transfer_account.is_spl_transfer,
        Errors::InvalidTransferType
    );

    // Ensure that the transfer account is valid
    assert_keys_eq!(transfer_account.to.key(), accounts.reciever_account);
    assert_keys_eq!(
        transfer_account.to_base.unwrap().key(),
        accounts.reciever_base
    );

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
    Ok(())
}

/// Request for a guarded transfer
/// A new PDA for the transfer will be init'd and will be tracked in the wallet state
pub fn request_guarded_transfer(
    ctx: Context<RequestGuardedTransfer>,
    data: &crate::GuardedTransferData,
) -> Result<()> {
    // Add the data to the PDA and append it to the vec inside the wallet
    let transfer_account = &mut ctx.accounts.transfer;
    transfer_account.to = data.to;
    transfer_account.amount = data.amount;
    transfer_account.approvers = ctx.accounts.wallet.approved_guardians.clone();
    transfer_account.approvals = vec![false; ctx.accounts.wallet.approved_guardians.len()];
    transfer_account.is_executable = false;
    transfer_account.rent_payer = ctx.accounts.rent_payer.key();

    // The following will be none or some based on the case
    transfer_account.token_mint = data.mint;
    transfer_account.from_token_account = data.from_token_account;
    transfer_account.program_id = data.token_program;
    transfer_account.to_base = data.to_base;
    // Random key used to derive the address
    transfer_account.random = data.random;

    // Ensure that all the required data is provided and nothing is missing
    if data.from_token_account.is_none()
        && data.token_program.is_none()
        && data.mint.is_none()
        && data.to_base.is_none()
    {
        transfer_account.is_spl_transfer = false;
    } else if data.from_token_account.is_some()
        && data.token_program.is_some()
        && data.mint.is_some()
        && data.to_base.is_some()
    {
        transfer_account.is_spl_transfer = true;
    } else {
        return err!(Errors::InvalidTransferData);
    }

    ctx.accounts
        .wallet
        .ongoing_transfers
        .push(transfer_account.key());

    Ok(())
}

/// Execute a guarded transfer, given the correct accounts
pub fn execute_transfer(ctx: Context<ExecuteTransfer>) -> Result<()> {
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
