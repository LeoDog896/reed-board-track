<script lang="ts">
	import dayjs, { type OpUnitType } from "dayjs"
	import { onMount } from "svelte"

	import "../style.css"

	import ChromeSVG from "bundle-text:../assets/chrome.svg"
	import FirefoxSVG from "bundle-text:../assets/firefox.svg"
	import GithubSVG from "bundle-text:../assets/github.svg"
	import download from "downloadjs"

	import TimeChart from "~components/TimeChart.svelte"
	import {
		getTransactions,
		watchTransactions,
		type Transaction,
		type TransactionRecord
	} from "~transaction"

	import ReedLogo from "../assets/reed-college-griffin-white.png"

	let transactions: TransactionRecord = {}
	watchTransactions((newTransactions) => {
		transactions = newTransactions
	})

	onMount(async () => {
		transactions = await getTransactions()
	})

	function formatMoney(money: number): string {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD"
		}).format(money)
	}

	let unmappedTransactions: Transaction[] = []
	$: unmappedTransactions = Object.values(transactions)

	let sortedTransactions: Transaction[] = []
	$: sortedTransactions = unmappedTransactions.sort(
		(b, a) => a.date.getTime() - b.date.getTime()
	)

	function grabTransactionsAfter(transactions: Transaction[], date: Date) {
		const idx = transactions.findIndex(
			(item) => item.date.getTime() < date.getTime()
		)
		return idx === -1 ? transactions : transactions.slice(0, idx)
	}

	function grabTransactionsBefore(transactions: Transaction[], date: Date) {
		const idx = transactions.findIndex(
			(item) => item.date.getTime() < date.getTime()
		)
		return idx === -1 ? transactions : transactions.slice(idx)
	}

	function averageTimeTransaction(
		transactions: Transaction[],
		unit: OpUnitType = "day"
	) {
		if (transactions.length === 0) return 0

		let total = 0
		let chunkCount = 1
		let lastDay = dayjs(transactions[0].date)
		for (const transaction of transactions) {
			total += transaction.amount
			if (!lastDay.isSame(transaction.date, unit)) {
				chunkCount++
			}

			lastDay = dayjs(transaction.date)
		}

		return total / chunkCount
	}

	function chunkedTransactions(
		transactions: Transaction[],
		unit: OpUnitType = "day"
	): Transaction[][] {
		if (transactions.length === 0) return []

		const chunks: Transaction[][] = []
		let currentChunk: Transaction[] = []
		let lastDay = dayjs(transactions[0].date)

		for (const transaction of transactions) {
			if (!lastDay.isSame(transaction.date, unit)) {
				chunks.push(currentChunk)
				currentChunk = []
			}

			currentChunk.push(transaction)
			lastDay = dayjs(transaction.date)
		}

		if (currentChunk.length !== 0) {
			chunks.push(currentChunk)
		}

		return chunks
	}

	$: meaningfulTransactions = grabTransactionsAfter(
		sortedTransactions,
		dayjs().subtract(4, "months").toDate()
	).filter((transaction) => transaction.amount < 0)

	$: meaningfulTransactionsMinusToday = grabTransactionsBefore(
		meaningfulTransactions,
		dayjs().set("hour", 0).set("minute", 0).set("second", 0).toDate()
	)

	let dayCount = 120

	let displayType = "total-chart"

	function escapeCSV(part: string): string {
		if (part.includes(",") || part.includes('"')) {
			return `"${part.replace('"', '""')}"`
		}

		return part
	}

	function exportTransactionsNDJSON(transactions: Transaction[]) {
		download(
			transactions.map((transaction) => JSON.stringify(transaction)).join("\n"),
			"data.ndjson",
			"application/x-ndjson"
		)
	}

	function exportTransactionsCSV(transactions: Transaction[]) {
		download(
			transactions
				.map(
					(transaction) =>
						`${transaction.id},${transaction.date.getTime()},${transaction.amount},${transaction.total},${escapeCSV(transaction.location)},${escapeCSV(transaction.plan)}`
				)
				.join("\n"),
			"data.csv",
			"appli"
		)
	}
</script>

<header>
	<div class="front">
		<img height="40px" src={ReedLogo} alt="Reed College Logo" />
		<h1>Reed Board Point Tracker</h1>
	</div>
	<div class="back">
		<a href="https://github.com/LeoDog896/reed-board-track"
			>{@html GithubSVG}</a>
		<a href="https://addons.mozilla.org/en-US/firefox/">{@html FirefoxSVG}</a>
		<a href="https://chromewebstore.google.com/">{@html ChromeSVG}</a>
	</div>
