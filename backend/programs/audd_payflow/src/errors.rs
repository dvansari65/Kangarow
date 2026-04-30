use anchor_lang::prelude::*;

#[error_code]
pub enum PayflowError {
    #[msg("Invoice has an invalid status for this operation.")]
    InvalidStatus,
    #[msg("This invoice does not use escrow.")]
    NotEscrow,
    #[msg("You are not authorized to perform this action.")]
    Unauthorized,
    #[msg("The escrow expiry window has not elapsed yet.")]
    NotExpiredYet,
    #[msg("Refund is not available yet.")]
    RefundNotAvailableYet,
}
