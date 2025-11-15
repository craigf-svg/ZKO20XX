<script lang="ts">
    import type { MoveBar } from "./types";
    import { getMoveIcon, getShortLabel } from "./iconMapping";
    import * as LucideIcons from '@lucide/svelte';

    let { moveName, koPercent, width, highlight }: MoveBar = $props();

    const formatRange = ([min, mid, max]: number[]) => `${min}-${mid}-${max}`;

    let displayPercent = $derived(
        Array.isArray(koPercent) ? formatRange(koPercent) : koPercent
    );

    let shortLabel = $derived(getShortLabel(moveName));
    let iconName = $derived(getMoveIcon(moveName));
    let Icon = $derived((LucideIcons as any)[iconName] || LucideIcons.ChevronRight);
</script>

<div class="move-card priority-{highlight}" data-highlight={highlight}>
    <div class="move-header">
        <div class="move-label">
            <div class="move-icon">
                <Icon size={20} strokeWidth={2.5} />
            </div>
            <span class="move-name">{shortLabel}</span>
        </div>
        <div class="ko-percent">
            <span class="percent-value">{displayPercent}</span>
            <span class="percent-symbol">%</span>
        </div>
    </div>
    <div class="progress-container">
        <div class="progress-bar">
            <div class="progress-fill {highlight}" style:width></div>
        </div>
    </div>
</div>

<style>
    .move-card {
        background: var(--color-bar-bg);
        border-radius: 8px;
        padding: 12px 16px;
    }

    .move-header,
    .move-label,
    .move-icon,
    .ko-percent {
        display: flex;
    }

    .move-header,
    .move-label,
    .move-icon {
        align-items: center;
    }

    .move-header {
        justify-content: space-between;
        margin-bottom: 10px;
        height: 28px;
    }

    .move-label {
        gap: 8px;
        flex: 1;
    }

    .move-icon {
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.7);
    }

    .move-name {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        color: rgba(255, 255, 255, 0.9);
    }

    .ko-percent {
        align-items: baseline;
        gap: 2px;
        font-weight: 700;
    }

    .percent-value {
        font-variant-numeric: tabular-nums;
        font-size: 20px;
        color: rgba(255, 255, 255, 0.95);
    }

    .percent-symbol {
        font-size: 14px;
        color: rgba(255, 255, 255, 0.5);
        font-weight: 500;
    }

    .progress-container {
        height: 28px;
    }

    .progress-bar {
        height: 24px;
        border-radius: 12px;
        overflow: hidden;
    }

    .progress-fill {
        height: 100%;
        transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border-radius: 11px;
    }

    .progress-fill.full {
        background: linear-gradient(90deg, #ff3e00, #ff6b4a);
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
    }

    .progress-fill.dim {
        background: linear-gradient(90deg, #ff9955, #ffa366);
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.2);
    }

    .progress-fill.none {
        background: linear-gradient(90deg, #444, #555);
    }
</style>