</header>

<main>
	<p>
		Track your Reed Board Points (update by going to <a
			href="https://iris.reed.edu/board_commuter">Board Communter (IRIS)</a
		>) and see if you can or need to change your board plan (<a
			href="https://www.reed.edu/campus-life/housing-dining/dining-food-services/meal-plan.html"
			>Meal Plan Cost</a
		>).
	</p>

	<h2>Overview</h2>

	<ul>
		<li>Transactions: {unmappedTransactions.length}</li>
		{#if meaningfulTransactions.length > 0}
			<li>
				Average daily spending in the past 4 months:
				{formatMoney(averageTimeTransaction(meaningfulTransactionsMinusToday))}
			</li>
			<li>
				Predicted <input
					type="number"
					placeholder="days"
					bind:value={dayCount} />
				day spending:
				{formatMoney(
					averageTimeTransaction(meaningfulTransactionsMinusToday) * dayCount
				)}
				(<a href="https://www.reed.edu/academic-calendar/"
					>See Academic Calendar</a
				>) (<a
					href="https://www.reed.edu/campus-life/housing-dining/dining-food-services/meal-plan.html"
					>See Meal Plan Cost</a
				>)
			</li>
		{/if}
	</ul>

	<h2>Transactions</h2>

	<button on:click={() => exportTransactionsNDJSON(unmappedTransactions)}
		>Export Transactions as <a href="https://github.com/ndjson/ndjson-spec"
			>ND-json</a
		></button>
	<button on:click={() => exportTransactionsCSV(unmappedTransactions)}
		>Export Transactions as CSV</button>

	<!-- TODO: before/after filtering -->

	<p>Select Data Display Type</p>

	<select bind:value={displayType}>
		<option value="total-chart">Total Chart</option>
		<option value="daily-chart">Daily Chart</option>
		<!-- TODO: <option value="average-eating-time">Average Eating Times</option> -->
		<option value="raw-transaction-table">Transactions Table</option>
	</select>

	{#if displayType == "total-chart"}
		<div class="canvasContainer">
			<TimeChart
				data={meaningfulTransactions.map((transaction) => ({
					x: transaction.date.getTime(),
					y: transaction.total
				}))} />
		</div>
	{:else if displayType == "daily-chart"}
		<div class="canvasContainer">
			<TimeChart
				data={chunkedTransactions(meaningfulTransactions).map(
					(transactions) => {
						const day = transactions[0].date.setHours(0, 0, 0)

						return {
							x: day,
							y: -transactions
								.map((transaction) => transaction.amount)
								.reduce((a, b) => a + b, 0)
						}
					}
				)} />
		</div>
	{:else if displayType == "raw-transaction-table"}
		<table>
			<thead>
				<tr>
					<th>Date</th>
					<th>Time</th>
					<th>ID</th>
					<th>Location</th>
					<th>Plan</th>
					<th>Amount</th>
					<th>Total</th>
				</tr>
			</thead>
			<tbody>
				{#each sortedTransactions as transaction}
					<tr>
						<th>{dayjs(transaction.date).format("YYYY/MM/DD")}</th>
						<th>{dayjs(transaction.date).format("hh:mm:ssA")}</th>
						<th>{transaction.id}</th>
						<th>{transaction.location}</th>
						<th>{transaction.plan}</th>
						<th>{formatMoney(transaction.amount)}</th>
						<th>{formatMoney(transaction.total)}</th>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p>Unsupported view mode: {displayType}</p>
	{/if}
</main>

<style lang="scss">
	.canvasContainer {
		max-width: 500px;
	}

	header {
		background-color: var(--primary);
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;

		.front {
			display: flex;
			align-items: center;
		}

		.back {
			& {
				display: flex;
				gap: 1rem;
			}

			a {
				color: white;
			}
		}

		img {
			margin-right: 1rem;
		}

		h1 {
			margin: 0;
			color: white;
		}
	}

	main {
		margin: 1rem;
	}

	:global(html, body) {
		padding: 0;
		margin: 0;
		width: 100%;
		height: 100%;
	}

	table {
		border-collapse: collapse;
	}

	thead {
		background-color: var(--primary);
		color: white;

		tr th {
			margin: 0;
		}
	}

	tbody {
		tr th {
			&:not(:last-child) {
				border-right: 1px solid black;
			}

			& {
				padding: 0 0.5rem;
			}
		}
	}

	select {
		margin-bottom: 0.5rem;
	}
</style>
