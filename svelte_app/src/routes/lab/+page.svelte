<style>
.text-container {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex-direction: column;
}
.text {
  max-width: 600px;
}
</style>
<script lang="ts">
  function isCurrentStage(matchupEntry) {
      const fullStageName = stageInitialsToName(matchupEntry.stage);
      console.log("testing matchup.stage", matchupEntry.stage);
      console.log("selected stage", selectedStage)
      return fullStageName === selectedStage;
    }

  let myChar = 'fox', opponentChar = 'falco', selectedStage = "YS", matchupData;
  async function loadMatchupData() {
    try {
      const matchupPath = `/data/${myChar}/vs_${opponentChar}.json`;
      console.log('matchupPath', matchupPath)
      const response = await fetch(matchupPath);
      const allStagesKOData = await response.json();
      console.log("loaded lab data here", allStagesKOData);
      const currentStageData = allStagesKOData.find(isCurrentStage);
      console.log("currentStageData", currentStageData);
      matchupData = currentStageData
    } catch (e) {
      console.error(`Could not load matchup data for ${myChar} vs ${opponentChar} on ${selectedStage}`);
      matchupData = null;
    }
  }
</script>
<div class="space-y-4">
  <div class="text-3xl font-bold">
    The Lab
  </div>
  <div class="font-italicized">
    Test your setup here before going live.
  </div>
<form class="mx-auto w-full max-w-md space-y-4">
  <select class="select">
    <option value="1">Fox</option>
    <option value="2">Falco</option>
    <option value="3">Ganon</option>
    <option value="4">Puff</option>
    <option value="5">Shiek</option>
  </select>
  <div>vs</div>
 <select class="select">
    <option value="1">Fox</option>
    <option value="2">Falco</option>
    <option value="3">Ganon</option>
    <option value="4">Puff</option>
    <option value="5">Shiek</option>
  </select>
  <div>on</div>
 <select class="select">
    <option value="1">Yoshi's Story</option>
    <option value="2">Fountain of Dreams</option>
    <option value="3">Dreamland</option>
    <option value="4">Final Destination</option>
    <option value="5">Battlefield</option>
    <option value="6">Pokemon Stadium</option>
  </select>
  <button type="button" class="btn preset-filled-error-500" onclick={() => loadMatchupData() }>
      Fetch Loadout File
  </button>
  <label class="label">
    <span class="label-text">Percent</span>
    <input type="number" class="input" placeholder="Enter Percent" />
  </label>
</form>
 </div>
