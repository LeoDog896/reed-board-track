<script lang="ts">
  export let count = 0;
  let action: string = null;
  function increment() {
      count += 1;
      action = "increment";
  }
  function decrement() {
      count -= 1;
      action = "decrement";
  }
</script>

<div class="container">
  <h2 class="text-center">
    Reed Board Tracker
  </h2>

  <p>
    Go to the <a href="https://iris.reed.edu/board_commuter">board tracking page</a> to update data.
  </p>
</div>

<style>
  .container {
      min-width: 470px;
  }

  .text-center {
      text-align: center;
  }
</style>
