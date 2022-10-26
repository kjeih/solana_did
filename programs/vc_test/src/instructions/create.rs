use anchor_lang::prelude::*;
use crate::instructions::util::*;
use crate::util::*;

#[derive(Accounts)]
pub struct Create<'info> {
    /// The program for the DID
    pub did_program: Program<'info, SolDID>,

    /// The DID on the Cryptid instance
    /// CHECK: DID Account can be generative or not
    pub did: UncheckedAccount<'info>,

    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

pub fn verify(ctx: Context<Create>, did_account_bump: u8) -> Result<()> {
    let controlling_did_accounts = ctx.remaining_accounts.iter().collect::<Vec<&AccountInfo>>();

    verify_keys(
        &ctx.accounts.did,
        Some(did_account_bump),
        ctx.accounts.authority.to_account_info().key,
        controlling_did_accounts,
    )?;

    Ok(())
}