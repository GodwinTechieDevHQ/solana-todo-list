#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]


use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod todo {
    use super::*;

  pub fn create_todo(ctx: Context<CreateTodo>, title: String, description: String) -> Result<()> {
    let todo_entry: &mut Account<TodoEntryState> = &mut ctx.accounts.todo_entry;
    todo_entry.owner = ctx.accounts.owner.key();
    todo_entry.title = title;
    todo_entry.description = description;
    
    Ok(())
  }

  pub fn update_todo(ctx: Context<UpdateTodo>, _title: String, description: String) -> Result<()> {
    let todo_entry = &mut ctx.accounts.todo_entry;
    todo_entry.description = description;

    Ok(())
  }

  pub fn delete_todo(ctx; Context<DeleteTodo>, title: String) -> Result<()> {
    Ok(())
  }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateTodo<'info> {
  #[account(
    init,
    seeds = [title.as_bytes(), owner.key().as_ref()],
    bump,
    space = 8 + TodoEntryState::INIT_SPACE,
    payer = owner,
  )]
  pub todo_entry: Account<'info, TodoEntryState>,


  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateTodo<'info> {
  #[account(
     mut,
     seeds = [title.as_bytes(), owner.key.as_ref()],
     bump,
     realloc = 8 + TodoEntryState::INIT_SPACE,
     realloc::payer = owner,
     realloc::zero = true,
  )]
  pub todo_entry: Account<'info, TodoEntryState>,
  
  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteTodo <'info> {
  #[account(
    mut,
    seeds = [title.as_bytes(), owner.key.as_ref()],
    bump,
    close = owner,
  )]
  pub todo_entry: Account<'info, TodoEntryState>,
  
  #[account(mut)]
  pub owner: Signer<'info>,

  pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct TodoEntryState {
    pub owner: Pubkey,
    pub id: u64,
    #[max_len(20)]
    pub title: String,
    #[max_len(50)]
    pub description: String,
    pub completed: bool,
    pub created_at: i64,
}