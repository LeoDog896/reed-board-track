import type { PlasmoCSConfig } from "plasmo"

import { storeTransactions, type Transaction } from "~transaction"

console.info("[Reed Board Tracker] Injected!")

export const config: PlasmoCSConfig = {
	matches: ["https://iris.reed.edu/board_commuter/*"]
}

const rows = [...document.querySelector("table#transactions tbody").children]

function parseMoney(money: string): number {
	return Number(
		[...money].filter((char) => ![",", "$", " ", "+"].includes(char)).join("")
	)
}

function parseDate(date: string): Date {
	const dateWithoutDay = date.substring(4)
	const nextSpaceIdx = dateWithoutDay.indexOf(" ")
	const dateWithoutTime = dateWithoutDay.substring(0, nextSpaceIdx)
	const creatingDate = new Date(dateWithoutTime)

	const time = dateWithoutDay.substring(nextSpaceIdx + 1)
	const timeWithoutMeridem = time.slice(0, -2)

	const [hour, minute, second] = timeWithoutMeridem
		.split(":")
		.map((part) => parseInt(part))

	const meridian = time.slice(-2)

	if (meridian == "PM" && hour != 12) {
		creatingDate.setHours(hour + 12, minute, second)
	} else if (meridian == "AM" && hour == 12) {
		creatingDate.setHours(0, minute, second)
	} else {
		creatingDate.setHours(hour, minute, second)
	}

	return creatingDate
}

function preprocessItem(item: HTMLTableRowElement): Transaction {
	const [date, id, location, plan, amount, total] = [...item.children].map(
		(child) => (child as HTMLElement).innerText
	)

	return {
		date: parseDate(date),
		id: parseInt(id),
		location,
		plan,
		amount: parseMoney(amount),
		total: parseMoney(total)
	}
}

const foundData: Transaction[] = []

for (const row of rows) {
	foundData.push(preprocessItem(row as HTMLTableRowElement))
}

storeTransactions(foundData)

console.debug("[Reed Board Tracker] Found Data:", foundData)
