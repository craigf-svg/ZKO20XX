<script lang="ts">
	import { invoke } from "@tauri-apps/api/core";
	import { onMount } from "svelte";
	import type {
		MatchupFile,
		MoveCatalogEntry,
		StageEntry,
	} from "../../../static/data/MatchupEntry";

	const CHARACTERS: string[] = [
		"bowser", "captainfalcon", "donkeykong", "drmario", "falco", "fox",
		"gameandwatch", "ganondorf", "iceclimbers", "jigglypuff", "kirby",
		"link", "luigi", "mario", "marth", "mewtwo", "ness", "peach",
		"pichu", "pikachu", "roy", "samus", "sheik", "yoshi",
		"younglink", "zelda",
	];

	const STAGES: { id: string; label: string }[] = [
		{ id: "yoshis_story", label: "Yoshi's Story" },
		{ id: "pokemon_stadium", label: "Pokémon Stadium" },
		{ id: "final_destination", label: "Final Destination" },
		{ id: "battlefield", label: "Battlefield" },
		{ id: "fountain_of_dreams", label: "Fountain of Dreams" },
		{ id: "dream_land", label: "Dream Land" },
	];

	function isSnakeCase(str: string): boolean {
		return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(str);
	}

	function formatValue(val: number | number[]): string {
		return Array.isArray(val) ? val.join(", ") : String(val);
	}

	function isValidPercent(n: number): boolean {
		return !Number.isNaN(n) && Number.isInteger(n) && n >= 0 && n <= 999;
	}

	function parseValue(input: string): { value: number | number[]; valid: boolean } {
		const trimmed = input.trim();
		if (trimmed === "") return { value: 0, valid: true };

		if (trimmed.includes(",")) {
			const parts = trimmed.split(",").map((s) => s.trim()).filter((s) => s !== "");
			const nums = parts.map(Number);
			const valid = nums.length > 0 && nums.every(isValidPercent);
			return { value: valid ? nums : [], valid };
		}

		const num = Number(trimmed);
		const valid = isValidPercent(num);
		return { value: valid ? num : 0, valid };
	}

	let character = $state("fox");
	let opponent = $state("falco");
	let loaded = $state(false);
	let dirty = $state(false);
	let loading = $state(false);
	let activeStageIdx = $state(0);
	let statusMessage = $state<{ type: "success" | "error"; text: string } | null>(null);

	let moveCatalog = $state<Record<string, MoveCatalogEntry>>({});
	let stageInputs = $state<Record<string, Record<string, string>>>({});
	let newMoveId = $state("");

	const moveIds = $derived(Object.keys(moveCatalog));

	const validationErrors = $derived.by(() => {
		if (!loaded) return [];
		const errors: string[] = [];

		if (moveIds.length === 0) {
			errors.push("At least one move is required");
			return errors;
		}

		for (const id of moveIds) {
			const entry = moveCatalog[id];
			if (!isSnakeCase(id)) errors.push(`"${id}": not valid snake_case`);
			if (!entry.label.trim()) errors.push(`"${id}": label required`);
			if (!entry.shortLabel.trim()) errors.push(`"${id}": shortLabel required`);
		}

		for (const stage of STAGES) {
			const inputs = stageInputs[stage.id] ?? {};
			for (const moveId of moveIds) {
				const { valid } = parseValue(inputs[moveId] ?? "");
				if (!valid) errors.push(`${stage.label} → ${moveId}: invalid value`);
			}
		}

		return errors;
	});

	const canSave = $derived(loaded && !loading && validationErrors.length === 0);

	function populateFromFile(file: MatchupFile): void {
		moveCatalog = {};
		for (const [id, entry] of Object.entries(file.moveCatalog)) {
			moveCatalog[id] = { label: entry.label, shortLabel: entry.shortLabel };
		}

		stageInputs = {};
		for (const stage of STAGES) {
			const found = file.stages.find((s) => s.stage === stage.id);
			const inputs: Record<string, string> = {};
			for (const moveId of Object.keys(file.moveCatalog)) {
				const val = found?.moves[moveId];
				inputs[moveId] = val !== undefined ? formatValue(val) : "0";
			}
			stageInputs[stage.id] = inputs;
		}
	}

	function initializeEmpty(): void {
		moveCatalog = {};
		stageInputs = {};
		for (const stage of STAGES) {
			stageInputs[stage.id] = {};
		}
	}

	function buildMatchupFile(): MatchupFile {
		const catalogSnap = $state.snapshot(moveCatalog);
		const inputSnap = $state.snapshot(stageInputs);

		const stages: StageEntry[] = STAGES.map((stage) => {
			const inputs = inputSnap[stage.id] ?? {};
			const moves: Record<string, number | number[]> = {};
			for (const moveId of Object.keys(catalogSnap)) {
				const { value } = parseValue(inputs[moveId] ?? "0");
				moves[moveId] = value;
			}
			return { stage: stage.id, moves };
		});

		return { character, opponent, moveCatalog: catalogSnap, stages };
	}

	async function handleLoad(): Promise<void> {
		if (dirty && !confirm("You have unsaved changes. Discard and load?")) return;

		loading = true;
		statusMessage = null;

		try {
			const file = await invoke<MatchupFile>("load_matchup_file", { character, opponent });
			populateFromFile(file);
			loaded = true;
			dirty = false;
			statusMessage = { type: "success", text: "Loaded existing matchup file" };
		} catch {
			initializeEmpty();
			loaded = true;
			dirty = false;
			statusMessage = { type: "success", text: "No existing file — started new matchup" };
		} finally {
			loading = false;
		}
	}

	async function handleSave(): Promise<void> {
		if (validationErrors.length > 0) {
			statusMessage = { type: "error", text: `Fix ${validationErrors.length} validation error(s) first` };
			return;
		}

		loading = true;
		statusMessage = null;

		try {
			const data = buildMatchupFile();
			await invoke("save_matchup_file", { character, opponent, data });
			dirty = false;
			statusMessage = { type: "success", text: "Saved successfully!" };
		} catch (e) {
			statusMessage = { type: "error", text: `Save failed: ${e}` };
		} finally {
			loading = false;
		}
	}

	function addMove(): void {
		const id = newMoveId.trim().toLowerCase().replace(/\s+/g, "_");
		if (!id || !isSnakeCase(id) || id in moveCatalog) return;

		moveCatalog[id] = { label: "", shortLabel: "" };
		for (const stage of STAGES) {
			if (!stageInputs[stage.id]) stageInputs[stage.id] = {};
			stageInputs[stage.id][id] = "0";
		}
		newMoveId = "";
		dirty = true;
	}

	function removeMove(id: string): void {
		if (!confirm(`Remove "${id}" from all stages?`)) return;

		delete moveCatalog[id];
		for (const stage of STAGES) {
			if (stageInputs[stage.id]) {
				delete stageInputs[stage.id][id];
			}
		}
		dirty = true;
	}

	function markDirty(): void {
		dirty = true;
		statusMessage = null;
	}

	function handlePercentInput(moveId: string, newValue: string): void {
		const stageId = STAGES[activeStageIdx].id;
		if (!stageInputs[stageId]) stageInputs[stageId] = {};
		stageInputs[stageId][moveId] = newValue;
		markDirty();
	}

	function handleAddMoveKeydown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			e.preventDefault();
			addMove();
		}
	}

	// Warn before leaving with unsaved changes
	onMount(() => {
		function warn(e: BeforeUnloadEvent) {
			if (dirty) e.preventDefault();
		}
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	});
</script>

