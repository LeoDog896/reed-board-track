<script lang="ts">
  import Modal from "~components/Modal.svelte"
  import { clearTransactions } from "~transaction"

    let removalModal = false;
</script>

<h1>Options for Reed Board Tracker</h1>

<h2>Danger</h2>

<details>
    <summary>Click for data management.</summary>

    <button on:click={() => removalModal = true}>Delete All Data</button>
</details>

{#if removalModal}
    <Modal on:close={() => removalModal = false}>
        <h2>Remove All Data</h2>
        <p>Are you sure you want to remove all data? You should export it first.</p>
        <button on:click={clearTransactions}>Yes</button>
        <button on:click={() => removalModal = false}>No</button>
    </Modal>
{/if}