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

/// Given a vector of bools and a threshold, the function validates if the threshold is met or not
pub fn is_action_approved(approvals: Vec<bool>, threshold: u8) -> bool {
    let approval_count = approvals.iter().filter(|&&x| x).count();

    if approval_count >= (threshold as usize) {
        true
    } else {
        false
    }
}
/// Get the index of any given variable in a vector
pub fn get_key_index<T: Eq>(keys: Vec<T>, key_to_find: T) -> Option<usize> {
    keys.into_iter().position(|x| x == key_to_find)
}

//
// /// Instruction.
// #[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, Default, PartialEq)]
// pub struct TXInstruction {
//     /// Pubkey of the instruction processor that executes this instruction
//     pub program_id: Pubkey,
//     /// Metadata for what accounts should be passed to the instruction processor
//     pub keys: Vec<TXAccountMeta>,
//     /// Opaque data passed to the instruction processor
//     pub data: Vec<u8>,
// }
//
// impl TXInstruction {
//     /// Space that a [TXInstruction] takes up.
//     pub fn space(&self) -> usize {
//         std::mem::size_of::<Pubkey>()
//             + (self.keys.len() as usize) * std::mem::size_of::<TXAccountMeta>()
//             + (self.data.len() as usize)
//     }
// }
//
// impl From<&TXInstruction> for anchor_lang::solana_program::instruction::Instruction {
//     fn from(tx: &TXInstruction) -> anchor_lang::solana_program::instruction::Instruction {
//         anchor_lang::solana_program::instruction::Instruction {
//             program_id: tx.program_id,
//             accounts: tx.keys.clone().into_iter().map(Into::into).collect(),
//             data: tx.data.clone(),
//         }
//     }
// }
//
// impl Display for TXInstruction {
//     fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
//         self.keys.iter().for_each(|k| {
//             f.write_fmt(format_args!("{}", k.pubkey.to_string()));
//         });
//         Ok(())
//     }
// }

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

/// Account metadata used to define [TXInstruction]s
#[derive(AnchorSerialize, AnchorDeserialize, Debug, PartialEq, Copy, Clone)]
pub struct TXAccountMeta {
    /// An account's public key
    pub pubkey: Pubkey,
    /// True if an Instruction requires a Transaction signature matching `pubkey`.
    pub is_signer: bool,
    /// True if the `pubkey` can be loaded as a read-write account.
    pub is_writable: bool,
}

impl From<TXAccountMeta> for anchor_lang::solana_program::instruction::AccountMeta {
    fn from(
        TXAccountMeta {
            pubkey,
            is_signer,
            is_writable,
        }: TXAccountMeta,
    ) -> anchor_lang::solana_program::instruction::AccountMeta {
        anchor_lang::solana_program::instruction::AccountMeta {
            pubkey,
            is_signer,
            is_writable,
        }
    }
}