<div class="creator-page">
	<h1 class="text-3xl font-bold mb-6">Matchup Creator</h1>

	<div class="selector-bar">
		<select bind:value={character} class="select">
			{#each CHARACTERS as c (c)}
				<option value={c}>{c}</option>
			{/each}
		</select>
		<span class="text-[var(--color-muted)]">vs</span>
		<select bind:value={opponent} class="select">
			{#each CHARACTERS as c (c)}
				<option value={c}>{c}</option>
			{/each}
		</select>
		<button class="btn btn-primary" onclick={handleLoad} disabled={loading}>
			{loading ? "Loading…" : "Load"}
		</button>
		{#if loaded}
			<button class="btn btn-save" onclick={handleSave} disabled={!canSave}>
				Save
			</button>
			{#if dirty}
				<span class="unsaved-badge">● Unsaved changes</span>
			{/if}
		{/if}
	</div>

	{#if statusMessage}
		<div class="status-msg" class:success={statusMessage.type === "success"} class:error={statusMessage.type === "error"}>
			{statusMessage.text}
		</div>
	{/if}

	{#if loaded}
		<div class="editor-grid">
			<section class="panel">
				<h2 class="text-xl font-semibold mb-3">Move Catalog</h2>

				<div class="add-move-row">
					<input
						type="text"
						class="input"
						style="flex:1"
						bind:value={newMoveId}
						placeholder="new_move_id (snake_case)"
						onkeydown={handleAddMoveKeydown}
					/>
					<button class="btn btn-primary" onclick={addMove} disabled={!newMoveId.trim()}>
						Add
					</button>
				</div>

				{#if moveIds.length === 0}
					<p class="muted-text">No moves yet. Add one above.</p>
				{:else}
					<div class="move-list">
						{#each moveIds as id (id)}
							<div class="move-entry">
								<div class="move-header">
									<code class="move-id">{id}</code>
									<button class="btn-icon" onclick={() => removeMove(id)} title="Remove move">✕</button>
								</div>
								<div class="move-fields">
									<input
										type="text"
										class="input"
										bind:value={moveCatalog[id].label}
										oninput={markDirty}
										placeholder="Label (e.g. Up Smash)"
									/>
									<input
										type="text"
										class="input"
										bind:value={moveCatalog[id].shortLabel}
										oninput={markDirty}
										placeholder="Short (e.g. USmash)"
									/>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>

			<section class="panel">
				<h2 class="text-xl font-semibold mb-3">Stage Percents</h2>

				<div class="stage-tabs">
					{#each STAGES as stage, i (stage.id)}
						<button
							class="tab"
							class:active={activeStageIdx === i}
							onclick={() => (activeStageIdx = i)}
						>
							{stage.label}
						</button>
					{/each}
				</div>

				<div class="percent-grid">
					{#if moveIds.length === 0}
						<p class="muted-text">Add moves in the catalog first.</p>
					{:else}
						{#each moveIds as moveId (moveId)}
							{@const stageId = STAGES[activeStageIdx].id}
							{@const rawValue = stageInputs[stageId]?.[moveId] ?? "0"}
							{@const isValid = parseValue(rawValue).valid}
							<div class="percent-row">
								<label class="percent-label" for={`pct-${moveId}`}>
									{moveCatalog[moveId]?.label || moveId}
								</label>
								<input
									id={`pct-${moveId}`}
									type="text"
									class="input percent-input"
									class:invalid={!isValid}
									value={rawValue}
									oninput={(e) => handlePercentInput(moveId, e.currentTarget.value)}
									placeholder="0 or 45, 52, 60"
								/>
							</div>
						{/each}
					{/if}
				</div>
			</section>
		</div>

		{#if validationErrors.length > 0}
			<div class="validation-box">
				<strong>Validation Errors ({validationErrors.length}):</strong>
				<ul>
					{#each validationErrors as err, i (i)}
						<li>{err}</li>
					{/each}
				</ul>
			</div>
		{/if}
	{/if}
</div>

<style>
	.creator-page {
		text-align: left;
		padding: 1.5rem;
		max-width: 72rem;
		margin: 0 auto;
	}

	.selector-bar {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
		margin-bottom: 1rem;
	}

	.unsaved-badge {
		font-size: 0.85rem;
		color: #facc15;
	}

	.editor-grid {
		display: grid;
		grid-template-columns: 1fr 1.5fr;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.editor-grid {
			grid-template-columns: 1fr;
		}
	}

	.panel {
		background: var(--color-bg-navbar);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 1rem;
	}

	.select {
		background: var(--color-bg-navbar);
		color: var(--color-text-main);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.4rem 0.6rem;
	}

	.input {
		background: var(--color-bg-body);
		color: var(--color-text-main);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 0.4rem 0.6rem;
		width: 100%;
	}

	.input:focus {
		outline: none;
		border-color: var(--color-orange-main);
	}

	.input.invalid {
		border-color: #ef4444;
		background: rgba(239, 68, 68, 0.1);
	}

	.btn {
		padding: 0.4rem 1rem;
		border-radius: 4px;
		font-weight: 600;
		cursor: pointer;
		border: 1px solid var(--color-border);
		color: var(--color-text-main);
		background: var(--color-bg-navbar);
		transition: background 0.15s;
	}

	.btn:hover:not(:disabled) {
		background: var(--color-bg-navbar-hover);
	}

	.btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.btn-primary {
		background: var(--color-orange-main);
		color: white;
		border-color: var(--color-orange-main);
	}

	.btn-primary:hover:not(:disabled) {
		opacity: 0.9;
		background: var(--color-orange-main);
	}

	.btn-save {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}

	.btn-save:hover:not(:disabled) {
		background: #059669;
		border-color: #059669;
	}

	.btn-icon {
		background: none;
		border: none;
		color: var(--color-muted);
		cursor: pointer;
		padding: 0.2rem;
		font-size: 0.9rem;
	}

	.btn-icon:hover {
		color: #ef4444;
	}

	/* Add Move Row */
	.add-move-row {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
	}

	/* Move List */
	.move-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-height: 60vh;
		overflow-y: auto;
	}

	.move-entry {
		border: 1px solid var(--color-border);
		border-radius: 6px;
		padding: 0.5rem;
	}

	.move-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.4rem;
	}

	.move-id {
		font-size: 0.85rem;
		color: var(--color-orange-main);
	}

	.move-fields {
		display: flex;
		gap: 0.5rem;
	}

	.stage-tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.tab {
		padding: 0.35rem 0.75rem;
		border-radius: 4px;
		border: 1px solid var(--color-border);
		background: var(--color-bg-body);
		color: var(--color-muted);
		cursor: pointer;
		font-size: 0.85rem;
		transition: all 0.15s;
	}

	.tab:hover {
		color: var(--color-text-main);
		border-color: var(--color-text-main);
	}

	.tab.active {
		background: var(--color-orange-main);
		color: white;
		border-color: var(--color-orange-main);
	}

	/* Percent Grid */
	.percent-grid {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.percent-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.percent-label {
		min-width: 140px;
		font-size: 0.9rem;
		color: var(--color-text-main);
	}

	.percent-input {
		max-width: 200px;
	}

	.status-msg {
		padding: 0.5rem 1rem;
		border-radius: 4px;
		margin-bottom: 0.75rem;
		font-size: 0.9rem;
	}

	.status-msg.success {
		background: rgba(16, 185, 129, 0.15);
		color: #10b981;
		border: 1px solid rgba(16, 185, 129, 0.3);
	}

	.status-msg.error {
		background: rgba(239, 68, 68, 0.15);
		color: #ef4444;
		border: 1px solid rgba(239, 68, 68, 0.3);
	}

	.validation-box {
		margin-top: 1rem;
		padding: 0.75rem 1rem;
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.3);
		border-radius: 6px;
		color: #ef4444;
		font-size: 0.85rem;
		text-align: left;
	}

	.validation-box ul {
		margin: 0.5rem 0 0 1.2rem;
		padding: 0;
	}

	.validation-box li {
		margin-bottom: 0.2rem;
	}

	.muted-text {
		color: var(--color-muted);
		font-size: 0.85rem;
	}
</style>
