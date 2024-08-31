import type { PlasmoCSConfig } from "plasmo"

import { storeTransactions, type Transaction } from "~transaction"

export const config: PlasmoCSConfig = {
	matches: ["https://iris.reed.edu/board_commuter/*"],
}

const rows = [...document.querySelector("table#transactions tbody").children]

function parseMoney(money: string): number {
	return Number(
		[...money].filter((char) => ![",", "$", " "].includes(char)).join("")
	)
}

function parseDate(date: string): Date {
	const dateWithoutDay = date.substring(4);
	const nextSpaceIdx = dateWithoutDay.indexOf(" ");
	const dateWithoutTime = dateWithoutDay.substring(0, nextSpaceIdx);
	const creatingDate = new Date(dateWithoutTime);

	const time = dateWithoutDay.substring(nextSpaceIdx + 1);
	const timeWithoutMeridem = time.slice(0, -2);

	const [hour, minute, second] = timeWithoutMeridem.split(":").map(part => parseInt(part))

	if (time.slice(-2) == "PM") {
		creatingDate.setHours(hour + 12, minute, second);
	} else {
		creatingDate.setHours(hour, minute, second);
	}
	
	return creatingDate;
}

function preprocessItem(item: HTMLTableRowElement): Transaction {
	const children = [...item.children].map(child => (child as HTMLElement).innerText);

	return {
		date: parseDate(
			children[0]
		),
		id: parseInt(children[1]),
		location: children[2],
		plan: children[3],
		amount: parseMoney(children[4].substring("-".length).trim()),
		total: parseMoney(children[5])
	}
}

const foundData: Transaction[] = []

for (const row of rows) {
	foundData.push(preprocessItem(row as HTMLTableRowElement))
}

storeTransactions(foundData);
