// Palabras de Impostor, agrupadas por temática.
//
// La temática no es decoración: es la pista que recibe el impostor. Eso cambia
// qué sirve como palabra y qué no. Criterios, sacados de cómo lo hacen los
// juegos del género (las cartas de tema de The Chameleon, las localizaciones de
// Spyfall):
//
//   1. Dentro de una temática, las palabras tienen que ser CONFUNDIBLES entre
//      sí, y tiene que haber MUCHAS. Con la temática en la mano el impostor
//      puede fingir, pero entre dos docenas de candidatas no puede acertar. Un
//      tema con cuatro opciones sería regalarle la respuesta.
//   2. Concretas y conocidas por toda la mesa. Nada de abstracciones ("aroma",
//      "contacto", "higiene"): no se puede dar una pista oblicua sobre eso.
//   3. Misma altura dentro del tema: todo cosas del mismo tipo y del mismo
//      grado de detalle. Ni "Pizza" junto a "comida italiana".
//   4. Cada palabra tiene que dar pie a varias pistas distintas (dónde se usa,
//      a qué suena, con quién se asocia), que es de lo que va el juego.
//   5. La temática nombra el conjunto sin colar la respuesta dentro.
//
// Al añadir un tema nuevo: 24 palabras como mínimo, y que ninguna se repita en
// otro tema (dos temas que comparten palabra rompen la pista).

