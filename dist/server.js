"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const gameLogic_1 = require("./gameLogic");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
let deck, player, dealer;
// Serve static files from the "public" directory
app.use(express_1.default.static(path_1.default.join(__dirname, "../public")));
// Root endpoint to serve index.html
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../public/index.html"));
});
// Start the game
app.get("/start", (req, res) => {
    deck = new gameLogic_1.Deck();
    player = new gameLogic_1.Player("Player");
    dealer = new gameLogic_1.Player("Dealer");
    player.draw(deck.draw());
    player.draw(deck.draw());
    dealer.draw(deck.draw());
    dealer.draw(deck.draw());
    res.json({
        player: {
            hand: player.showHand(),
            value: player.getHandValue(),
        },
        dealer: {
            visibleCard: dealer.hand[0].toString(),
            visibleValue: dealer.hand[0].getValue(),
        },
    });
});
// Player action endpoint
app.post("/action", (req, res) => {
    const { action } = req.body;
    if (action === "hit") {
        player.draw(deck.draw());
        if (player.hasBusted()) {
            res.json({
                result: "busted",
                player: {
                    hand: player.showHand(),
                    value: player.getHandValue(),
                },
                dealer: {
                    visibleCard: dealer.hand[0].toString(),
                    visibleValue: dealer.hand[0].getValue(),
                },
            });
            return;
        }
    }
    else if (action === "stand") {
        while (dealer.getHandValue() < 17) {
            dealer.draw(deck.draw());
        }
        res.json({
            result: determineWinner(player, dealer),
            player: {
                hand: player.showHand(),
                value: player.getHandValue(),
            },
            dealer: {
                hand: dealer.showHand(),
                value: dealer.getHandValue(),
            },
        });
        return;
    }
    res.json({
        player: {
            hand: player.showHand(),
            value: player.getHandValue(),
        },
        dealer: {
            visibleCard: dealer.hand[0].toString(),
            visibleValue: dealer.hand[0].getValue(),
        },
    });
});
function determineWinner(player, dealer) {
    if (dealer.hasBusted())
        return "dealer_busted";
    if (player.getHandValue() > dealer.getHandValue())
        return "player_wins";
    if (player.getHandValue() < dealer.getHandValue())
        return "dealer_wins";
    return "tie";
}
app.listen(3001, () => console.log("Server running on http://localhost:3001"));
