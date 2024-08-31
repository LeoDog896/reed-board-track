<script lang="ts">
    import {
		CategoryScale,
		Chart,
		Filler,
		LinearScale,
		LineController,
		LineElement,
		PointElement,
		TimeScale
	} from "chart.js"

    import "chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm"
	import { onMount } from "svelte"

    let chart: HTMLCanvasElement
	let chartInstance: Chart | undefined

    export let data: { x: number, y: number }[]

    onMount(() => {
        Chart.register(
			LineController,
			CategoryScale,
			LinearScale,
			TimeScale,
			PointElement,
			LineElement,
			Filler
		)

		chartInstance = new Chart(chart, {
			type: "line",
			data: {
				datasets: [
					{
						label: "Transactions",
						data,
						tension: 0.3,
                        borderColor: "#A70E16",
					}
				]
			},
			options: {
				responsive: true,
				scales: {
					xAxes: {
						type: "time",
						time: {
							unit: "day"
						}
					},
					y: {
						type: "linear",
						min: 0
					}
				}
			}
		})

        return () => {
            chartInstance.destroy()
        }
    })

    $: if (data && chartInstance) {
		chartInstance.data.datasets[0].data = data
		chartInstance.update()
	}
</script>

<canvas bind:this={chart}></canvas>
