let isInit = false;
let initError: Error | null = null;
let store: any = null;

export async function appInit() {
	if (isInit) return store;
	if (initError) throw initError;

	try {
		// Import modules dynamically
		const { initializeMobileAgents } = await import("./db");
		const { initializeReaderStore } = await import("@/lib/store");

		const agents = await initializeMobileAgents();
		store = initializeReaderStore(agents);
		await store.getState().loadInitialData();

		isInit = true;
		return store;
	} catch (error) {
		initError = error as Error;
		throw error;
	}
}

export function getInitStatus() {
	return { isInit, initError, store };
}