export const wordThemes = [
    {
        theme: 'Comida rápida',
        words: [
            'Pizza', 'Hamburguesa', 'Kebab', 'Perrito caliente', 'Patatas fritas',
            'Nuggets de pollo', 'Burrito', 'Sushi', 'Sándwich mixto', 'Alitas de pollo',
            'Bocadillo de calamares', 'Empanadilla', 'Taco', 'Aros de cebolla',
            'Pollo frito', 'Fish and chips', 'Bocadillo de lomo', 'Wrap de pollo',
            'Noodles para llevar', 'Poke bowl', 'Falafel', 'Bagel', 'Panini',
            'Quesadilla', 'Pretzel', 'Batido de fresa',
        ],
    },
    {
        theme: 'Tapas y raciones',
        words: [
            'Tortilla de patata', 'Jamón ibérico', 'Croquetas', 'Boquerones en vinagre',
            'Pulpo a la gallega', 'Pimientos de padrón', 'Ensaladilla rusa',
            'Patatas bravas', 'Gambas al ajillo', 'Chorizo a la sidra', 'Queso manchego',
            'Rabas', 'Morcilla', 'Oreja a la plancha', 'Callos', 'Albóndigas',
            'Pincho moruno', 'Tabla de embutidos', 'Mejillones al vapor',
            'Almejas a la marinera', 'Huevos rotos', 'Setas al ajillo', 'Pan con tomate',
            'Anchoas del Cantábrico', 'Cecina', 'Torreznos',
        ],
    },
    {
        theme: 'Bebidas de fiesta',
        words: [
            'Cerveza', 'Calimocho', 'Sangría', 'Gin-tonic', 'Ron con cola', 'Vino tinto',
            'Sidra', 'Tequila', 'Orujo', 'Vermut', 'Whisky', 'Mojito', 'Cava',
            'Tinto de verano', 'Vodka', 'Ginebra', 'Absenta', 'Jägermeister', 'Baileys',
            'Pacharán', 'Licor de hierbas', 'Cerveza sin', 'Clara', 'Piña colada',
            'Caipiriña', 'Margarita', 'Daiquiri', 'Agua de Valencia',
        ],
    },
    {
        theme: 'Desayunos',
        words: [
            'Churros con chocolate', 'Tostada con aceite', 'Café con leche', 'Croissant',
            'Zumo de naranja', 'Cereales', 'Tortitas', 'Magdalenas', 'Colacao',
            'Bollo de leche', 'Yogur con fruta', 'Huevos revueltos', 'Porras',
            'Café solo', 'Cortado', 'Napolitana de chocolate', 'Bacon con huevos',
            'Tostada de aguacate', 'Té con leche', 'Batido de plátano', 'Bizcocho casero',
            'Sobao pasiego', 'Palmera de chocolate', 'Pan de molde con mermelada',
        ],
    },
    {
        theme: 'Postres y dulces',
        words: [
            'Tarta de queso', 'Flan', 'Helado', 'Natillas', 'Arroz con leche', 'Brownie',
            'Crema catalana', 'Gominolas', 'Tarta de manzana', 'Torrijas', 'Donut',
            'Gofre', 'Tiramisú', 'Mousse de chocolate', 'Profiteroles', 'Leche frita',
            'Buñuelos', 'Roscón de Reyes', 'Turrón', 'Polvorones', 'Nubes de azúcar',
            'Regaliz', 'Chupa Chups', 'Tarta de zanahoria', 'Coulant',
            'Sorbete de limón',
        ],
    },
    {
        theme: 'Animales de granja',
        words: [
            'Vaca', 'Cerdo', 'Gallina', 'Oveja', 'Cabra', 'Caballo', 'Burro', 'Pato',
            'Conejo', 'Ganso', 'Pavo', 'Perro pastor', 'Toro', 'Ternero', 'Potro',
            'Cordero', 'Cabrito', 'Lechón', 'Gallo', 'Pollito', 'Codorniz', 'Mula',
            'Buey', 'Yegua', 'Llama', 'Avestruz',
        ],
    },
    {
        theme: 'Animales del mar',
        words: [
            'Tiburón', 'Delfín', 'Pulpo', 'Medusa', 'Ballena', 'Tortuga marina',
            'Cangrejo', 'Pez payaso', 'Caballito de mar', 'Foca', 'Estrella de mar',
            'Calamar gigante', 'Orca', 'Manta', 'Morena', 'Erizo de mar', 'Langosta',
            'Sepia', 'Atún', 'Salmón', 'Sardina', 'Pez espada', 'Raya', 'Barracuda',
            'Nutria marina', 'León marino', 'Percebe', 'Anémona',
        ],
    },
    {
        theme: 'Animales salvajes',
        words: [
            'León', 'Elefante', 'Jirafa', 'Cocodrilo', 'Oso pardo', 'Lobo', 'Gorila',
            'Canguro', 'Tigre', 'Pingüino', 'Camello', 'Rinoceronte', 'Hipopótamo',
            'Cebra', 'Guepardo', 'Pantera', 'Chimpancé', 'Koala', 'Panda', 'Oso polar',
            'Zorro', 'Ciervo', 'Jabalí', 'Águila', 'Búho', 'Serpiente', 'Iguana',
            'Perezoso', 'Mapache', 'Suricata',
        ],
    },
    {
        theme: 'Bichos y sabandijas',
        words: [
            'Mosquito', 'Araña', 'Cucaracha', 'Abeja', 'Hormiga', 'Mariposa',
            'Escarabajo', 'Avispa', 'Ciempiés', 'Libélula', 'Mosca', 'Escorpión',
            'Grillo', 'Saltamontes', 'Mantis religiosa', 'Luciérnaga', 'Garrapata',
            'Pulga', 'Piojo', 'Termita', 'Oruga', 'Gusano', 'Caracol', 'Babosa',
            'Polilla', 'Mariquita',
        ],
    },
    {
        theme: 'Deportes',
        words: [
            'Fútbol', 'Baloncesto', 'Tenis', 'Natación', 'Ciclismo', 'Boxeo', 'Golf',
            'Atletismo', 'Balonmano', 'Pádel', 'Fórmula 1', 'Surf', 'Rugby', 'Voleibol',
            'Esquí', 'Snowboard', 'Patinaje sobre hielo', 'Escalada', 'Judo', 'Kárate',
            'Gimnasia rítmica', 'Halterofilia', 'Waterpolo', 'Hockey', 'Bádminton',
            'Ping-pong', 'Motociclismo', 'Piragüismo', 'Vela', 'Pelota vasca',
        ],
    },
    {
        theme: 'Instrumentos musicales',
        words: [
            'Guitarra eléctrica', 'Piano', 'Batería', 'Violín', 'Trompeta', 'Saxofón',
            'Acordeón', 'Flauta', 'Bajo', 'Gaita', 'Arpa', 'Pandereta', 'Contrabajo',
            'Clarinete', 'Trombón', 'Tuba', 'Armónica', 'Ukelele', 'Banjo',
            'Sintetizador', 'Órgano', 'Xilófono', 'Castañuelas', 'Cajón flamenco',
            'Maracas', 'Timbal',
        ],
    },
    {
        theme: 'Estilos de música',
        words: [
            'Rock', 'Reguetón', 'Flamenco', 'Heavy metal', 'Rap', 'Jazz', 'Techno',
            'Pop', 'Punk', 'Cumbia', 'Bachata', 'Ópera', 'Salsa', 'Merengue', 'Blues',
            'Country', 'Reggae', 'Funk', 'Disco', 'House', 'Trap', 'Indie', 'K-pop',
            'Bolero', 'Tango', 'Pasodoble', 'Copla', 'Ska',
        ],
    },
    {
        theme: 'Profesiones',
        words: [
            'Médico', 'Bombero', 'Profesor', 'Policía', 'Camarero', 'Fontanero',
            'Peluquero', 'Abogado', 'Piloto', 'Cocinero', 'Electricista', 'Basurero',
            'Veterinario', 'Panadero', 'Carnicero', 'Pescadero', 'Albañil', 'Carpintero',
            'Mecánico', 'Taxista', 'Enfermero', 'Dentista', 'Farmacéutico', 'Arquitecto',
            'Programador', 'Periodista', 'Cartero', 'Socorrista', 'Juez', 'Pastor',
        ],
    },
    {
        theme: 'Medios de transporte',
        words: [
            'Coche', 'Avión', 'Tren', 'Bicicleta', 'Moto', 'Autobús', 'Barco',
            'Patinete eléctrico', 'Helicóptero', 'Metro', 'Camión', 'Tractor', 'Tranvía',
            'Furgoneta', 'Caravana', 'Taxi', 'Ambulancia', 'Globo aerostático',
            'Teleférico', 'Submarino', 'Velero', 'Canoa', 'Monopatín', 'Quad', 'Trineo',
            'Cohete',
        ],
    },
    {
        theme: 'Sitios de una ciudad',
        words: [
            'Hospital', 'Biblioteca', 'Comisaría', 'Ayuntamiento', 'Mercado', 'Cine',
            'Gimnasio', 'Peluquería', 'Estación de tren', 'Bar de barrio', 'Farmacia',
            'Parque', 'Colegio', 'Iglesia', 'Museo', 'Teatro', 'Polideportivo',
            'Piscina municipal', 'Cementerio', 'Panadería', 'Quiosco', 'Gasolinera',
            'Aparcamiento', 'Centro comercial', 'Estanco', 'Ferretería', 'Frutería',
            'Lavandería', 'Oficina de correos', 'Parada de autobús',
        ],
    },
    {
        theme: 'Sitios de fiesta',
        words: [
            'Discoteca', 'Caseta de feria', 'Karaoke', 'Terraza', 'Festival de música',
            'Botellón', 'Bolera', 'Casino', 'Concierto', 'Barbacoa', 'Chiringuito',
            'After', 'Verbena', 'Peña', 'Bar de copas', 'Pub irlandés', 'Cotillón',
            'Cumpleaños sorpresa', 'Despedida de soltero', 'Romería', 'Charanga',
            'Fiesta de disfraces', 'Fiesta de la espuma', 'Recinto ferial',
        ],
    },
    {
        theme: 'Sitios de vacaciones',
        words: [
            'Playa', 'Camping', 'Hotel todo incluido', 'Crucero', 'Casa rural',
            'Parque de atracciones', 'Estación de esquí', 'Albergue', 'Balneario', 'Zoo',
            'Ruinas romanas', 'Parque nacional', 'Apartamento en la costa',
            'Hostal de carretera', 'Parador', 'Cabaña en el bosque', 'Resort', 'Spa',
            'Acuario', 'Safari', 'Bungaló', 'Casa de la abuela', 'Puerto deportivo',
            'Mirador', 'Templo budista', 'Mercadillo de artesanía',
        ],
    },
    {
        theme: 'Rincones de una casa',
        words: [
            'Cocina', 'Baño', 'Salón', 'Dormitorio', 'Garaje', 'Trastero', 'Sótano',
            'Buhardilla', 'Despensa', 'Pasillo', 'Recibidor', 'Cuarto de la plancha',
            'Comedor', 'Estudio', 'Vestidor', 'Aseo', 'Jardín', 'Porche', 'Azotea',
            'Balcón', 'Escalera', 'Portal', 'Ascensor', 'Bodega', 'Cuarto de invitados',
            'Altillo',
        ],
    },
    {
        theme: 'Cosas del baño',
        words: [
            'Cepillo de dientes', 'Toalla', 'Espejo', 'Secador', 'Papel higiénico',
            'Bañera', 'Báscula', 'Gel de ducha', 'Cuchilla de afeitar', 'Peine',
            'Cortina de ducha', 'Colonia', 'Pasta de dientes', 'Hilo dental',
            'Bastoncillos', 'Champú', 'Acondicionador', 'Desodorante',
            'Espuma de afeitar', 'Alfombrilla', 'Cisterna', 'Grifo', 'Lavabo',
            'Albornoz', 'Cortaúñas', 'Botiquín',
        ],
    },
    {
        theme: 'Cosas de la cocina',
        words: [
            'Sartén', 'Microondas', 'Nevera', 'Cuchillo', 'Batidora', 'Cafetera',
            'Horno', 'Tabla de cortar', 'Lavavajillas', 'Abrelatas', 'Olla a presión',
            'Tupperware', 'Cucharón', 'Espátula de silicona', 'Rallador', 'Colador',
            'Escurridor', 'Exprimidor', 'Tostadora', 'Freidora de aire',
            'Vitrocerámica', 'Campana extractora', 'Delantal', 'Trapo de cocina',
            'Papel de aluminio', 'Sacacorchos', 'Mortero', 'Molde de bizcocho',
        ],
    },
    {
        theme: 'Herramientas',
        words: [
            'Martillo', 'Destornillador', 'Taladro', 'Sierra', 'Alicates',
            'Cinta métrica', 'Llave inglesa', 'Nivel', 'Papel de lija', 'Soplete',
            'Cúter', 'Carretilla', 'Llave allen', 'Gato hidráulico', 'Formón',
            'Amoladora', 'Remachadora', 'Pistola de silicona', 'Brocha',
            'Rodillo de pintar', 'Escuadra', 'Plomada', 'Cincel', 'Tenazas', 'Caladora',
            'Escalera de tijera',
        ],
    },
    {
        theme: 'Cosas de un coche',
        words: [
            'Volante', 'Rueda de repuesto', 'Retrovisor', 'Cinturón', 'Maletero',
            'Limpiaparabrisas', 'Faro', 'Claxon', 'Freno de mano', 'Airbag', 'Matrícula',
            'Guantera', 'Capó', 'Batería del coche', 'Radiador', 'Embrague',
            'Palanca de cambios', 'Salpicadero', 'Parasol', 'Tubo de escape',
            'Ambientador de pino', 'Triángulo de emergencia', 'Chaleco reflectante',
            'Intermitente', 'Cuentakilómetros', 'Asiento del copiloto', 'Llanta',
            'Depósito de gasolina',
        ],
    },
    {
        theme: 'Apps del móvil',
        words: [
            'WhatsApp', 'Instagram', 'TikTok', 'YouTube', 'Spotify', 'Google Maps',
            'Netflix', 'Tinder', 'Twitch', 'Amazon', 'Wallapop', 'BlaBlaCar', 'Facebook',
            'Telegram', 'Gmail', 'Uber', 'Glovo', 'Booking', 'Airbnb', 'Duolingo',
            'Shazam', 'Waze', 'LinkedIn', 'Snapchat', 'Discord', 'Bizum',
        ],
    },
    {
        theme: 'Películas conocidas',
        words: [
            'Titanic', 'Jurassic Park', 'El Rey León', 'Matrix', 'Torrente',
            'Los Cazafantasmas', 'El Padrino', 'Toy Story', 'El Señor de los Anillos',
            'Regreso al futuro', 'Shrek', 'Gladiator', 'Harry Potter', 'Star Wars',
            'E.T.', 'Grease', 'Pretty Woman', 'Rocky', 'Alien', 'Forrest Gump',
            'El Sexto Sentido', 'Los Otros', 'Ocho apellidos vascos',
            'El día de la bestia', 'Frozen', 'Buscando a Nemo', 'Piratas del Caribe',
            'Mamma Mia',
        ],
    },
    {
        theme: 'Series conocidas',
        words: [
            'Los Simpson', 'Friends', 'Breaking Bad', 'Juego de Tronos',
            'Stranger Things', 'La Casa de Papel', 'The Office', 'Peaky Blinders',
            'Física o Química', 'Aquí no hay quien viva', 'Chernobyl', 'Black Mirror',
            'Cuéntame cómo pasó', 'La que se avecina', 'Médico de familia',
            'Los Serrano', 'El Internado', 'Vis a vis', 'Élite', 'Narcos', 'Perdidos',
            'Prison Break', 'Doctor House', 'CSI', 'Sexo en Nueva York', 'Los Soprano', 'Dark',
            'The Last of Us',
        ],
    },
    {
        theme: 'Dibujos de la infancia',
        words: [
            'Doraemon', 'Bola de Dragón', 'Shin Chan', 'Scooby-Doo', 'Los Picapiedra',
            'Tom y Jerry', 'Oliver y Benji', 'Digimon', 'Las Supernenas', 'Bob Esponja',
            'Heidi', 'Los Caballeros del Zodiaco', 'Los Pitufos', 'Inspector Gadget',
            'Chicho Terremoto', 'La Abeja Maya', 'David el Gnomo', 'Marco',
            'Los Fruittis', 'Sailor Moon', 'Pokémon', 'Ranma ½', 'Los Autos Locos',
            'Willy Fog', 'Popeye', 'Correcaminos',
        ],
    },
    {
        theme: 'Superhéroes',
        words: [
            'Superman', 'Batman', 'Spiderman', 'Iron Man', 'Hulk', 'Capitán América',
            'Thor', 'Lobezno', 'Deadpool', 'Viuda Negra', 'Aquaman', 'Wonder Woman',
            'Flash', 'Linterna Verde', 'Doctor Strange', 'Ojo de Halcón', 'Ant-Man',
            'Pantera Negra', 'Capitana Marvel', 'Robin', 'Catwoman', 'Tempestad',
            'Cíclope', 'Groot', 'Star-Lord', 'Daredevil',
        ],
    },
    {
        theme: 'Villanos del cine',
        words: [
            'Darth Vader', 'Joker', 'Voldemort', 'Thanos', 'Sauron', 'Cruella de Vil',
            'Terminator', 'Freddy Krueger', 'Pennywise', 'Hannibal Lecter', 'Maléfica',
            'Gargamel', 'Loki', 'Magneto', 'Bane', 'Scar', 'Úrsula', 'Jafar',
            'Norman Bates', 'Michael Myers', 'Chucky', 'Drácula', 'Green Goblin',
            'Lex Luthor', 'Bellatrix Lestrange', 'Emperador Palpatine',
        ],
    },
    {
        theme: 'Videojuegos',
        words: [
            'Minecraft', 'Fortnite', 'FIFA', 'Tetris', 'GTA', 'Mario Kart',
            'Candy Crush', 'League of Legends', 'Among Us', 'Call of Duty', 'The Sims',
            'Pokémon Go', 'Zelda', 'Animal Crossing', 'Fall Guys', 'Rocket League',
            'Clash Royale', 'Counter-Strike', 'Valorant', 'Roblox', 'Just Dance',
            'Guitar Hero', 'Angry Birds', 'Buscaminas', 'Solitario',
            'Pro Evolution Soccer',
        ],
    },
    {
        theme: 'Personajes de videojuegos',
        words: [
            'Mario', 'Sonic', 'Link', 'Pikachu', 'Lara Croft', 'Kratos', 'Pac-Man',
            'Master Chief', 'Donkey Kong', 'Crash Bandicoot', 'Yoshi', 'Sub-Zero',
            'Luigi', 'Bowser', 'Princesa Peach', 'Samus', 'Kirby', 'Ryu',
            'Solid Snake', 'Geralt de Rivia', 'Steve', 'Cuphead', 'Mega Man', 'Rayman',
            'Toad', 'Waluigi',
        ],
    },
    {
        theme: 'Juegos de mesa',
        words: [
            'Parchís', 'Monopoly', 'Ajedrez', 'Trivial', 'Uno', 'Jenga', 'Twister',
            'Pictionary', 'Risk', 'Dominó', 'Cluedo', 'Tabú', 'Damas', 'Oca',
            'Hundir la flota', 'Party & Co.', 'Catan', 'Carcassonne', 'Virus', 'Dixit',
            'Scrabble', 'Rummikub', 'Mikado', 'Operación', 'Quién es quién', 'Bingo',
        ],
    },
    {
        theme: 'Criaturas de leyenda',
        words: [
            'Vampiro', 'Hombre lobo', 'Fantasma', 'Zombi', 'Dragón', 'Sirena',
            'Unicornio', 'Yeti', 'Momia', 'Duende', 'Bruja', 'Kraken', 'Minotauro',
            'Centauro', 'Fénix', 'Pegaso', 'Gorgona', 'Troll', 'Ogro', 'Hada', 'Gnomo',
            'Basilisco', 'Quimera', 'Banshee', 'Hombre del saco', 'Nessie',
        ],
    },
    {
        theme: 'Asignaturas del colegio',
        words: [
            'Matemáticas', 'Lengua Castellana', 'Historia', 'Geografía',
            'Educación Física', 'Inglés', 'Francés', 'Química', 'Física', 'Filosofía',
            'Música', 'Plástica', 'Biología', 'Latín', 'Griego', 'Tecnología',
            'Religión', 'Ética', 'Informática', 'Economía', 'Dibujo Técnico',
            'Literatura', 'Ciencias Naturales', 'Conocimiento del Medio',
        ],
    },
    {
        theme: 'Partes del cuerpo',
        words: [
            'Rodilla', 'Codo', 'Oreja', 'Nariz', 'Lengua', 'Hombro', 'Tobillo', 'Ceja',
            'Muñeca', 'Espalda', 'Barbilla', 'Uña', 'Pestaña', 'Talón', 'Cadera',
            'Costilla', 'Ombligo', 'Rótula', 'Clavícula', 'Nuca', 'Mejilla', 'Frente',
            'Garganta', 'Pantorrilla', 'Dedo gordo', 'Cuero cabelludo', 'Axila',
            'Antebrazo', 'Empeine', 'Paladar',
        ],
    },
    {
        theme: 'Ropa',
        words: [
            'Vaqueros', 'Camiseta', 'Abrigo', 'Sudadera', 'Bañador', 'Calcetines',
            'Bufanda', 'Vestido', 'Zapatillas', 'Gorra', 'Corbata', 'Chanclas', 'Falda',
            'Camisa', 'Jersey', 'Chaqueta de cuero', 'Botas de montaña', 'Pijama',
            'Leggins', 'Chándal', 'Tirantes', 'Gafas de sol', 'Guantes de lana',
            'Gorro de lana', 'Pantalón corto', 'Blazer', 'Mono de trabajo',
            'Traje de chaqueta',
        ],
    },
    {
        theme: 'El tiempo que hace',
        words: [
            'Tormenta', 'Nieve', 'Niebla', 'Granizo', 'Ola de calor', 'Huracán',
            'Arcoíris', 'Sequía', 'Viento sur', 'Llovizna', 'Helada', 'Chubasco',
            'Tornado', 'Ventisca', 'Escarcha', 'Rocío', 'Bochorno', 'Calima', 'Galerna',
            'Tromba de agua', 'Aguanieve', 'Relámpago', 'Trueno', 'Borrasca',
            'Anticiclón', 'Gota fría',
        ],
    },
    {
        theme: 'Sitios de la naturaleza',
        words: [
            'Montaña', 'Selva', 'Bosque', 'Desierto', 'Río', 'Cueva', 'Volcán',
            'Glaciar', 'Pantano', 'Acantilado', 'Isla', 'Cascada', 'Duna', 'Cañón',
            'Lago', 'Manantial', 'Marisma', 'Arrecife', 'Valle', 'Meseta', 'Estepa',
            'Fiordo', 'Oasis', 'Sabana', 'Tundra', 'Laguna',
        ],
    },
    {
        theme: 'Cosas del espacio',
        words: [
            'Luna', 'Sol', 'Marte', 'Saturno', 'Cometa', 'Agujero negro',
            'Estación espacial', 'Galaxia', 'Asteroide', 'Eclipse', 'Vía Láctea',
            'Satélite', 'Júpiter', 'Venus', 'Mercurio', 'Neptuno', 'Plutón', 'Nebulosa',
            'Supernova', 'Meteorito', 'Constelación', 'Telescopio',
            'Traje de astronauta', 'Estrella polar', 'Sonda espacial', 'Lluvia de estrellas',
        ],
    },
    {
        theme: 'Monumentos del mundo',
        words: [
            'Torre Eiffel', 'Pirámides de Egipto', 'Coliseo', 'Estatua de la Libertad',
            'Muralla China', 'Taj Mahal', 'Sagrada Familia', 'Big Ben', 'Machu Picchu',
            'Cristo Redentor', 'Stonehenge', 'Torre de Pisa', 'Acrópolis', 'Petra',
            'Chichén Itzá', 'Alhambra', 'Acueducto de Segovia', 'Ópera de Sídney',
            'Golden Gate', 'Kremlin', 'Mezquita de Córdoba', 'Monte Rushmore',
            'Empire State', 'Puerta de Brandeburgo', 'Angkor Wat',
            'Moáis de Pascua',
        ],
    },
    {
        theme: 'Países',
        words: [
            'España', 'Japón', 'Brasil', 'Egipto', 'Italia', 'Estados Unidos',
            'Australia', 'México', 'Marruecos', 'Rusia', 'India', 'Alemania', 'Francia',
            'Portugal', 'Reino Unido', 'China', 'Argentina', 'Canadá', 'Grecia',
            'Turquía', 'Noruega', 'Islandia', 'Sudáfrica', 'Cuba', 'Perú', 'Tailandia',
            'Corea del Sur', 'Irlanda', 'Suiza', 'Nueva Zelanda',
        ],
    },
    {
        theme: 'Ciudades de España',
        words: [
            'Madrid', 'Barcelona', 'Sevilla', 'Bilbao', 'Valencia', 'Santander',
            'Zaragoza', 'Granada', 'Santiago de Compostela', 'Salamanca', 'Málaga',
            'San Sebastián', 'Toledo', 'Córdoba', 'Oviedo', 'Valladolid', 'Murcia',
            'Alicante', 'Vigo', 'Gijón', 'Pamplona', 'Cádiz', 'Burgos', 'Palma',
            'Santa Cruz de Tenerife', 'Cuenca',
        ],
    },
    {
        theme: 'Fiestas y tradiciones',
        words: [
            'Nochevieja', 'San Juan', 'Carnaval', 'Semana Santa', 'Halloween', 'Reyes',
            'Sanfermines', 'La Tomatina', 'Feria de Abril', 'Navidad', 'Fallas',
            'Oktoberfest', 'Nochebuena', 'Día de Muertos', 'Año Nuevo Chino',
            'San Valentín', 'Día del Padre', 'Día de la Madre', 'Corpus Christi',
            'Semana Grande', 'Descenso del Sella', 'Batalla del Vino', 'Castellers',
            'Romería del Rocío', 'Fin de curso', 'Día de Todos los Santos',
        ],
    },
    {
        theme: 'Cosas de una boda',
        words: [
            'Vestido de novia', 'Anillo', 'Tarta nupcial', 'Ramo', 'Cura', 'Fotógrafo',
            'Banquete', 'Primer baile', 'Discurso del padrino', 'Arroz', 'Limusina',
            'Lista de regalos', 'Altar', 'Invitación', 'Velo', 'Damas de honor',
            'Barra libre', 'Liga de la novia', 'Cóctel de bienvenida',
            'Mesa presidencial', 'Libro de firmas', 'Puro', 'Chaqué', 'Confeti',
        ],
    },
];

/** Un tema y una palabra suya al azar: `{ theme, word }`. */
export function randomTopic() {
    const topic = wordThemes[Math.floor(Math.random() * wordThemes.length)];
    return {
        theme: topic.theme,
        word: topic.words[Math.floor(Math.random() * topic.words.length)],
    };
}
