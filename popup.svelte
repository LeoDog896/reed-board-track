<script lang="ts">
  import { clearTransactions, getTransactions } from "~transaction";

  const transactions = getTransactions();

  function clear() {
    clearTransactions();
  }
</script>

<div class="container">
  <h2 class="text-center">
    Reed Board Tracker
  </h2>

  <p>
    Go to the <a href="https://iris.reed.edu/board_commuter">board tracking page</a> to update data.
  </p>

  <button on:click={clear}>Clear Transactions</button>

  {#await transactions}
    <p>Loading...</p>
  {:then loaded}
    {Object.values(loaded).length}
  {/await}
</div>

<style>
  .container {
      min-width: 470px;
  }

  .text-center {
      text-align: center;
  }
</style>
