use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

pub mod errors;
pub mod state;
pub mod events;

use errors::PayflowError;
use state::{Invoice, InvoiceStatus};
use events::*;

declare_id!("C59NN5CGFnvdXP5nTATKzZu6iJWvNYVX9NTELF4F1Tes");

#[program]
pub mod audd_payflow {
    use super::*;

    pub fn create_invoice(
        ctx: Context<CreateInvoice>,
        id: u64,
        amount: u64,
        use_escrow: bool,
    ) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        invoice.id = id;
        invoice.merchant = ctx.accounts.merchant.key();
        invoice.payer = None;
        invoice.amount = amount;
        invoice.mint = ctx.accounts.mint.key();
        invoice.status = InvoiceStatus::Pending;
        invoice.use_escrow = use_escrow;
        invoice.funded_at = 0;
        invoice.bump = ctx.bumps.invoice;
        emit!(InvoiceCreatedEvent {
            id,
            merchant: invoice.merchant,
            amount,
            mint: invoice.mint,
            use_escrow,
        });
        Ok(())
    }

    pub fn pay_invoice(ctx: Context<PayInvoice>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Pending, PayflowError::InvalidStatus);

        invoice.payer = Some(ctx.accounts.payer.key());

        let fee = invoice.amount.checked_mul(3).unwrap().checked_div(1000).unwrap();

        if invoice.use_escrow {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.payer_ata.to_account_info(),
                        to: ctx.accounts.vault.to_account_info(),
                        authority: ctx.accounts.payer.to_account_info(),
                    },
                ),
                invoice.amount,
            )?;
            invoice.status = InvoiceStatus::Funded;
            invoice.funded_at = Clock::get()?.unix_timestamp;
        } else {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.payer_ata.to_account_info(),
                        to: ctx.accounts.merchant_ata.to_account_info(),
                        authority: ctx.accounts.payer.to_account_info(),
                    },
                ),
                invoice.amount,
            )?;
            
            invoice.status = InvoiceStatus::Paid;
        }

        // Protocol Fee Transfer (0.3%)
        if fee > 0 {
            token::transfer(
                CpiContext::new(
                    ctx.accounts.token_program.to_account_info(),
                    Transfer {
                        from: ctx.accounts.payer_ata.to_account_info(),
                        to: ctx.accounts.treasury_ata.to_account_info(),
                        authority: ctx.accounts.payer.to_account_info(),
                    },
                ),
                fee,
            )?;
        }

        emit!(InvoicePaidEvent {
            id: invoice.id,
            merchant: invoice.merchant,
            payer: invoice.payer.unwrap(),
            amount: invoice.amount,
            use_escrow: invoice.use_escrow,
        });
        Ok(())
    }

    pub fn release_escrow(ctx: Context<ReleaseEscrow>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Funded, PayflowError::InvalidStatus);
        require!(invoice.use_escrow, PayflowError::NotEscrow);

        let authority_key = ctx.accounts.authority.key();
        let is_payer = invoice.payer.map_or(false, |p| p == authority_key);
        let is_merchant = authority_key == invoice.merchant;

        require!(is_payer || is_merchant, PayflowError::Unauthorized);

        if is_merchant && !is_payer {
            let now = Clock::get()?.unix_timestamp;
            // 7 days = 604800 seconds. Using checked_add for security.
            let expiry_time = invoice.funded_at.checked_add(604800).unwrap();
            require!(now > expiry_time, PayflowError::NotExpiredYet);
        }

        let merchant_key = invoice.merchant;
        let id_bytes = invoice.id.to_le_bytes();
        let bump = invoice.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"invoice",
            merchant_key.as_ref(),
            id_bytes.as_ref(),
            &[bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.merchant_ata.to_account_info(),
                    authority: invoice.to_account_info(),
                },
                signer_seeds,
            ),
            invoice.amount,
        )?;

        invoice.status = InvoiceStatus::Paid;
        emit!(EscrowReleasedEvent {
            id: invoice.id,
            merchant: invoice.merchant,
            amount: invoice.amount,
        });
        Ok(())
    }

    pub fn refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
        let invoice = &mut ctx.accounts.invoice;
        require!(invoice.status == InvoiceStatus::Funded, PayflowError::InvalidStatus);
        require!(invoice.use_escrow, PayflowError::NotEscrow);

        let authority_key = ctx.accounts.authority.key();
        let payer_key = invoice.payer.unwrap(); // Safe because status is Funded
        let is_payer = payer_key == authority_key;
        let is_merchant = authority_key == invoice.merchant;

        require!(is_payer || is_merchant, PayflowError::Unauthorized);

        if is_payer && !is_merchant {
            let now = Clock::get()?.unix_timestamp;
            // 30 days = 2592000 seconds. Using checked_add for security.
            let expiry_time = invoice.funded_at.checked_add(2592000).unwrap();
            require!(now > expiry_time, PayflowError::RefundNotAvailableYet);
        }

        let merchant_key = invoice.merchant;
        let id_bytes = invoice.id.to_le_bytes();
        let bump = invoice.bump;
        let signer_seeds: &[&[&[u8]]] = &[&[
            b"invoice",
            merchant_key.as_ref(),
            id_bytes.as_ref(),
            &[bump],
        ]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.payer_ata.to_account_info(),
                    authority: invoice.to_account_info(),
                },
                signer_seeds,
            ),
            invoice.amount,
        )?;

        invoice.status = InvoiceStatus::Cancelled;
        emit!(EscrowRefundedEvent {
            id: invoice.id,
            merchant: invoice.merchant,
            payer: invoice.payer.unwrap(),
            amount: invoice.amount,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct CreateInvoice<'info> {
    #[account(mut)]
    pub merchant: Signer<'info>,

    #[account(
        init,
        payer = merchant,
        space = Invoice::LEN,
        seeds = [b"invoice", merchant.key().as_ref(), id.to_le_bytes().as_ref()],
        bump
    )]
    pub invoice: Account<'info, Invoice>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = merchant,
        token::mint = mint,
        token::authority = invoice,
        seeds = [b"vault", invoice.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct PayInvoice<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut)]
    pub invoice: Account<'info, Invoice>,

    #[account(
        mut,
        token::mint = invoice.mint,
        token::authority = payer
    )]
    pub payer_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        token::mint = invoice.mint,
        token::authority = invoice.merchant
    )]
    pub merchant_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", invoice.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    /// The protocol treasury token account that collects the 0.3% fee.
    /// In a fully production app, you should add a constraint to verify this is your treasury.
    #[account(
        mut,
        token::mint = invoice.mint
    )]
    pub treasury_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReleaseEscrow<'info> {
    pub authority: Signer<'info>,

    #[account(mut)]
    pub invoice: Account<'info, Invoice>,

    #[account(
        mut,
        token::mint = invoice.mint,
        token::authority = invoice.merchant
    )]
    pub merchant_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", invoice.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RefundEscrow<'info> {
    pub authority: Signer<'info>,

    #[account(mut)]
    pub invoice: Account<'info, Invoice>,

    #[account(
        mut,
        constraint = payer_ata.mint == invoice.mint @ PayflowError::InvalidStatus,
        constraint = Some(payer_ata.owner) == invoice.payer @ PayflowError::Unauthorized
    )]
    pub payer_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"vault", invoice.key().as_ref()],
        bump
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
