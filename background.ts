// https://github.com/requestly/modify-headers-manifest-v3/blob/master/src/background.ts

const rules: chrome.declarativeNetRequest.Rule[] = [
	{
		id: 1,
		priority: 1,
		action: {
			type: "block" as chrome.declarativeNetRequest.RuleActionType
		},
		condition: {
			urlFilter: "https://iris.reed.edu/board_commuter/assets/*.js",
			resourceTypes: ["script" as chrome.declarativeNetRequest.ResourceType]
		}
	}
]

chrome.declarativeNetRequest.updateDynamicRules({
	removeRuleIds: rules.map((rule) => rule.id),
	addRules: rules
})

const manifest = chrome.runtime.getManifest()
const permissions = { "origins": manifest.host_permissions }
chrome.permissions.contains(permissions).then(async result => {
	if (!result) {
		await chrome.permissions.request(permissions)
	}
});

export {}
