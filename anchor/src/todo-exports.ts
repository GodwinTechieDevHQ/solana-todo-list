// Here we export some useful types and functions for interacting with the Anchor program.
import { AnchorProvider, Program } from '@coral-xyz/anchor'
import { Cluster, PublicKey } from '@solana/web3.js'
import TodoIDL from '../target/idl/todo.json'
import type { Todo } from '../target/types/todo'

// Re-export the generated IDL and type
export { Todo, TodoIDL }

// The programId is imported from the program IDL.
export const TODO_PROGRAM_ID = new PublicKey(TodoIDL.address)

// This is a helper function to get the Todo Anchor program.
export function getTodoProgram(provider: AnchorProvider, address?: PublicKey) {
  return new Program({ ...TodoIDL, address: address ? address.toBase58() : TodoIDL.address } as Todo, provider)
}

// This is a helper function to get the program ID for the Todo program depending on the cluster.
export function getTodoProgramId(cluster: Cluster) {
  switch (cluster) {
    case 'devnet':
    case 'testnet':
      // This is the program ID for the Todo program on devnet and testnet.
      return new PublicKey('coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF')
    case 'mainnet-beta':
    default:
      return TODO_PROGRAM_ID
  }
}
