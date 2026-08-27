// Baraja española... digo, francesa (52 cartas, 4 palos) compartida por los
// tres juegos que usan cartas: Rey de Copas, Pico Palo e Illuminati. Antes
// cada uno generaba la suya por su cuenta, con su propio glifo de palo y su
// propio cálculo de rojo/negro — de ahí que las cartas se vieran distintas de
// un juego a otro sin ningún motivo. Una sola baraja, un solo criterio de
// color.

// Glifos monocromos (no emoji) para poder pintarlos en rojo o negro sobre el
// papel claro de la carta.
export const suits = [
    { symbol: '♠', red: false },
    { symbol: '♥', red: true },
    { symbol: '♦', red: true },
    { symbol: '♣', red: false },
];

export const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

/** Rojo y negro de las cartas sobre papel claro. */
export const cardInk = (red) => (red ? '#b0343c' : '#22242e');

/** Baraja completa de 52 cartas: `{ value, suit, red, n }`, `n` = 1 (As) a 13 (Rey). */
export const generateDeck = () => {
    const deck = [];
    suits.forEach(({ symbol, red }) => {
        values.forEach((value, index) => {
            deck.push({ value, suit: symbol, red, n: index + 1 });
        });
    });
    return deck;
};

/** Fisher-Yates: cada permutación es igual de probable, a diferencia de ordenar por un comparador aleatorio. */
export const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
