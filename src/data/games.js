import {
    Flame, Eye, Crown, Spade, Disc3, VenetianMask,
    Dice5, Triangle, Skull, Palette,
} from 'lucide-react';

// Definición única de los 10 modos de juego.
//
// `color` es la línea de firma, el kicker de la cabecera y el borde del botón
// principal de esa partida; `glow` es el halo radial de la tarjeta; `kicker` es
// la versión aclarada que llega a contraste sobre el fondo oscuro.
// `min` es el mínimo de jugadores y `size` el tamaño de tarjeta en la rejilla.
export const games = [
    {
        id: 'yonunca',
        route: '/game/yonunca',
        name: 'Yo Nunca',
        tagline: 'Confiesa lo que nunca has hecho',
        color: '#E2572B',
        glow: 'rgba(226, 87, 43, 0.22)',
        kicker: '#E2572B',
        icon: Flame,
        min: 0,
        size: 'wide',
        help: [
            'Va saliendo una frase que empieza por «Yo nunca...». Si alguna vez lo has hecho, bebes — así de simple.',
            'No hay turnos ni ganadores: es solo ir tirando frases hasta que a alguien se le acabe la vergüenza. Si las que trae la app no te convencen, puedes editarlas.',
        ],
    },
    {
        id: 'medusa',
        route: '/game/medusa',
        name: 'Medusa',
        tagline: 'No cruces la mirada',
        color: '#2E9E8F',
        glow: 'rgba(46, 158, 143, 0.2)',
        kicker: '#5FC3B4',
        icon: Eye,
        min: 0,
        size: 'std',
        help: [
            'Todos bajáis la cabeza. Cuando alguien pulse «Empezar», la app cuenta 3, 2, 1 y muestra «¡Mirad!».',
            'En ese momento levantáis la vista a la vez y elegís a quién mirar. Si te cruzas con los ojos de otro jugador, los dos bebéis. Esto va de honor: la app no controla quién ha mirado a quién.',
        ],
    },
    {
        id: 'reydecopas',
        route: '/game/reydecopas',
        name: 'Rey de Copas',
        tagline: 'La baraja manda',
        color: '#C9862E',
        glow: 'rgba(201, 134, 46, 0.2)',
        kicker: '#D8B45E',
        icon: Crown,
        min: 1,
        size: 'std',
        help: [
            'Cada uno saca una carta por turnos y hace lo que diga la regla de esa carta — la tienes explicada en pantalla en cuanto la sacas.',
            'El Rey es la carta especial: cada vez que sale uno, quien lo sacó vierte un poco de su bebida en el vaso central. El que saque el cuarto Rey se bebe el vaso entero.',
        ],
    },
    {
        id: 'picopalo',
        route: '/game/picopalo',
        name: 'Pico Palo',
        tagline: 'Cinco fases, una carta cada vez',
        color: '#3F5D9E',
        glow: 'rgba(63, 93, 158, 0.2)',
        kicker: '#8FA8DE',
        icon: Spade,
        min: 1,
        size: 'row',
        help: [
            'Cinco fases con cada carta: rojo o negro, par o impar, dentro o fuera del rango de tus dos cartas, el palo exacto y, al final, mayor o menor.',
            'Fallar en las cuatro primeras cuesta un trago suelto. La ronda final es la que importa: si fallas ahí, bebes y tu secuencia se reinicia.',
        ],
    },
    {
        id: 'impostor',
        route: '/game/impostor',
        name: 'Impostor',
        tagline: '¿Quién es el infiltrado?',
        color: '#6E56CF',
        glow: 'rgba(110, 86, 207, 0.22)',
        kicker: '#b5abfc',
        icon: VenetianMask,
        min: 3,
        size: 'std',
        help: [
            'Todos recibís la misma palabra secreta... excepto uno, el impostor, que solo recibe la temática de la que sale esa palabra: «bebidas de fiesta», «animales del mar», «villanos del cine». Con eso puede fingir, pero hay doce candidatas por tema, así que no la sabe.',
            'El móvil va pasando de mano en mano: cada jugador mantiene pulsado para ver lo suyo y se lo pasa al siguiente. Luego describís la palabra por turnos con pistas, sin decirla. La temática la veis todos, así que ojo con las pistas demasiado fáciles.',
            'Cuando queráis acusar a alguien, tocad su nombre y confirmad. Si es el impostor, bebe. Si no, esa persona queda eliminada y la partida sigue.',
        ],
    },
    {
        id: 'illuminati',
        route: '/game/illuminati',
        name: 'Illuminati',
        tagline: 'Escala la pirámide',
        color: '#8B6F1F',
        glow: 'rgba(139, 111, 31, 0.2)',
        kicker: '#D8B45E',
        icon: Triangle,
        min: 1,
        size: 'std',
        help: [
            'Pirámide de cartas boca abajo: 5 abajo, 1 en la punta. Destapas una de la fila inferior y luego vas subiendo adivinando si la siguiente es mayor o menor.',
            'Si aciertas, subes. Si fallas, bebes según lo lejos que hayas llegado y pasa el turno. Llegar a la punta gana la ronda.',
        ],
    },
    {
        id: 'ruleta',
        route: '/game/ruleta',
        name: 'Ruleta',
        tagline: 'Gira y prueba tu suerte',
        color: '#2F8F5B',
        glow: 'rgba(47, 143, 91, 0.2)',
        kicker: '#6BC490',
        icon: Disc3,
        min: 1,
        size: 'row',
        help: [
            'Gira la ruleta y bebe lo que te toque, tal cual pone en la casilla.',
            'Puedes editar el texto de las casillas a tu gusto, y añadir o quitar — siempre en número par, entre 10 y 20.',
        ],
    },
    {
        id: 'dados',
        route: '/game/dados',
        name: 'Dados de Beber',
        tagline: 'Tira y bebe',
        color: '#3F8CD9',
        glow: 'rgba(63, 140, 217, 0.2)',
        kicker: '#7FB4EC',
        icon: Dice5,
        min: 1,
        size: 'std',
        help: [
            'Turno por turno, cada uno lanza los dos dados y la suma decide qué toca.',
            '1-1: dos tragos para ti. 6-6: todos beben. Otro doble: te inventas una regla. Suma 7: el último en tocarse la nariz. Suma 3: bebes tú. 9 y 10: izquierda y derecha. Suma 11: eliges a alguien para que beba 2. El resto de sumas: repartes tragos.',
        ],
    },
    {
        id: 'asesino',
        route: '/game/asesino',
        name: 'Asesino',
        tagline: 'Un asesino, un policía, el resto ciudadanos',
        color: '#A31E28',
        glow: 'rgba(163, 30, 40, 0.22)',
        kicker: '#E58089',
        icon: Skull,
        min: 5,
        size: 'std',
        help: [
            'Se reparten roles en secreto: un Asesino, un Policía y el resto Ciudadanos. El móvil pasa de mano en mano y cada uno ve su rol sin que los demás miren.',
            'Luego el Asesino va guiñando el ojo a los Ciudadanos sin que el Policía se dé cuenta. Si te guiñan, esperas unos segundos y bebes; a la tercera quedas eliminado.',
            'El Policía gana si señala al Asesino. El Asesino gana si elimina a la mitad. La app solo reparte los roles: el resto lo lleváis vosotros.',
        ],
    },
    {
        id: 'trazotrago',
        route: '/game/trazotrago',
        name: 'Trazo & Trago',
        tagline: 'Dibuja, adivina, bebe',
        color: '#C23FA0',
        glow: 'rgba(194, 63, 160, 0.2)',
        kicker: '#E274C0',
        icon: Palette,
        min: 0,
        size: 'row',
        help: [
            'Te toca dibujar una palabra y que los demás la adivinen, sin hablar ni escribir letras o números. Tienes 90 segundos.',
            'Cuanto más tardes en que la adivinen, más tragos bebes: uno si acabas rápido, hasta tres si se te echa el tiempo encima. El que dibuja es quien paga.',
        ],
    },
];

export const gameById = games.reduce((acc, g) => ({ ...acc, [g.id]: g }), {});

export default games;
