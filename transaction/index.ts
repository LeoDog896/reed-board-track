import type { Storage } from "@plasmohq/storage";
import { z } from 'zod';
import equal from 'deep-equal';

export const transactionSchema = z.object({
    date: z.coerce.date(),
    id: z.number(),
    location: z.string(),
    plan: z.string(),
    amount: z.number()
});

// where { [id: number]: Transaction }
export const transactionRecordSchema = z.record(z.number(), transactionSchema);

export type Transaction = z.infer<typeof transactionSchema>;
export type TransactionRecord = z.infer<typeof transactionRecordSchema>

export const transactionKey = "point-transactions";

export function getTransactions(storage: Storage): TransactionRecord {
    return transactionRecordSchema.parse(storage.get(transactionKey));
}

interface TransactionUpdate {
    old?: Transaction,
    new: Transaction,
    updated: boolean
}

export function storeTransactions(storage: Storage, transactions: Transaction[]) {
    const currentTransactions = getTransactions(storage);

    const updatedTransactions: Map<number, TransactionUpdate> = new Map();

    for (const transaction of transactions) {
        if (currentTransactions[transaction.id]) {
            const oldTransaction = currentTransactions[transaction.id];

            updatedTransactions.set(transaction.id, {
                old: oldTransaction,
                new: transaction,
                updated: !equal(oldTransaction, transaction)
            });
            
            continue;
        }

        currentTransactions[transaction.id] = transaction;
    }

    storage.set(transactionKey, currentTransactions);
}
