<script lang="ts">
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher<{
        close: null
    }>();

    function close() {
        dispatch('close');
    }
</script>

<button class="container" on:click|self={close}>
    <div class="modal">
        <slot />
    </div>
</button>

<style>
    .container {
        all: unset;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);
    }

    .modal {
        position: fixed;
        border: 3px solid black;
        background-color: white;
        padding: 1rem 2rem;
    }
</style>
