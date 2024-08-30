import type { PlasmoCSConfig } from "plasmo"

export const config: PlasmoCSConfig = {
    matches: ["https://iris.reed.edu/board_commuter/*"]
}

for (const element of document.getElementsByTagName("script")) {
    element.innerHTML = "";
}

export {}
