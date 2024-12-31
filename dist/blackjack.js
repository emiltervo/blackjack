"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
// Card Class
class Card {
    suit;
    rank;
    suitEmoji;
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
        this.suitEmoji = this.getSuitEmoji(suit);
    }
    getSuitEmoji(suit) {
        switch (suit) {
            case "hearts":
                return "♥️";
            case "diamonds":
                return "♦️";
            case "clubs":
                return "♣️";
            case "spades":
                return "♠️";
            default:
                return suit;
        }
    }
    toString() {
        return `${this.rank} ${this.suitEmoji}`;
    }
    getValue() {
        if (typeof this.rank === "number") {
            return this.rank;
        }
        else if (this.rank === "A") {
            return 11;
        }
        else {
            return 10;
        }
    }
}
// Deck Class
class Deck {
    cards = [];
    constructor() {
        for (let suit of ["hearts", "diamonds", "clubs", "spades"]) {
            for (let rank of [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]) {
                this.cards.push(new Card(suit, rank));
            }
        }
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    async animateShuffle() {
        const symbols = ["|", "/", "-", "\\"];
        for (let i = 0; i < 10; i++) {
            process.stdout.write(`\rShuffling cards... ${symbols[i % symbols.length]}`);
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        process.stdout.write("\rShuffling complete!             \n");
        this.shuffle();
    }
    async dealCardAnimation(card) {
        const delay = 300; // Time delay between animations
        const frames = [
            "[    ]",
            "[==  ]",
            "[=== ]",
            "[====]"
        ];
        for (const frame of frames) {
            process.stdout.write(`\rDealing card... ${frame}`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        console.log(`\rDealt card: ${card.toString()}           `);
    }
    draw() {
        return this.cards.pop();
    }
}
// Player Class
class Player {
    name;
    hand = [];
    constructor(name) {
        this.name = name;
    }
    async draw(card, deck) {
        await deck.dealCardAnimation(card);
        this.hand.push(card);
    }
    getHandValue() {
        let value = 0;
        let aces = 0;
        for (const card of this.hand) {
            if (typeof card.rank === "number") {
                value += card.rank;
            }
            else if (card.rank === "A") {
                aces += 1;
                value += 11;
            }
            else {
                value += 10;
            }
        }
        // Adjust for aces
        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        return value;
    }
    showHand() {
        return this.hand.map(card => card.toString()).join(", ");
    }
    getVisibleCard() {
        return this.hand[0];
    }
    hasBusted() {
        return this.getHandValue() > 21;
    }
    resetHand() {
        this.hand = [];
    }
}
// Game Loop
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
async function prompt(query) {
    return new Promise(resolve => rl.question(query, resolve));
}
function clearConsole() {
    console.clear(); // Clears the console screen
}
async function playGame() {
    const deck = new Deck();
    const player = new Player("Player");
    const dealer = new Player("Dealer");
    await deck.animateShuffle();
    // Initial Draw
    await player.draw(deck.draw(), deck);
    await player.draw(deck.draw(), deck);
    await dealer.draw(deck.draw(), deck);
    await dealer.draw(deck.draw(), deck);
    while (true) {
        clearConsole();
        const dealerVisibleCard = dealer.getVisibleCard();
        console.log(`Dealer's visible card: ${dealerVisibleCard.toString()} (Value: ${dealerVisibleCard.getValue()})`);
        console.log(`Your hand: ${player.showHand()} (Value: ${player.getHandValue()})`);
        // Player Turn
        if (player.hasBusted()) {
            console.log("You busted! Dealer wins.");
            return await playAgainPrompt();
        }
        const action = await prompt("Do you want to (h)it or (s)tand? ");
        if (action.toLowerCase() === "h") {
            await player.draw(deck.draw(), deck);
        }
        else if (action.toLowerCase() === "s") {
            break;
        }
        else {
            console.log("Invalid input. Please type 'h' to hit or 's' to stand.");
        }
    }
    // Dealer Turn
    while (dealer.getHandValue() < 17) {
        await dealer.draw(deck.draw(), deck);
    }
    // Final Outcome
    clearConsole();
    console.log(`Final Hands:`);
    console.log(`Your hand: ${player.showHand()} (Value: ${player.getHandValue()})`);
    console.log(`Dealer's hand: ${dealer.showHand()} (Value: ${dealer.getHandValue()})`);
    if (dealer.hasBusted()) {
        console.log("Dealer busted! You win.");
    }
    else if (player.getHandValue() > dealer.getHandValue()) {
        console.log("You win!");
    }
    else if (player.getHandValue() < dealer.getHandValue()) {
        console.log("Dealer wins.");
    }
    else {
        console.log("It's a tie!");
    }
    return await playAgainPrompt();
}
async function playAgainPrompt() {
    const response = await prompt("\nDo you want to play again? (y/n): ");
    return response.toLowerCase() === "y";
}
async function main() {
    let playAgain = true;
    while (playAgain) {
        playAgain = await playGame();
    }
    console.log("Thanks for playing!");
    rl.close();
}
main();
