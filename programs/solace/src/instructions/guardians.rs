use anchor_lang::prelude::*;
use vipers::invariant;

use crate::{guardians, utils, Errors, Verified, Wallet};

/// Add a new guardian to the wallet
/// 1. Check if the account is in incubation or not
/// 2. If in incubation, add the guardian instantly
/// 3. If not in incubation, add the guardian into the pending guardian list
/// 4. Update the pending_guardian_approval_from vector
pub fn add_guardian(ctx: Context<AddGuardians>, guardian: Pubkey) -> Result<()> {
    let wallet = &mut ctx.accounts.wallet;
    let now = Clock::get().unwrap().unix_timestamp;

    // Check if the guardian already exists in the approved or pending guardian list
    invariant!(
        utils::get_key_index(wallet.approved_guardians.clone(), guardian).is_none(),
        Errors::GuardianAlreadyAdded
    );
    invariant!(
        utils::get_key_index(wallet.pending_guardians.clone(), guardian).is_none(),
        Errors::GuardianAlreadyAdded
    );

    // If the wallet is in incubation, then add the guardian to the approved guardian array
    if wallet.check_incubation() {
        wallet.approved_guardians.push(guardian);
        // TODO: Change this to consider for any external change in the recovery thresholds
        wallet.approval_threshold += 1;
    } else {
        wallet.pending_guardians.push(guardian);
        wallet
            .pending_guardians_approval_from
            .push(now + 36 * 36000);
    }
    msg!("Added new pending guardians");
    Ok(())
}

/// Approve the guardianship for a pending guardian as long as the wait time as passed
/// Check if the pending guardian's wait time has passed before approving the guardianship
pub fn approve_guardianship(ctx: Context<ApproveGuardian>, guardian: Pubkey) -> Result<()> {
    let wallet = &mut ctx.accounts.wallet;
    let index = utils::get_key_index(wallet.pending_guardians.clone(), guardian);
    // Make sure that a given guardian is a valid pending guardian
    invariant!(index.is_some(), Errors::InvalidGuardian);

    let now = Clock::get().unwrap().unix_timestamp;
    let allowed_time = wallet.pending_guardians_approval_from[index.unwrap()];
    // Guardian's approval time has not yet elapsed
    invariant!(now > allowed_time, Errors::GuardianApprovalTimeNotElapsed);
    // Remove the pending guardian at the index
    wallet.pending_guardians.remove(index.unwrap());
    wallet
        .pending_guardians_approval_from
        .remove(index.unwrap());
    // Add the guardian to the approved guardian vec
    wallet.approved_guardians.push(guardian);
    // TODO: Change this to consider for any external change in the recovery thresholds
    wallet.approval_threshold += 1;
    Ok(())
}

/// Add a new guardian to the wallet
/// 1. Check if the account is in incubation or not
/// 2. If in incubation, add the guardian instantly
/// 3. If not in incubation, add the guardian into the pending guardian list
/// 4. Update the pending_guardian_approval_from vector
pub fn set_guardian_threshold(ctx: Context<AddGuardians>, threshold: u8) -> Result<()> {
    let wallet = &mut ctx.accounts.wallet;

    let guardians_num = wallet.approved_guardians.len() as u8;
    // Check if the threshold is bigger than the number of guardians
    invariant!(
        guardians_num >= threshold && threshold > 0,
        Errors::InvalidThreshold
    );

    wallet.approval_threshold = threshold;

    msg!("Set the guardian threshold");
    Ok(())
}

/// Add a given pubkey to the trusted pubkey list
/// Check if the wallet is in incubation mode
/// Check if the wallet is in the pubkey history
/// If any of the above condition passes, add the pubkey to the trusted list
/// Else throw an error
pub fn add_new_trusted_pubkey(ctx: Context<Verified>, pubkey: Pubkey) -> Result<()> {
    let wallet = &mut ctx.accounts.wallet;
    let wallet_clone = wallet.clone();

    // Check if the pubkey requested is already trusted
    invariant!(
        utils::get_key_index(wallet_clone.trusted_pubkeys.clone(), pubkey).is_none(),
        Errors::TrustedPubkeyAlreadyTrusted
    );

    let is_in_incubation = wallet.check_incubation();
    let trusted_pubkeys = &mut wallet.trusted_pubkeys;

    // check if the app is in the incubation period
    // if yes then add the pubkey to the list blindly
    if is_in_incubation {
        trusted_pubkeys.push(pubkey);
        msg!("wallet added to trusted pubkey list");
        return Ok(());
    }

    let index = utils::get_key_index(wallet_clone.pubkey_history.clone(), pubkey);
    invariant!(index.is_some(), Errors::TrustedPubkeyNoTransactions);

    // The wallet is in the transaction history
    trusted_pubkeys.push(pubkey);

    Ok(())
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
