use anchor_lang::prelude::*;
use crate::error::VCTestError;

pub fn verify_keys<'info1, 'info2>(
    did: &AccountInfo<'info1>,
    did_account_bump: Option<u8>,
    signer: &Pubkey,
    controlling_did_accounts: Vec<&AccountInfo<'info2>>,
) -> Result<()> {
    let controlling_did_accounts = controlling_did_accounts
        .into_iter()
        .cloned()
        .collect::<Vec<_>>();
    let signer_is_authority = sol_did::integrations::is_authority(
        did,
        did_account_bump,
        controlling_did_accounts.as_slice(),
        &signer.to_bytes(),
        Some(&[sol_did::state::VerificationMethodType::Ed25519VerificationKey2018]),
        None,
    )
        .map_err(|error| -> VCTestError {
            msg!("Error executing is_authority: {}", error);
            VCTestError::KeyMustBeSigner
        })?;
    if !signer_is_authority {
        msg!("Signer is not an authority on the DID");
        return err!(VCTestError::KeyMustBeSigner);
    }
    msg!("Signer is an authority on the DID");
    Ok(())
}