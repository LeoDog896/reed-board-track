<script lang="ts">
	import { onMount } from "svelte"
    import dayjs from 'dayjs';
    import { Chart, TimeScale, CategoryScale, LinearScale, LineController, PointElement, LineElement, Filler }  from 'chart.js';
    import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';

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

    let chart: HTMLCanvasElement;
    let chartInstance: Chart | undefined

	onMount(async () => {
		transactions = await getTransactions();

        Chart.register(LineController, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Filler);

        chartInstance = new Chart(chart, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Transactions',
                    data: meaningfulTransactions.map(x => ({
                        x: x.date.getTime(),
                        y: x.total
                    })),
                    fill: true,
                    tension: 0.1
                }],
            },
            options: {
                responsive: true,
                scales: {
                    xAxes: {
                        type: 'time',
                        time: {
                            unit: 'day'
                        }
                    },
                    y: {
                        type: 'linear',
                        min: 0
                    }
                }
            }
        });
	});

    $: if (meaningfulTransactions && chartInstance) {
        chartInstance.data.datasets[0].data = meaningfulTransactions.map(x => ({
            x: x.date.getTime(),
            y: x.total
        }));
        chartInstance.update()
    }

    function formatMoney(money: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(money)
    }

    let unmappedTransactions: Transaction[] = []
    $: unmappedTransactions = Object.values(transactions);

    let sortedTransactions: Transaction[] = []
    $: sortedTransactions = unmappedTransactions.sort((b, a) => a.date.getTime() - b.date.getTime())

    function grabTransactionsAfter(transactions: Transaction[], date: Date) {
        const idx = transactions.findIndex((item) => item.date.getTime() < date.getTime());
        return idx === -1 ? transactions : transactions.slice(0, idx)
    }

    function averageDailyTransaction(transactions: Transaction[]) {
        if (transactions.length === 0) return 0;
        
        let total = 0;
        let chunkCount = 1;
        let lastDay = dayjs(transactions[0].date);
        for (const transaction of transactions) {
            total += transaction.amount;
            if (!lastDay.isSame(transaction.date, 'day')) {
                chunkCount++;
            }

            lastDay = dayjs(transaction.date);
        }

        return total / chunkCount;
    }

    $: meaningfulTransactions = grabTransactionsAfter(sortedTransactions, dayjs().subtract(4, 'months').toDate())
        .filter(transaction => transaction.amount < 0);

</script>

<h1>Reed Board Point Tracker</h1>

<h2>Overview</h2>

<ul>
    <li>Transactions: {unmappedTransactions.length}</li>
    {#if meaningfulTransactions.length > 0}
        <li>
            Average daily spending in the past 4 months:
            {formatMoney(averageDailyTransaction(meaningfulTransactions))}
        </li>
        <li>
            Predicted four-month spending:
            {formatMoney(averageDailyTransaction(meaningfulTransactions) * 4 * 30)}
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
                <th>{dayjs(transaction.date).format('YYYY/MM/DD')}</th>
                <th>{dayjs(transaction.date).format('hh:mm:ssA')}</th>
                <th>{transaction.id}</th>
                <th>{transaction.location}</th>
                <th>{transaction.plan}</th>
                <th>{formatMoney(transaction.amount)}</th>
                <th>{formatMoney(transaction.total)}</th>
            </tr>
        {/each}
    </tbody>
</table>

<style>
    .canvasContainer {
        max-width: 500px;
    }
</style>
