pub mod instructions;
pub mod util;
pub mod error;

use instructions::*;

use anchor_lang::prelude::*;

declare_id!("CcEXpiUCnanHZAzZHDVE6ycnXjdsYD2Z7hQnBYmVfWHU");

#[program]
pub mod vc_test {
    use super::*;

    pub fn verify(
        ctx: Context<Create>,
        did_account_bump: u8,
    ) -> Result<()> {
        instructions::verify(ctx, did_account_bump)
    }
}
