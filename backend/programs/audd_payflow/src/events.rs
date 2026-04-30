use anchor_lang::prelude::*;

#[event]
pub struct InvoiceCreatedEvent {
    pub id: u64,
    pub merchant: Pubkey,
    pub amount: u64,
    pub mint: Pubkey,
    pub use_escrow: bool,
}

#[event]
pub struct InvoicePaidEvent {
    pub id: u64,
    pub merchant: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
    pub use_escrow: bool,
}

#[event]
pub struct EscrowReleasedEvent {
    pub id: u64,
    pub merchant: Pubkey,
    pub amount: u64,
}

#[event]
pub struct EscrowRefundedEvent {
    pub id: u64,
    pub merchant: Pubkey,
    pub payer: Pubkey,
    pub amount: u64,
}
