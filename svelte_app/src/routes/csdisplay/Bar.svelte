<script lang="ts">
  interface Props {
    moveName: string;
    koPercent: number;
    width: string;
    isActive: boolean;
  }

  let {
    moveName,
    koPercent,
    width,
    isHighlighted
  }: Props = $props();
</script>

<div class="card">
  <div class="card-header">
    <span>{moveName}</span>
    <span class="value">{koPercent}%</span>
  </div>
  <div class="bar">
    <div class="bar-fill {isHighlighted ? '' : 'inactive'}" style:width={width}></div>
  </div>
</div>

<style>
  .card {
    background: #1e1e1e;
    border-radius: 12px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 0 8px var(--color-orange-main-faint); 
  }
  .card-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 500;
  }
  .value {
    font-size: 1.2rem;
    font-weight: bold;
  }
  .bar {
    background: #333;
    height: 8px;
    border-radius: 4px;
    overflow: hidden;
  }
  .bar-fill {
    height: 100%;
    background: var(--color-orange-main);
    transition: width 0.3s ease;
  }
  .bar-fill.inactive {
    background: #444;
  }
</style>
