'use client'

import { PublicKey } from '@solana/web3.js';
import { useTodoProgram, useTodoProgramAccount } from './todo-data-access';
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

export function TodoCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const { createEntry } = useTodoProgram();
  const { publicKey } = useWallet();

  const isFormValid = title.trim() !== '' && description.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid) {
      createEntry.mutateAsync({ title, description, owner: publicKey });
      setTitle('');
      setDescription('');
    }
  };

  if (!publicKey) {
    return <p className="text-center text-red-500">Connect Your Wallet.</p>;
  }

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md max-w-md mx-auto">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value.slice(0, 20))}
        placeholder="Todo Title"
        className="input input-bordered w-full mb-2 bg-white text-gray-800 placeholder-gray-400"
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value.slice(0, 50))}
        className="textarea textarea-bordered w-full mb-2 bg-white text-gray-800 placeholder-gray-400"
      />
      <button
        onClick={handleSubmit}
        disabled={createEntry.isPending || !isFormValid}
        className="btn btn-sm w-full bg-blue-500 hover:bg-blue-600 text-white"
      >
        {createEntry.isPending ? 'Adding...' : 'Add Todo'}
      </button>
    </div>
  );
}

export function TodoList() {
  const { accounts, getProgramAccount } = useTodoProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg mx-auto block"></span>;
  }
  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>Program account not found. Check deployment and cluster.</span>
      </div>
    );
  }
  return (
    <div className="space-y-4 mt-6">
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg mx-auto block"></span>
      ) : accounts.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2">
          {accounts.data.map((account) => (
            <TodoCard key={account.publicKey.toString()} account={account.publicKey} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          <h2 className="text-xl font-semibold">No Todos Yet</h2>
          <p>Add a todo above to start.</p>
        </div>
      )}
    </div>
  );
}

function TodoCard({ account }: { account: PublicKey }) {
  const { accountQuery, updateEntry, deleteEntry } = useTodoProgramAccount({ account });
  const { publicKey } = useWallet();

  const [description, setDescription] = useState('');
  const title = accountQuery.data?.title;

  const isFormValid = description.trim() !== '';

  const handleSubmit = () => {
    if (publicKey && isFormValid && title) {
      updateEntry.mutateAsync({ title, description, owner: publicKey });
      setDescription('');
    }
  };

  if (!publicKey) {
    return <p className="text-center text-red-500">Connect Your Wallet.</p>;
  }

  return accountQuery.isLoading ? (
    <span className="loading loading-spinner loading-lg mx-auto block"></span>
  ) : (
    <div className="card bg-white shadow-lg rounded-lg border border-gray-200">
      <div className="card-body p-4">
        <h2
          className="text-xl font-bold text-gray-800 cursor-pointer"
          onClick={() => accountQuery.refetch()}
        >
          {accountQuery.data?.title}
        </h2>
        <p className="text-gray-600">{accountQuery.data?.description}</p>
        <div className="space-y-2 mt-2">
          <textarea
            placeholder="Update description"
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 50))}
            className="textarea textarea-bordered w-full bg-gray-50 text-gray-800 placeholder-gray-400"
          />
          <div className="flex gap-2 justify-between">
            <button
              onClick={handleSubmit}
              disabled={updateEntry.isPending || !isFormValid}
              className="btn btn-sm flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {updateEntry.isPending ? 'Updating...' : 'Update'}
            </button>
            <button
              onClick={() => {
                const title = accountQuery.data?.title;
                if (title && window.confirm('Delete this todo?')) {
                  deleteEntry.mutateAsync(title);
                }
              }}
              disabled={deleteEntry.isPending}
              className="btn btn-sm flex-1 bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteEntry.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}