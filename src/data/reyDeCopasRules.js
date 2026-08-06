// Reglas del juego Rey de Copas (King's Cup)
import {
    Waves, Pointer, Hand, Venus, ClipboardList, Mars, ArrowUp,
    Handshake, Music, Crown, ThumbsUp, MessageCircleQuestion, Beer,
} from 'lucide-react';

export const cardRules = {
    'A': {
        name: 'As',
        icon: Waves,
        rule: 'Cascada',
        description: 'Todos beben. Empieza el que sacó la carta y cada uno puede parar cuando el anterior pare.',
    },
    '2': {
        name: '2',
        icon: Pointer,
        rule: 'Tú eliges',
        description: 'Elige a alguien para que beba.',
    },
    '3': {
        name: '3',
        icon: Hand,
        rule: 'Yo bebo',
        description: 'El que sacó la carta bebe.',
    },
    '4': {
        name: '4',
        icon: Venus,
        rule: 'Chicas beben',
        description: 'Todas las chicas beben.',
    },
    '5': {
        name: '5',
        icon: ClipboardList,
        rule: 'Categorías',
        description: 'Di una categoría. Todos dicen ejemplos por turnos. El primero que no pueda, bebe.',
    },
    '6': {
        name: '6',
        icon: Mars,
        rule: 'Chicos beben',
        description: 'Todos los chicos beben.',
    },
    '7': {
        name: '7',
        icon: ArrowUp,
        rule: 'Cielo',
        description: 'Todos apuntan al cielo. El último en hacerlo bebe.',
    },
    '8': {
        name: '8',
        icon: Handshake,
        rule: 'Compañero',
        description: 'Elige un compañero de bebida. Cuando tú bebas, él/ella bebe también.',
    },
    '9': {
        name: '9',
        icon: Music,
        rule: 'Rima',
        description: 'Di una palabra. Todos deben decir palabras que rimen. El primero que no pueda, bebe.',
    },
    '10': {
        name: '10',
        icon: Crown,
        rule: 'Maestro',
        description: 'Crea una nueva regla que todos deben seguir. Quien la rompa, bebe.',
    },
    'J': {
        name: 'Jota',
        icon: ThumbsUp,
        rule: 'Pulgar',
        description: 'Pon tu pulgar en la mesa en cualquier momento. Todos deben imitarte. El último bebe.',
    },
    'Q': {
        name: 'Reina',
        icon: MessageCircleQuestion,
        rule: 'Pregunta',
        description: 'Haz una pregunta a alguien. Si responde, bebe. Solo puede responder con otra pregunta.',
    },
    'K': {
        name: 'Rey',
        icon: Beer,
        rule: 'Rey de Copas',
        description: 'Vierte parte de tu bebida en la copa central. El que saque el 4º rey, bebe todo.',
    },
};

export const suits = ['♠️', '♥️', '♦️', '♣️'];
export const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Generar baraja completa
export const generateDeck = () => {
    const deck = [];
    suits.forEach(suit => {
        values.forEach(value => {
            deck.push({ value, suit });
        });
    });
    return deck;
};

// Mezclar baraja
export const shuffleDeck = (deck) => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};
