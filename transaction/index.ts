import equal from "deep-equal"
import { compress, decompress } from "lz-string"
import { z } from "zod"

import { storage } from "~storage"

export const transactionSchema = z.object({
	date: z.coerce.date(),
	id: z.number(),
	location: z.string(),
	plan: z.string(),
	amount: z.number(),
	total: z.number()
})

// where { [id: number]: Transaction }
export const transactionRecordSchema = z.record(
	z.coerce.number(),
	transactionSchema
)

export type Transaction = z.infer<typeof transactionSchema>
export type TransactionRecord = z.infer<typeof transactionRecordSchema>

export const transactionKey = "point-transactions"

// no transaction version key is direct JSON
// "2" is lz-string compressed JSON
export const transactionStorageVersionKey = "point-transactions-version"
export const transactionStorageVersionValue = "2"

function parseJSON(data: unknown) {
	const result = transactionRecordSchema.safeParse(data)

	if (result.success) {
		return result.data
	} else {
		console.warn(result.error)
		return {}
	}
}

export async function getTransactions(): Promise<TransactionRecord> {
	const storageVersion = await storage.get(transactionStorageVersionKey)
	const storageData = await storage.get(transactionKey)

	if (storageData === undefined) {
		return {}
	}

	if (storageVersion === "2") {
		return parseJSON(JSON.parse(decompress(await storage.get(transactionKey))))
	} else {
		const data = parseJSON(await storage.get(transactionKey))
		await storeTransactions(Object.values(data))
		return parseJSON(data)
	}
}

export async function clearTransactions(): Promise<void> {
	await storage.set(transactionKey, {})
}

export async function watchTransactions(
	callback: (transactions: TransactionRecord) => void
) {
	storage.watch({
		[transactionKey]: (transactions) => callback(transactions.newValue)
	})
}

interface TransactionUpdate {
	old?: Transaction
	new: Transaction
	updated: boolean
}

export async function storeTransactions(
	transactions: Transaction[]
): Promise<TransactionUpdate[]> {
	const currentTransactions = await getTransactions()

	const updatedTransactions: TransactionUpdate[] = []

	for (const transaction of transactions) {
		if (currentTransactions[transaction.id]) {
			const oldTransaction = currentTransactions[transaction.id]

			updatedTransactions.push({
				old: oldTransaction,
				new: transaction,
				updated: !equal(oldTransaction, transaction)
			})

			continue
		}

		currentTransactions[transaction.id] = transaction
	}

	await storage.set(
		transactionStorageVersionKey,
		transactionStorageVersionValue
	)
	await storage.set(
		transactionKey,
		compress(JSON.stringify(currentTransactions))
	)
	console.log(compress(JSON.stringify(currentTransactions)))

	return updatedTransactions
}
