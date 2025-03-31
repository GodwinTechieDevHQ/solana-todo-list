#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]


use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod todo {
    use super::*;

  pub fn create_todo(ctx: Context<CreateTodo>, title: String, description: String) -> Result<()> {
    
  }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateTodo<'info> {
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    space = 8 + Todo::INIT_SPACE,
    payer = owner,
  )]
  pub todo: Account<'info, Todo>,


  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Todo {
    pub owner: Pubkey,
    pub id: u64,
    #[max_len(20)]
    pub title: String,
    #[max_len(50)]
    pub description: String,
    pub completed: bool,
    pub created_at: i64,
}