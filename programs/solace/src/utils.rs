use anchor_lang::prelude::*;

use crate::*;

/// Logic to check if the owner can be updated or not
pub fn can_update_owner(wallet: &Wallet, recovery: &RecoveryAttempt) -> Result<bool> {
    let threshold = wallet.approval_threshold;
    let approvers = recovery.approvals.clone();

    let approval_count = approvers.iter().filter(|&&x| x).count();

    if approval_count >= threshold as usize {
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Utility function to check if a threshold limit is reached
/// given a vec of bools, check if there are enough "true" in the vector for the action to pass
/// Function name can be better
pub fn is_action_approved(approvals: Vec<bool>, threshold: u8) -> bool {
    let approval_count = approvals.iter().filter(|&&x| x).count();

    if approval_count >= (threshold as usize) {
        true
    } else {
        false
    }
}

/// Given a vector of T, and a key to find T, find the index of the key
/// This function helps get the index and reduces the number of characters required for doing it
pub fn get_key_index<T: Eq>(keys: Vec<T>, key_to_find: T) -> Option<usize> {
    keys.into_iter().position(|x| x == key_to_find)
}

/// A gigachad convenience function to execute SPL Token Transfers from a PDA
/// Takes accounts required for the transfers and returns a result
/// Used in most transfer functions
pub fn do_execute_transfer<'a>(
    token_account: AccountInfo<'a>,
    reciever_account: AccountInfo<'a>,
    authority: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    amount: u64,
    seeds: &[&[&[u8]]],
    wallet: &mut Wallet,
) -> Result<()> {
    let transfer_instruction = Transfer {
        from: token_account,
        to: reciever_account.clone(),
        authority,
    };
    // anchor_lang::solana_program::pubkey::Pubkey::find_program_address(
    //     &[&[&[reciever_account]]],
    //     &token_program.key(),
    // );
    // transfer_instruction
    msg!(format_args!("transferring {} USDC", amount)
        .to_string()
        .as_str());
    let cpi_ctx = CpiContext::new_with_signer(token_program, transfer_instruction, &seeds);
    anchor_spl::token::transfer(cpi_ctx, amount)?;
    msg!("transfer complete");
    let reciever_key = reciever_account.key();
    // Push the reciever to the pubkey history if it doesn't already contain it
    if !wallet.pubkey_history.contains(&reciever_key) {
        wallet.pubkey_history.push(reciever_key);
    }
    Ok(())
}
