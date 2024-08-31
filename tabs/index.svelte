<script lang="ts">
	import {
		CategoryScale,
		Chart,
		Filler,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		TimeScale
	} from "chart.js"
	import dayjs from "dayjs"
	import { onMount } from "svelte"
    import '../style.css'

	import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"

	import {
		getTransactions,
		watchTransactions,
		type Transaction,
		type TransactionRecord
	} from "~transaction"

	let transactions: TransactionRecord = {}
	watchTransactions((newTransactions) => {
		transactions = newTransactions
	})

	let chart: HTMLCanvasElement
	let chartInstance: Chart | undefined

	onMount(async () => {
		transactions = await getTransactions()

		Chart.register(
			LineController,
			CategoryScale,
			LinearScale,
			TimeScale,
			PointElement,
			LineElement,
			Filler
		)

		chartInstance = new Chart(chart, {
			type: "line",
			data: {
				datasets: [
					{
						label: "Transactions",
						data: meaningfulTransactions.map((x) => ({
							x: x.date.getTime(),
							y: x.total
						})),
						fill: true,
						tension: 0.1
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					xAxes: {
						type: "time",
						time: {
							unit: "day"
						}
					},
					y: {
						type: "linear",
						min: 0
					}
				}
			}
		})
	})

	$: if (meaningfulTransactions && chartInstance) {
		chartInstance.data.datasets[0].data = meaningfulTransactions.map((x) => ({
			x: x.date.getTime(),
			y: x.total
		}))
		chartInstance.update()
	}

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

	function averageDailyTransaction(transactions: Transaction[]) {
		if (transactions.length === 0) return 0

		let total = 0
		let chunkCount = 1
		let lastDay = dayjs(transactions[0].date)
		for (const transaction of transactions) {
			total += transaction.amount
			if (!lastDay.isSame(transaction.date, "day")) {
				chunkCount++
			}

			lastDay = dayjs(transaction.date)
		}

		return total / chunkCount
	}

	$: meaningfulTransactions = grabTransactionsAfter(
		sortedTransactions,
		dayjs().subtract(4, "months").toDate()
	).filter((transaction) => transaction.amount < 0)

	$: meaningfulTransactionsMinusToday = grabTransactionsBefore(
		meaningfulTransactions,
		dayjs().set('hour', 0).set('minute', 0).set('second', 0).toDate()
	)

	let dayCount = 120;
</script>

<header>
    <h1>Reed Board Point Tracker</h1>
</header>

<main>
    <p>
        Track your Reed Board Points
        (<a href="https://iris.reed.edu/board_commuter">IRIS link</a>)
        and see if you can or need to change your board plan
        (<a href="https://www.reed.edu/campus-life/housing-dining/dining-food-services/meal-plan.html">Meal Plan Cost</a>).
    </p>

    <h2>Overview</h2>

    <ul>
        <li>Transactions: {unmappedTransactions.length}</li>
        {#if meaningfulTransactions.length > 0}
            <li>
                Average daily spending in the past 4 months:
                {formatMoney(averageDailyTransaction(meaningfulTransactionsMinusToday))}
            </li>
            <li>
                Predicted <input type="number" placeholder="days" bind:value={dayCount} /> day spending:
                {formatMoney(averageDailyTransaction(meaningfulTransactionsMinusToday) * dayCount)}
				(<a href="https://www.reed.edu/academic-calendar/">See Academic Calendar</a>)
            </li>
        {/if}
    </ul>

    <h2>Transactions</h2>

    <div class="canvasContainer">
        <canvas bind:this={chart}></canvas>
    </div>

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
</main>

<style lang="scss">
	.canvasContainer {
		max-width: 500px;
	}

    header {
        background-color: var(--primary);

		h1 {
			margin: 0;
			padding: 1rem;
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

			padding: 0 0.5rem;
		}
	}
</style>
