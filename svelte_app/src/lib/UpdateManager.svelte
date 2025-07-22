<script lang="ts">
	import { onMount } from 'svelte';
	import { check, Update } from '@tauri-apps/plugin-updater';
	import { relaunch } from '@tauri-apps/plugin-process';

	let updateAvailable = $state(false);
	let updateInfo = $state<Update | null>(null);
	let downloading = $state(false);
	let downloadProgress = $state(0);
	let showNotification = $state(false);
	let checkingForUpdates = $state(false);

	onMount(() => {
		checkForUpdates();
		const interval = setInterval(checkForUpdates, 30 * 60 * 1000);
		return () => clearInterval(interval);
	});

	async function checkForUpdates() {
		try {
			checkingForUpdates = true;
			const update = await check();
			if (update?.available) {
				updateInfo = update;
				updateAvailable = true;
				showNotification = true;
				console.log(`Update available: ${update.version}`);
			} else {
				console.log('No updates available');
			}
		} catch (error) {
			console.error('Failed to check for updates:', error);
		} finally {
			checkingForUpdates = false;
		}
	}

	async function downloadAndInstall() {
		if (!updateInfo) return;
		try {
			downloading = true;
			downloadProgress = 0;
			await updateInfo.downloadAndInstall((event) => {
				switch (event.event) {
					case 'Started':
						console.log('Download started');
						break;
					case 'Progress':
						console.log(`Downloaded chunk: ${event.data.chunkLength}`);
						downloading = true;
						break;
					case 'Finished':
						console.log('Download finished');
						break;
				}
			});
			await relaunch();
		} catch (error) {
			console.error('Failed to download and install update:', error);
			downloading = false;
		}
	}

	function dismissNotification() {
		showNotification = false;
	}

	function remindLater() {
		showNotification = false;
		setTimeout(checkForUpdates, 2 * 60 * 60 * 1000);
	}
</script>

{#if showNotification && updateAvailable && updateInfo}
	<div class="update-overlay">
		<div class="update-modal">
			<div class="update-header">
				<h3>🚀 Update Available</h3>
				<button class="close-btn" onclick={dismissNotification}>×</button>
			</div>
			<div class="update-content">
				<p><strong>Version {updateInfo.version}</strong> is now available!</p>
				{#if updateInfo.body}
					<div class="release-notes">
						<h4>What's New:</h4>
						<p>{updateInfo.body}</p>
					</div>
				{/if}
				{#if downloading}
					<div class="download-progress">
						<p>Downloading update...</p>
						<div class="progress-bar">
							<div class="progress-fill" style="width: 100%; animation: progress-indeterminate 2s infinite;"></div>
						</div>
						<p class="progress-note">The app will restart automatically when complete.</p>
					</div>
				{:else}
					<div class="update-actions">
						<button class="btn-primary" onclick={downloadAndInstall}>
							Update Now
						</button>
						<button class="btn-secondary" onclick={remindLater}>
							Remind Me Later
						</button>
						<button class="btn-tertiary" onclick={dismissNotification}>
							Skip This Version
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<div class="update-check">
	<button 
		class="check-btn" 
		onclick={checkForUpdates} 
		disabled={checkingForUpdates}
	>
		{checkingForUpdates ? 'Checking...' : 'Check for Updates'}
	</button>
</div>

<style>
	.update-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.update-modal {
		background: var(--color-bg-navbar);
		border: 1px solid var(--color-border);
		border-radius: 12px;
		max-width: 500px;
		width: 90%;
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateY(-20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.update-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px 24px 16px;
		border-bottom: 1px solid var(--color-border);
	}

	.update-header h3 {
		margin: 0;
		color: var(--color-text-heading);
		font-size: 1.4rem;
	}

	.close-btn {
		background: none;
		border: none;
		font-size: 24px;
		color: var(--color-muted);
		cursor: pointer;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 6px;
		transition: all 0.2s;
	}

	.close-btn:hover {
		background: var(--color-bg-navbar-hover);
		color: var(--color-text-main);
	}

	.update-content {
		padding: 24px;
	}

	.update-content p {
		margin: 0 0 16px 0;
		color: var(--color-text-main);
		line-height: 1.5;
	}

	.release-notes {
		background: var(--color-bg-body);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		padding: 16px;
		margin: 16px 0;
	}

	.release-notes h4 {
		margin: 0 0 8px 0;
		color: var(--color-text-heading);
		font-size: 1rem;
	}

	.download-progress {
		text-align: center;
		margin: 20px 0;
	}

	.progress-bar {
		width: 100%;
		height: 8px;
		background: var(--color-border);
		border-radius: 4px;
		overflow: hidden;
		margin: 12px 0;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-orange-main);
		transition: width 0.3s ease;
		border-radius: 4px;
	}

	@keyframes progress-indeterminate {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(100%);
		}
	}

	.progress-note {
		font-size: 0.9rem;
		color: var(--color-muted);
		margin-top: 8px;
	}

	.update-actions {
		display: flex;
		gap: 12px;
		margin-top: 24px;
		flex-wrap: wrap;
	}

	.btn-primary, .btn-secondary, .btn-tertiary {
		padding: 12px 20px;
		border: none;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		flex: 1;
		min-width: 120px;
	}

	.btn-primary {
		background: var(--color-orange-main);
		color: white;
	}

	.btn-primary:hover {
		background: var(--color-orange-secondary);
		transform: translateY(-1px);
	}

	.btn-secondary {
		background: var(--color-bg-navbar-hover);
		color: var(--color-text-main);
		border: 1px solid var(--color-border);
	}

	.btn-secondary:hover {
		background: var(--color-border);
	}

	.btn-tertiary {
		background: transparent;
		color: var(--color-muted);
		border: 1px solid transparent;
	}

	.btn-tertiary:hover {
		color: var(--color-text-main);
		border-color: var(--color-border);
	}

	.update-check {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 100;
	}

	.check-btn {
		background: var(--color-bg-navbar);
		border: 1px solid var(--color-border);
		color: var(--color-text-main);
		padding: 8px 16px;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s;
		opacity: 0.7;
	}

	.check-btn:hover {
		opacity: 1;
		background: var(--color-bg-navbar-hover);
	}

	.check-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
