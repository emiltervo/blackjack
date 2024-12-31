import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";
import { Deck, Player } from "./gameLogic";

const app = express();
app.use(cors());
app.use(express.json());

let deck: Deck, player: Player, dealer: Player;

// Define the shape of req.body
interface ActionRequestBody {
  action: "hit" | "stand";
}

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "../public")));

// Root endpoint to serve index.html
app.get("/", (req: Request, res: Response): void => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Start the game
app.get("/start", (req: Request, res: Response): void => {
  deck = new Deck();
  player = new Player("Player");
  dealer = new Player("Dealer");

  player.draw(deck.draw()!);
  player.draw(deck.draw()!);
  dealer.draw(deck.draw()!);
  dealer.draw(deck.draw()!);

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
app.post("/action", (req: Request, res: Response): void => {
  const { action } = req.body;

  if (action === "hit") {
    player.draw(deck.draw()!);
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
  } else if (action === "stand") {
    while (dealer.getHandValue() < 17) {
      dealer.draw(deck.draw()!);
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




function determineWinner(player: Player, dealer: Player): string {
  if (dealer.hasBusted()) return "dealer_busted";
  if (player.getHandValue() > dealer.getHandValue()) return "player_wins";
  if (player.getHandValue() < dealer.getHandValue()) return "dealer_wins";
  return "tie";
}

app.listen(3001, () => console.log("Server running on http://localhost:3001"));
