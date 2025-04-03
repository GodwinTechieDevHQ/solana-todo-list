'use client'

import { getTodoProgram, getTodoProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

interface CreateEntryArgs {
  title: string;
  description: string;
  owner:PublicKey;
}

export function useTodoProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getTodoProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getTodoProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['todo', 'all', { cluster }],
    queryFn: () => program.account.todoEntryState.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const createEntry = useMutation<string, Error, CreateEntryArgs>({
    mutationKey: ['todoEntry', 'create', { cluster }],
    mutationFn: async ({ title, description, owner }) => {
      return program.methods.createTodo(title, description).rpc();
    },
    onSuccess: (signature) => {
      transactionToast(signature);
      accounts.refetch();
    },
    onError: (error) => {
      toast.error(`Error creating entry: ${error.message}`);
    },
  });

  return {
    program,
    accounts,
    getProgramAccount,
    createEntry,
    programId
  };
}


export function useTodoProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useTodoProgram()

  const accountQuery = useQuery({
    queryKey: ['todo', 'fetch', { cluster, account }],
    queryFn: () => program.account.todoEntryState.fetch(account),
  });

  const updateEntry = useMutation<string, Error, CreateEntryArgs>  ({
  mutationKey: ['todoEntry', 'update', { cluster }],
  mutationFn: async ({ title, description }) => {
    return program.methods.updateTodo(title, description).rpc();
  },
  onSuccess: (signature) => {
    transactionToast(signature);
    accounts.refetch();
  },
  onError: (error) => {
    toast.error(`Error updating entry: ${error.message}`);
  },
});

const deleteEntry = useMutation({
  mutationKey: ['todoEntry', 'delete', { cluster }],
  mutationFn: (title: string) => {
    return program.methods.deleteTodo(title).rpc();
  },
  onSuccess: (signature) => {
    transactionToast(signature);
    accounts.refetch();
  },
});

return {
  accountQuery,
  updateEntry,
  deleteEntry,
};
}
