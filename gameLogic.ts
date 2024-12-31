class Card {
  suit: string;
  rank: string | number;
  suitEmoji: string;

  constructor(suit: string, rank: string | number) {
    this.suit = suit;
    this.rank = rank;
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

  toString(): string {
    return `${this.rank} ${this.suitEmoji}`;
  }

  getValue(): number {
    if (typeof this.rank === "number") return this.rank;
    if (this.rank === "A") return 11;
    return 10;
  }
}

class Deck {
  cards: Card[] = [];

  constructor() {
    for (let suit of ["hearts", "diamonds", "clubs", "spades"]) {
      for (let rank of [2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A"]) {
        this.cards.push(new Card(suit, rank));
      }
    }
    this.shuffle();
  }

  shuffle(): void {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  draw(): Card | undefined {
    return this.cards.pop();
  }
}

class Player {
  name: string;
  hand: Card[];

  constructor(name: string) {
    this.name = name;
    this.hand = [];
  }

  draw(card: Card): void {
    this.hand.push(card);
  }

  getHandValue(): number {
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
    while (value > 21 && aces > 0) {
      value -= 10;
      aces -= 1;
    }
    return value;
  }

  showHand(): string {
    return this.hand.map(card => card.toString()).join(", ");
  }

  hasBusted(): boolean {
    return this.getHandValue() > 21;
  }
}

export { Card, Deck, Player };

