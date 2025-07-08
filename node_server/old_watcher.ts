import { WebSocketServer } from 'ws';
import { SlippiGame } from "@slippi/slippi-js";
import chokidar from "chokidar";

// Create WebSocket server on port 8080
const wss = new WebSocketServer({ port: 8080 });

// Broadcast data to all connected clients
function broadcast(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Existing Slippi file watcher code
watcher.on("add", (filePath) => {
  const game = new SlippiGame(filePath, { processOnTheFly: true });
  const interval = setInterval(() => {
    const settings = game.getSettings();
    const latestFrame = game.getLatestFrame();

    // Send data to Svelte frontend
    broadcast({
      type: 'SLIPPI_UPDATE',
      players: settings?.players?.map(player => ({
        character: characterUtils.getCharacterName(player.characterId),
        percent: latestFrame?.players?.[player.playerIndex]?.post?.percent,
        stocks: latestFrame?.players?.[player.playerIndex]?.post?.stocksRemaining
      }))
    });
  }, 1000);
});

console.log("WebSocket server running on ws://localhost:8080");
