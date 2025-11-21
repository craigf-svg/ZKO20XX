import { execSync } from "child_process";
import fs from "fs";

const ext = process.platform === "win32" ? ".exe" : "";

let targetTriple = process.env.TARGET_TRIPLE;

if (!targetTriple) {
	const rustInfo = execSync("rustc -vV");
	const match = /host: (\S+)/g.exec(rustInfo.toString());
	targetTriple = match?.[1];
}

if (!targetTriple) {
	console.error("Failed to determine platform target triple");
	process.exit(1);
}

fs.renameSync(`my-sidecar${ext}`, `../src-tauri/binaries/my-sidecar-${targetTriple}${ext}`);
