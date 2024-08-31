<script lang="ts">
	import { onMount } from "svelte"
    import dayjs from 'dayjs';

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

	onMount(async () => {
		transactions = await getTransactions()
	});

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

        console.log(chunkCount)

        return total / chunkCount;
    }

    $: meaningfulTransactions = grabTransactionsAfter(sortedTransactions, dayjs().subtract(4, 'months').toDate())
        .filter(transaction => transaction.amount < 0)
</script>

<h1>Reed Board Point Tracker</h1>

<h2>Overview</h2>

<ul>
    <li>Transactions: {unmappedTransactions.length}</li>
    <li>Last Board Plan Payment:</li>
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
