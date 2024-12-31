"use strict";
document.addEventListener("DOMContentLoaded", async () => {
    const dealerCard = document.getElementById("dealer-card");
    const playerHand = document.getElementById("player-hand");
    const playerValue = document.getElementById("player-value");
    const result = document.getElementById("result");
    const hitButton = document.getElementById("hit");
    const standButton = document.getElementById("stand");
    let gameState;
    async function startGame() {
        const res = await fetch("http://localhost:3001/start");
        gameState = await res.json();
        updateUI();
    }
    async function performAction(action) {
        const res = await fetch("http://localhost:3001/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        gameState = await res.json();
        updateUI();
    }
    function updateUI() {
        // Update Dealer's UI
        if (gameState.dealer.hand) {
            dealerCard.textContent = `Dealer's Hand: ${gameState.dealer.hand}`;
        }
        else {
            dealerCard.textContent = `Visible Card: ${gameState.dealer.visibleCard}`;
        }
        // Update Player's UI
        playerHand.textContent = `Your Hand: ${gameState.player.hand}`;
        playerValue.textContent = `Value: ${gameState.player.value}`;
        // Update Result
        result.textContent = gameState.result || "";
    }
    hitButton.addEventListener("click", () => performAction("hit"));
    standButton.addEventListener("click", () => performAction("stand"));
    await startGame();
});
