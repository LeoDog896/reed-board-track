<script lang="ts">
	import { onMount } from "svelte"

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
	})

	$: transactionCount = Object.values(transactions).length
</script>

<div class="container">
	<h2 class="text-center">Reed Board Tracker</h2>

	<p>
		Go to the <a href="https://iris.reed.edu/board_commuter"
			>board tracking page</a> to update data.
	</p>

	<p>
		To get a better view of the entire panel, view the <a
			href="/tabs/index.html"
			target="_blank">Reed Board Track Homepage</a
		>.
	</p>

	Loaded&nbsp;<span class="highlight">{transactionCount}</span>
	transaction{transactionCount == 1 ? "" : "s"}!
</div>

<style>
	.container {
		min-width: 470px;
	}

	.text-center {
		text-align: center;
	}
</style>
