import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair } from '@solana/web3.js'
import { Todo } from '../target/types/todo'

describe('todo', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env()
  anchor.setProvider(provider)
  const payer = provider.wallet as anchor.Wallet

  const program = anchor.workspace.Todo as Program<Todo>

  const todoKeypair = Keypair.generate()

  it('Initialize Todo', async () => {
    await program.methods
      .initialize()
      .accounts({
        todo: todoKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([todoKeypair])
      .rpc()

    const currentCount = await program.account.todo.fetch(todoKeypair.publicKey)

    expect(currentCount.count).toEqual(0)
  })

  it('Increment Todo', async () => {
    await program.methods.increment().accounts({ todo: todoKeypair.publicKey }).rpc()

    const currentCount = await program.account.todo.fetch(todoKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Increment Todo Again', async () => {
    await program.methods.increment().accounts({ todo: todoKeypair.publicKey }).rpc()

    const currentCount = await program.account.todo.fetch(todoKeypair.publicKey)

    expect(currentCount.count).toEqual(2)
  })

  it('Decrement Todo', async () => {
    await program.methods.decrement().accounts({ todo: todoKeypair.publicKey }).rpc()

    const currentCount = await program.account.todo.fetch(todoKeypair.publicKey)

    expect(currentCount.count).toEqual(1)
  })

  it('Set todo value', async () => {
    await program.methods.set(42).accounts({ todo: todoKeypair.publicKey }).rpc()

    const currentCount = await program.account.todo.fetch(todoKeypair.publicKey)

    expect(currentCount.count).toEqual(42)
  })

  it('Set close the todo account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        todo: todoKeypair.publicKey,
      })
      .rpc()

    // The account should no longer exist, returning null.
    const userAccount = await program.account.todo.fetchNullable(todoKeypair.publicKey)
    expect(userAccount).toBeNull()
  })
})
