document.addEventListener("DOMContentLoaded", async () => {
    const dealerHandElement = document.getElementById("dealer-hand");
    const playerHandElement = document.getElementById("player-hand");
    const result = document.getElementById("result");
    const actionPrompt = document.createElement("p"); // Prompt above buttons

    const hitButton = document.getElementById("hit");
    const standButton = document.getElementById("stand");
    const playAgainYesButton = document.createElement("button");
    const playAgainNoButton = document.createElement("button");

    let gameState;

    playAgainYesButton.textContent = "Yes";
    playAgainNoButton.textContent = "No";
    playAgainYesButton.classList.add("play-again");
    playAgainNoButton.classList.add("play-again");


    async function startGame() {
        const res = await fetch("http://localhost:3001/start");
        gameState = await res.json();

        // Ensure actionPrompt is added to the DOM
        const buttonContainer = document.getElementById("buttons");
        if (!buttonContainer.contains(actionPrompt)) {
            buttonContainer.parentNode.insertBefore(actionPrompt, buttonContainer); // Add the prompt above the buttons
        }

        updateUI();
        showGameButtons();

        // Set the initial prompt
        actionPrompt.textContent = `You have ${gameState.player.value} and the dealer has ${gameState.dealer.visibleValue}. Do you want to hit or stand?`;
    }

    async function performAction(action) {
        const res = await fetch("http://localhost:3001/action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action }),
        });
        gameState = await res.json();
        updateUI();

        if (gameState.result) {
            showPlayAgainButtons();
            actionPrompt.textContent = "Play again?";
        } else {
            actionPrompt.textContent = `You have ${gameState.player.value} and the dealer has ${gameState.dealer.visibleValue}. Do you want to hit or stand?`;
        }
    }

    function updateUI() {
        // Clear existing cards to prevent duplication
        if (!dealerHandElement || !playerHandElement) {
            console.error("Dealer or Player hand elements are missing in the DOM.");
            return;
        }

        dealerHandElement.innerHTML = ""; // Clear previous cards
        playerHandElement.innerHTML = ""; // Clear previous cards

        // Update Dealer's Hand
        if (gameState.dealer && gameState.dealer.hand) {
            gameState.dealer.hand.split(", ").forEach((card) => {
                dealerHandElement.appendChild(createCardElement(card));
            });
        } else if (gameState.dealer && gameState.dealer.visibleCard) {
            dealerHandElement.appendChild(createCardElement(gameState.dealer.visibleCard));
        }

        // Update Player's Hand
        if (gameState.player && gameState.player.hand) {
            gameState.player.hand.split(", ").forEach((card) => {
                playerHandElement.appendChild(createCardElement(card));
            });
        }

        // Update Result
        if (gameState.result) {
            result.textContent = formatResultMessage(gameState.result);
        } else {
            result.textContent = "";
        }
    }

    function createCardElement(card) {
        const rank = card.split(" ")[0]; // Extracts rank (e.g., "9" from "9 ♦️")
        const suit = card.split(" ")[1]; // Extracts suit (e.g., "♦️" from "9 ♦️")

        const cardElement = document.createElement("div");
        cardElement.classList.add("card");

        // Apply color for red suits
        if (suit === "♥️" || suit === "♦️") {
            cardElement.classList.add("red");
        }

        const topLeft = document.createElement("div");
        topLeft.classList.add("top-left");
        topLeft.textContent = rank;

        const suitSymbol = document.createElement("div");
        suitSymbol.classList.add("suit");
        suitSymbol.textContent = suit; // Display suit emoji in the center

        const bottomRight = document.createElement("div");
        bottomRight.classList.add("bottom-right");
        bottomRight.textContent = rank;

        cardElement.appendChild(topLeft);
        cardElement.appendChild(suitSymbol);
        cardElement.appendChild(bottomRight);

        return cardElement;
    }

    function formatResultMessage(result) {
        switch (result) {
            case "player_wins":
                return "You win! Congratulations!";
            case "dealer_wins":
                return "Dealer wins! Better luck next time!";
            case "dealer_busted":
                return "Dealer busted! You win!";
            case "tie":
                return "It's a tie! So close!";
            case "busted":
                return "You busted! Better luck next time!";
            default:
                return "";
        }
    }

    function showGameButtons() {
        hitButton.style.display = "inline-block";
        standButton.style.display = "inline-block";
        playAgainYesButton.style.display = "none";
        playAgainNoButton.style.display = "none";
    }

    function showPlayAgainButtons() {
        hitButton.style.display = "none";
        standButton.style.display = "none";

        playAgainYesButton.style.display = "inline-block";
        playAgainNoButton.style.display = "inline-block";

        const buttonContainer = document.getElementById("buttons");
        if (!buttonContainer.contains(playAgainYesButton)) {
            buttonContainer.appendChild(playAgainYesButton);
            buttonContainer.appendChild(playAgainNoButton);
        }

        playAgainYesButton.addEventListener("click", () => {
            clearUI();
            startGame();
        });

        playAgainNoButton.addEventListener("click", () => {
            result.textContent = "Thanks for playing!";
            clearUI();
            actionPrompt.textContent = "";
        });
    }

    function clearUI() {
        dealerHandElement.innerHTML = "";
        playerHandElement.innerHTML = "";
        result.textContent = "";
    }

    hitButton.addEventListener("click", () => performAction("hit"));
    standButton.addEventListener("click", () => performAction("stand"));

    await startGame();
});
