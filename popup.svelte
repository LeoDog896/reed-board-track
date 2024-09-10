<script lang="ts">
	import { onMount } from "svelte"

	import "@fontsource-variable/dm-sans"
	import "./style.css"

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

<header>
	<h1 class="text-center">Reed Board Tracker</h1>
</header>

<main>
	<p>
		Go to the <a href="https://iris.reed.edu/board_commuter" target="_blank"
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
</main>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
	}

	header {
		background-color: var(--primary);
	}

	header h1 {
		color: white;
		margin: 0;
		padding: 1rem;
	}

	main {
		min-width: 470px;
		margin: 1rem;
	}

	.text-center {
		text-align: center;
	}

	.highlight {
		color: var(--primary);
	}
</style>
