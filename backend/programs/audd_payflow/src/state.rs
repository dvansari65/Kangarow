use anchor_lang::prelude::*;

#[account]
pub struct Invoice {
    pub id: u64,
    pub merchant: Pubkey,
    pub payer: Option<Pubkey>,
    pub amount: u64,
    pub mint: Pubkey,
    pub status: InvoiceStatus,
    pub use_escrow: bool,
    pub funded_at: i64,
    pub bump: u8,
}

impl Invoice {
    pub const LEN: usize = 8 + 8 + 32 + (1 + 32) + 8 + 32 + 1 + 1 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum InvoiceStatus {
    Pending,
    Funded,
    Paid,
    Cancelled,
}
