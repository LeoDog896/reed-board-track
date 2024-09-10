// TODO: move to ext library

import { onMount } from "svelte"
import { get, writable, type Writable } from "svelte/store"

import type { Storage } from "@plasmohq/storage"

export function storageStore<T>(
	storage: Storage,
	key: string,
	initialValue: T
): Writable<T> {
	const value = writable<T>(initialValue)
	const { subscribe, set, update } = value

	onMount(async () => {
		const oldValue = await storage.get<T>(key)

		if (oldValue === undefined) {
			storage.set(key, get(value))
		} else {
			set(oldValue)
		}
	})

	return {
		set(value: T) {
			set(value)
			storage.set(key, value)
		},
		subscribe,
		update
	}
}
