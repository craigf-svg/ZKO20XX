export const SIDECAR_KEY = "zko-sidecar";

export type SidecarContext = {
	isSidecarRunning: () => boolean;
	startSidecar: () => Promise<void> | void;
	stopSidecar: () => void;
	sidecarNeedsRestart: () => boolean;
	setSidecarNeedsRestart: (value: boolean) => void;
	isScreenshotMode: () => boolean;
	setScreenshotMode: (value: boolean) => void;
};
