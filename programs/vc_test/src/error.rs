use anchor_lang::prelude::*;

#[error_code]
pub enum VCTestError {
    #[msg("Signer is not authorised to sign for this Creator account")]
    KeyMustBeSigner
}