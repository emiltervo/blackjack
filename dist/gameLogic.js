"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = exports.Deck = exports.Card = void 0;
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
        if (typeof this.rank === "number")
            return this.rank;
        if (this.rank === "A")
            return 11;
        return 10;
    }
}
exports.Card = Card;
class Deck {
    cards = [];
    constructor() {
        for (let suit of ["hearts", "diamonds", "clubs", "spades"]) {
            for (let rank of [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]) {
                this.cards.push(new Card(suit, rank));
            }
        }
        this.shuffle();
    }
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
    draw() {
        return this.cards.pop();
    }
}
exports.Deck = Deck;
class Player {
    name;
    hand;
    constructor(name) {
        this.name = name;
        this.hand = [];
    }
    draw(card) {
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
        while (value > 21 && aces > 0) {
            value -= 10;
            aces -= 1;
        }
        return value;
    }
    showHand() {
        return this.hand.map(card => card.toString()).join(", ");
    }
    hasBusted() {
        return this.getHandValue() > 21;
    }
}
exports.Player = Player;
