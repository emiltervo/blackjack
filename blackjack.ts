import * as readline from "readline";

// Card Class
class Card {
  private suitEmoji: string;

  constructor(public suit: string, public rank: string | number) {
    this.suitEmoji = this.getSuitEmoji(suit);
  }

  private getSuitEmoji(suit: string): string {
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

  public toString(): string {
    return `${this.rank} ${this.suitEmoji}`;
  }

  public getValue(): number {
    if (typeof this.rank === "number") {
      return this.rank;
    } else if (this.rank === "A") {
      return 11;
    } else {
      return 10;
    }
  }
}

// Deck Class
class Deck {
  private cards: Card[] = [];
  constructor() {
    for (let suit of ["hearts", "diamonds", "clubs", "spades"]) {
      for (let rank of [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]) {
        this.cards.push(new Card(suit, rank));
      }
    }
  }

  public shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  public async animateShuffle() {
    const symbols = ["|", "/", "-", "\\"];
    for (let i = 0; i < 10; i++) {
      process.stdout.write(`\rShuffling cards... ${symbols[i % symbols.length]}`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    process.stdout.write("\rShuffling complete!             \n");
    this.shuffle();
  }

  public async dealCardAnimation(card: Card) {
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

  public draw(): Card | undefined {
    return this.cards.pop();
  }
}

// Player Class
class Player {
  private hand: Card[] = [];
  constructor(public name: string) { }
  public async draw(card: Card, deck: Deck) {
    await deck.dealCardAnimation(card);
    this.hand.push(card);
  }

  public getHandValue(): number {
    let value = 0;
    let aces = 0;
    for (const card of this.hand) {
      if (typeof card.rank === "number") {
        value += card.rank;
      } else if (card.rank === "A") {
        aces += 1;
        value += 11;
      } else {
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

  public showHand(): string {
    return this.hand.map(card => card.toString()).join(", ");
  }

  public getVisibleCard(): Card {
    return this.hand[0];
  }

  public hasBusted(): boolean {
    return this.getHandValue() > 21;
  }

  public resetHand() {
    this.hand = [];
  }
}

// Game Loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function prompt(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
}

function clearConsole() {
  console.clear(); // Clears the console screen
}

async function playGame(): Promise<boolean> {
  const deck = new Deck();
  const player = new Player("Player");
  const dealer = new Player("Dealer");

  await deck.animateShuffle();

  // Initial Draw
  await player.draw(deck.draw()!, deck);
  await player.draw(deck.draw()!, deck);
  await dealer.draw(deck.draw()!, deck);
  await dealer.draw(deck.draw()!, deck);

  while (true) {
    clearConsole();
    const dealerVisibleCard = dealer.getVisibleCard();
    console.log(
      `Dealer's visible card: ${dealerVisibleCard.toString()} (Value: ${dealerVisibleCard.getValue()})`
    );
    console.log(`Your hand: ${player.showHand()} (Value: ${player.getHandValue()})`);

    // Player Turn
    if (player.hasBusted()) {
      console.log("You busted! Dealer wins.");
      return await playAgainPrompt();
    }

    const action = await prompt("Do you want to (h)it or (s)tand? ");
    if (action.toLowerCase() === "h") {
      await player.draw(deck.draw()!, deck);
    } else if (action.toLowerCase() === "s") {
      break;
    } else {
      console.log("Invalid input. Please type 'h' to hit or 's' to stand.");
    }
  }

  // Dealer Turn
  while (dealer.getHandValue() < 17) {
    await dealer.draw(deck.draw()!, deck);
  }

  // Final Outcome
  clearConsole();
  console.log(`Final Hands:`);
  console.log(`Your hand: ${player.showHand()} (Value: ${player.getHandValue()})`);
  console.log(`Dealer's hand: ${dealer.showHand()} (Value: ${dealer.getHandValue()})`);

  if (dealer.hasBusted()) {
    console.log("Dealer busted! You win.");
  } else if (player.getHandValue() > dealer.getHandValue()) {
    console.log("You win!");
  } else if (player.getHandValue() < dealer.getHandValue()) {
    console.log("Dealer wins.");
  } else {
    console.log("It's a tie!");
  }

  return await playAgainPrompt();
}

async function playAgainPrompt(): Promise<boolean> {
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
