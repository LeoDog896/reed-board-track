/**
 * @type {import('prettier').Options}
 */
export default {
	printWidth: 80,
	useTabs: true,
	semi: false,
	singleQuote: false,
	trailingComma: "none",
	bracketSpacing: true,
	bracketSameLine: true,
	plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-svelte"],
	overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
	importOrder: [
		"<BUILTIN_MODULES>", // Node.js built-in modules
		"<THIRD_PARTY_MODULES>", // Imports not matched by other special words or groups.
		"", // Empty line
		"^@plasmo/(.*)$",
		"",
		"^@plasmohq/(.*)$",
		"",
		"^~(.*)$",
		"",
		"^[./]"
	]
}
