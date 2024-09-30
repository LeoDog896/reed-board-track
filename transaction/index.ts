import equal from "deep-equal"
import { compress, decompress } from "lz-string"
import { z } from "zod"
import { Big } from 'npm:big.js'

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
export const transactionStorageVersionValue = "3"

function parseJSON(data: unknown) {
	const result = transactionRecordSchema.safeParse(data)

	if (result.success) {
		return result.data
	} else {
		console.warn(result.error)
		return {}
	}
}

function toBinVersion3(record: TransactionRecord): string {
	return Object.values(record).reduce<string[]>((arr, data, i) => {
		const foundLocation = arr.findIndex(value => JSON.parse(value)[3] == data.location);
		const foundPlan = arr.findIndex(value => JSON.parse(value)[4] == data.plan);

		return [...arr, JSON.stringify([
			data.amount,
			data.date.getTime() / 1000,
			i == 0 ? data.id : data.id - arr.map(elem => JSON.parse(elem)[2]).reduce((a, b) => a + b, 0),
			foundLocation !== -1 ? foundLocation : data.location,
			foundPlan !== -1 ? foundPlan : data.plan,
			i == 0 ? data.total : arr.reduce<Big>((acc, elem) => acc.minus(new Big(JSON.parse(elem)[5])), new Big(data.total)).toNumber()
		])];
	}, []).join("\n")
}

function toJSONVersion3(str: string): TransactionRecord {
	const data = str.split("\n").map(record => {
		const [amount, date, id, location, plan, total] = JSON.parse(record);

		return {
			amount,
			date: new Date(date * 1000),
			id,
			location,
			plan,
			total
		}
	});

	for (let i = 1; i < data.length; i++) {
		const oldData = data[i - 1];
		const newData = data[i];
		newData.id += oldData.id;
		newData.total = new Big(data[i].total).plus(oldData.total).toNumber()

		if (typeof data[i].location === 'number') {
			newData.location = data[newData.location].location
		}

		if (typeof data[i].plan === 'number') {
			newData.plan = data[newData.plan].plan
		}
	}

	return Object.fromEntries(data.map(d => [d.id, d]))
}

export async function getTransactions(): Promise<TransactionRecord> {
	const storageVersion = await storage.get(transactionStorageVersionKey)
	const storageData = await storage.get(transactionKey)

	if (storageData === undefined) {
		return {}
	}

	if (storageVersion === "3") {
		return parseJSON(toJSONVersion3(decompress(await storage.get(transactionKey))))
	} else if (storageVersion === "2") {
		return parseJSON(JSON.parse(decompress(await storage.get(transactionKey))))
	} else {
		const data = parseJSON(await storage.get(transactionKey))
		await storeTransactions(Object.values(data))
		return parseJSON(data)
	}
}

export async function clearTransactions(): Promise<void> {
	await storage.remove(transactionStorageVersionKey)
	await storage.remove(transactionKey)
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
	console.log(toBinVersion3(currentTransactions))
	await storage.set(
		transactionKey,
		compress(toBinVersion3(currentTransactions))
	)

	return updatedTransactions
}
