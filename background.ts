// https://github.com/requestly/modify-headers-manifest-v3/blob/master/src/background.ts

const rules: chrome.declarativeNetRequest.Rule[] = [
    {
        id: 1,
        priority: 1,
        action: {
            type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
        },
        condition: {
            urlFilter: 'https://iris.reed.edu/board_commuter/assets/*.js',
            resourceTypes: Object.values(chrome.declarativeNetRequest.ResourceType)
        }
    }
]

chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map((rule) => rule.id),
    addRules: rules
})

export {}
