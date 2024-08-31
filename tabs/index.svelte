<script lang="ts">
	import { onMount } from "svelte"
    import dayjs from 'dayjs';

	import {
		getTransactions,
		watchTransactions,
		type TransactionRecord
	} from "~transaction"

	let transactions: TransactionRecord = {}
	watchTransactions((newTransactions) => {
		transactions = newTransactions
	})

	onMount(async () => {
		transactions = await getTransactions()
	});

    function formatMoney(money: string): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(money)
    }

    $: sortedTransactions = Object.values(transactions).sort((a, b) => a.date.getTime() - b.date.getTime())
</script>

<h1>Reed Board Point Tracker</h1>

<h2>Overview</h2>

<ul>
    <li>Transactions: {Object.values(transactions).length}</li>
    <li>Last Board Plan Payment:</li>
    <li>Average spending past board plan:</li>
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
