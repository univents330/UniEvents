export const TOP_LOADER_START_EVENT = "voltaze:top-loader:start";
export const TOP_LOADER_DONE_EVENT = "voltaze:top-loader:done";

function dispatchTopLoaderEvent(eventName: string) {
	if (typeof window === "undefined") {
		return;
	}

	window.dispatchEvent(new CustomEvent(eventName));
}

export function startTopLoader() {
	dispatchTopLoaderEvent(TOP_LOADER_START_EVENT);
}

export function stopTopLoader() {
	dispatchTopLoaderEvent(TOP_LOADER_DONE_EVENT);
}
