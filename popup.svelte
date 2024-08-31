<script lang="ts">
	import { onMount } from "svelte"

	import {
		getTransactions,
		watchTransactions,
		type TransactionRecord
	} from "~transaction"

	let transactions: TransactionRecord = {}
	watchTransactions((newTransactions) => {
		console.log(newTransactions)
		transactions = newTransactions
	})

	onMount(async () => {
		transactions = await getTransactions()
	})
</script>

<div class="container">
	<h2 class="text-center">Reed Board Tracker</h2>

	<p>
		Go to the <a href="https://iris.reed.edu/board_commuter"
			>board tracking page</a> to update data.
	</p>

	{Object.values(transactions).length}
</div>

<style>
	.container {
		min-width: 470px;
	}

	.text-center {
		text-align: center;
	}
</style>
