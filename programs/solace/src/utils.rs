use anchor_lang::prelude::*;

use crate::*;

/// Logic to check if the owner can be updated or not
pub fn can_update_owner(wallet: &Wallet, recovery: &RecoveryAttempt) -> Result<bool> {
    let threshold = wallet.recovery_threshold;
    let approvers = recovery.approvals.clone();

    let approval_count = approvers.iter().filter(|&&x| x).count();

    if approval_count >= threshold as usize {
        Ok(true)
    } else {
        Ok(false)
    }
}

/// Get the index of any given variable in a vector
pub fn get_key_index<T: Eq>(keys: Vec<T>, key_to_find: T) -> Option<usize> {
    keys.into_iter().position(|x| x == key_to_find)
}
