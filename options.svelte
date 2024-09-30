<script lang="ts">
	import { onMount } from "svelte"
	import Modal from "~components/Modal.svelte"
	import { storage } from "~storage"
	import { clearTransactions, watchTransactions, type TransactionRecord, getTransactions, transactionStorageVersionKey, transactionKey } from "~transaction"

	let removalModal = false

	let transactions: TransactionRecord = {}
	watchTransactions((newTransactions) => {
		transactions = newTransactions
	})

	onMount(async () => {
		transactions = await getTransactions()
	})

	async function logStoredData() {
		const storageVersion = await storage.get(transactionStorageVersionKey)
		console.log("Storage Version:", storageVersion)
		const storageData = await storage.get(transactionKey)
		console.log("Storage Data:", storageData)

		console.log("Parsed transactions:", transactions)
	}
</script>

<h1>Options for Reed Board Tracker</h1>

<h2>Debugging</h2>

<button on:click={logStoredData}>Log stored data</button>

<h2>Danger</h2>

<details>
	<summary>Click for data management.</summary>

	<button on:click={() => (removalModal = true)}>Delete All Data</button>
</details>

{#if removalModal}
	<Modal on:close={() => (removalModal = false)}>
		<h2>Remove All Data</h2>
		<p>Are you sure you want to remove all data? You should export it first.</p>
		<button
			on:click={() => {
				clearTransactions()
				removalModal = false
			}}>Yes</button>
		<button on:click={() => (removalModal = false)}>No</button>
	</Modal>
{/if}
