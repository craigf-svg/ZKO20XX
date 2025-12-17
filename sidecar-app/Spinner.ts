export class Spinner {
	private readonly spinnerFrames: string[];
	private myInterval: NodeJS.Timeout | null;
	private idx: number;

	constructor() {
		this.spinnerFrames = ["|", "/", "-", "\\"];
		this.myInterval = null;
		this.idx = 0;
	}

	start(message: string, delayInSeconds: number = 0.5): void {
		this.myInterval = setInterval(() => {
			try {
				process.stdout.write(`\r${message} ${this.spinnerFrames[this.idx % 4]}`);
				this.idx++;
			} catch (err) {
				console.error("Error:", err);
				this.stop();
			}
		}, delayInSeconds * 1000);
	}

	stop(): void {
		console.log("Spinner stopped!");
		if (this.myInterval) {
			clearInterval(this.myInterval);
			this.myInterval = null;
		}
		this.idx = 0;
	}
}

export default new Spinner();
