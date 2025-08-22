const { Server: SocketIOServer } = require("socket.io");
const io = new SocketIOServer(8090, {
 cors: { origin: "*" },
});

console.log("Game Simulator running on http://localhost:8090");

process.on('SIGINT', () => {
  console.log('\n[SHUTDOWN] Received SIGINT, shutting down gracefully...');
  io.close(() => {
    console.log('[SHUTDOWN] Socket.IO server closed');
    process.exit(0);
  });
  
  // Force exit after 5 seconds if graceful shutdown fails
  setTimeout(() => {
    console.log('[SHUTDOWN] Force exit');
    process.exit(1);
  }, 5000);
});

// Function to emit test events automatically
function startTestSequence() {
 console.log(`[TEST] Starting automated test sequence`);
 
 // Emit game_start after 2 seconds
 setTimeout(() => {
   const gameStartData = {
     players: [
       {
         playerIndex: 0,
         port: 1,
         characterId: 0,
         characterShortName: "fox"
       },
       {
         playerIndex: 1,
         port: 2,
         characterId: 2,
         characterShortName: "falco"
       }
     ],
     stageName: "Battlefield",
     stageId: 31
   };
   console.log(`[EMIT] game_start:`, JSON.stringify(gameStartData));
   io.emit("game_start", gameStartData);
 }, 2000);

 // Send updates every 1 second for 10 seconds
 let updateCount = 0;
 let percentCount = 0;
 const updateInterval = setInterval(() => {
   updateCount++;
   percentCount += 15 + Math.floor(Math.random() * 5); 
   const updateData = [
     {
       name: "Fox",
       port: 1,
       percent: percentCount,
       stocks: 4, 
       shortName: "fox",
       characterId: 0
     },
     {
       name: "Falco",
       port: 2,
       percent: percentCount,
       stocks: 4,
       shortName: "falco",
       characterId: 2
     }
   ];
   
   console.log(`[EMIT] slippi_update ${updateCount}:`, JSON.stringify(updateData));
   io.emit("slippi_update", updateData);
   
   if (updateCount >= 17) {
     clearInterval(updateInterval);
     // End game after 10 updates
     setTimeout(() => {
       console.log(`[EMIT] game_end`);
       io.emit("game_end");
       
       // Restart the sequence after 3 seconds
       setTimeout(() => {
         startTestSequence();
       }, 3000);
     }, 2000);
   }
 }, 3000);
}

// Start test sequence immediately
startTestSequence();

// Still handle real connections for debugging
io.on("connection", (socket) => {
 console.log(`[CONNECTION] Client connected: ${socket.id}`);
 
 socket.on("disconnect", () => {
   console.log(`[DISCONNECT] Client disconnected: ${socket.id}`);
 });
});