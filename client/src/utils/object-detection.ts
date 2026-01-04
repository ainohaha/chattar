import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

// Define translations for common object names
// These are the 80 classes from COCO dataset that coco-ssd can detect
const objectTranslations: Record<string, Record<string, string>> = {
  fi: {
    // Person
    person: "Henkilö",
    
    // Animals
    bird: "Lintu",
    cat: "Kissa",
    dog: "Koira",
    horse: "Hevonen",
    sheep: "Lammas",
    cow: "Lehmä",
    elephant: "Norsu",
    bear: "Karhu",
    zebra: "Seepra",
    giraffe: "Kirahvi",
    
    // Vehicles
    bicycle: "Polkupyörä",
    car: "Auto",
    motorcycle: "Moottoripyörä",
    airplane: "Lentokone",
    bus: "Bussi",
    train: "Juna",
    truck: "Kuorma-auto",
    boat: "Vene",
    
    // Common items
    chair: "Tuoli",
    couch: "Sohva",
    potted_plant: "Ruukkukasvi",
    bed: "Sänky",
    dining_table: "Ruokapöytä",
    toilet: "WC",
    tv: "Televisio",
    laptop: "Kannettava tietokone",
    mouse: "Hiiri",
    remote: "Kaukosäädin",
    keyboard: "Näppäimistö",
    cell_phone: "Matkapuhelin",
    microwave: "Mikroaaltouuni",
    oven: "Uuni",
    toaster: "Leivänpaahdin",
    sink: "Pesuallas",
    refrigerator: "Jääkaappi",
    book: "Kirja",
    clock: "Kello",
    vase: "Maljakko",
    scissors: "Sakset",
    teddy_bear: "Nallekarhu",
    hair_drier: "Hiustenkuivaaja",
    toothbrush: "Hammasharja",
    
    // Food items
    banana: "Banaani",
    apple: "Omena",
    sandwich: "Voileipä",
    orange: "Appelsiini",
    broccoli: "Parsakaali",
    carrot: "Porkkana",
    hot_dog: "Hodari",
    pizza: "Pizza",
    donut: "Donitsi",
    cake: "Kakku",
    
    // Kitchen items
    bottle: "Pullo",
    wine_glass: "Viinilasi",
    cup: "Kuppi",
    fork: "Haarukka",
    knife: "Veitsi",
    spoon: "Lusikka",
    bowl: "Kulho",
    
    // Clothing/Personal items
    backpack: "Reppu",
    umbrella: "Sateenvarjo",
    handbag: "Käsilaukku",
    tie: "Solmio",
    suitcase: "Matkalaukku",
    
    // Sports items
    frisbee: "Frisbee",
    skis: "Sukset",
    snowboard: "Lumilevy",
    sports_ball: "Urheilupallo",
    kite: "Leija",
    baseball_bat: "Pesäpallomaila",
    baseball_glove: "Pesäpallohanska",
    skateboard: "Rullalauta",
    surfboard: "Surffilauta",
    tennis_racket: "Tennismaila",
    
    // Other
    traffic_light: "Liikennevalo",
    fire_hydrant: "Paloposti",
    stop_sign: "Stop-merkki",
    parking_meter: "Pysäköintimittari",
    bench: "Penkki"
  },
  ru: {
    // Person
    person: "Человек",
    
    // Animals
    bird: "Птица",
    cat: "Кошка",
    dog: "Собака",
    horse: "Лошадь",
    sheep: "Овца",
    cow: "Корова",
    elephant: "Слон",
    bear: "Медведь",
    zebra: "Зебра",
    giraffe: "Жираф",
    
    // Vehicles
    bicycle: "Велосипед",
    car: "Машина",
    motorcycle: "Мотоцикл",
    airplane: "Самолёт",
    bus: "Автобус",
    train: "Поезд",
    truck: "Грузовик",
    boat: "Лодка",
    
    // Common items
    chair: "Стул",
    couch: "Диван",
    potted_plant: "Горшечное растение",
    bed: "Кровать",
    dining_table: "Обеденный стол",
    toilet: "Туалет",
    tv: "Телевизор",
    laptop: "Ноутбук",
    mouse: "Мышь",
    remote: "Пульт",
    keyboard: "Клавиатура",
    cell_phone: "Мобильный телефон",
    microwave: "Микроволновка",
    oven: "Духовка",
    toaster: "Тостер",
    sink: "Раковина",
    refrigerator: "Холодильник",
    book: "Книга",
    clock: "Часы",
    vase: "Ваза",
    scissors: "Ножницы",
    teddy_bear: "Плюшевый мишка",
    hair_drier: "Фен",
    toothbrush: "Зубная щётка",
    
    // Food items
    banana: "Банан",
    apple: "Яблоко",
    sandwich: "Сэндвич",
    orange: "Апельсин",
    broccoli: "Брокколи",
    carrot: "Морковь",
    hot_dog: "Хот-дог",
    pizza: "Пицца",
    donut: "Пончик",
    cake: "Торт",
    
    // Kitchen items
    bottle: "Бутылка",
    wine_glass: "Бокал",
    cup: "Чашка",
    fork: "Вилка",
    knife: "Нож",
    spoon: "Ложка",
    bowl: "Миска",
    
    // Clothing/Personal items
    backpack: "Рюкзак",
    umbrella: "Зонт",
    handbag: "Сумочка",
    tie: "Галстук",
    suitcase: "Чемодан",
    
    // Sports items
    frisbee: "Фрисби",
    skis: "Лыжи",
    snowboard: "Сноуборд",
    sports_ball: "Спортивный мяч",
    kite: "Воздушный змей",
    baseball_bat: "Бейсбольная бита",
    baseball_glove: "Бейсбольная перчатка",
    skateboard: "Скейтборд",
    surfboard: "Доска для сёрфинга",
    tennis_racket: "Теннисная ракетка",
    
    // Other
    traffic_light: "Светофор",
    fire_hydrant: "Пожарный гидрант",
    stop_sign: "Знак стоп",
    parking_meter: "Парковочный счётчик",
    bench: "Скамейка"
  },
  fr: {
    // Person
    person: "Personne",
    
    // Animals
    bird: "Oiseau",
    cat: "Chat",
    dog: "Chien",
    horse: "Cheval",
    sheep: "Mouton",
    cow: "Vache",
    elephant: "Éléphant",
    bear: "Ours",
    zebra: "Zèbre",
    giraffe: "Girafe",
    
    // Vehicles
    bicycle: "Vélo",
    car: "Voiture",
    motorcycle: "Moto",
    airplane: "Avion",
    bus: "Bus",
    train: "Train",
    truck: "Camion",
    boat: "Bateau",
    
    // Common items
    chair: "Chaise",
    couch: "Canapé",
    potted_plant: "Plante en pot",
    bed: "Lit",
    dining_table: "Table à manger",
    toilet: "Toilettes",
    tv: "Télévision",
    laptop: "Ordinateur portable",
    mouse: "Souris",
    remote: "Télécommande",
    keyboard: "Clavier",
    cell_phone: "Téléphone portable",
    microwave: "Micro-ondes",
    oven: "Four",
    toaster: "Grille-pain",
    sink: "Évier",
    refrigerator: "Réfrigérateur",
    book: "Livre",
    clock: "Horloge",
    vase: "Vase",
    scissors: "Ciseaux",
    teddy_bear: "Ours en peluche",
    hair_drier: "Sèche-cheveux",
    toothbrush: "Brosse à dents",
    
    // Food items
    banana: "Banane",
    apple: "Pomme",
    sandwich: "Sandwich",
    orange: "Orange",
    broccoli: "Brocoli",
    carrot: "Carotte",
    hot_dog: "Hot-dog",
    pizza: "Pizza",
    donut: "Beignet",
    cake: "Gâteau",
    
    // Kitchen items
    bottle: "Bouteille",
    wine_glass: "Verre à vin",
    cup: "Tasse",
    fork: "Fourchette",
    knife: "Couteau",
    spoon: "Cuillère",
    bowl: "Bol",
    
    // Clothing/Personal items
    backpack: "Sac à dos",
    umbrella: "Parapluie",
    handbag: "Sac à main",
    tie: "Cravate",
    suitcase: "Valise",
    
    // Sports items
    frisbee: "Frisbee",
    skis: "Skis",
    snowboard: "Snowboard",
    sports_ball: "Ballon de sport",
    kite: "Cerf-volant",
    baseball_bat: "Batte de baseball",
    baseball_glove: "Gant de baseball",
    skateboard: "Planche à roulettes",
    surfboard: "Planche de surf",
    tennis_racket: "Raquette de tennis",
    
    // Other
    traffic_light: "Feu de circulation",
    fire_hydrant: "Bouche d'incendie",
    stop_sign: "Panneau stop",
    parking_meter: "Parcmètre",
    bench: "Banc"
  },
  es: {
    // Person
    person: "Persona",
    
    // Animals
    bird: "Pájaro",
    cat: "Gato",
    dog: "Perro",
    horse: "Caballo",
    sheep: "Oveja",
    cow: "Vaca",
    elephant: "Elefante",
    bear: "Oso",
    zebra: "Cebra",
    giraffe: "Jirafa",
    
    // Vehicles
    bicycle: "Bicicleta",
    car: "Coche",
    motorcycle: "Motocicleta",
    airplane: "Avión",
    bus: "Autobús",
    train: "Tren",
    truck: "Camión",
    boat: "Barco",
    
    // Common items
    chair: "Silla",
    couch: "Sofá",
    potted_plant: "Planta en maceta",
    bed: "Cama",
    dining_table: "Mesa de comedor",
    toilet: "Inodoro",
    tv: "Televisión",
    laptop: "Portátil",
    mouse: "Ratón",
    remote: "Control remoto",
    keyboard: "Teclado",
    cell_phone: "Teléfono móvil",
    microwave: "Microondas",
    oven: "Horno",
    toaster: "Tostadora",
    sink: "Fregadero",
    refrigerator: "Refrigerador",
    book: "Libro",
    clock: "Reloj",
    vase: "Florero",
    scissors: "Tijeras",
    teddy_bear: "Osito de peluche",
    hair_drier: "Secador de pelo",
    toothbrush: "Cepillo de dientes",
    
    // Food items
    banana: "Plátano",
    apple: "Manzana",
    sandwich: "Sándwich",
    orange: "Naranja",
    broccoli: "Brócoli",
    carrot: "Zanahoria",
    hot_dog: "Perrito caliente",
    pizza: "Pizza",
    donut: "Dona",
    cake: "Pastel",
    
    // Kitchen items
    bottle: "Botella",
    wine_glass: "Copa de vino",
    cup: "Taza",
    fork: "Tenedor",
    knife: "Cuchillo",
    spoon: "Cuchara",
    bowl: "Tazón",
    
    // Clothing/Personal items
    backpack: "Mochila",
    umbrella: "Paraguas",
    handbag: "Bolso",
    tie: "Corbata",
    suitcase: "Maleta",
    
    // Sports items
    frisbee: "Frisbee",
    skis: "Esquís",
    snowboard: "Snowboard",
    sports_ball: "Pelota deportiva",
    kite: "Cometa",
    baseball_bat: "Bate de béisbol",
    baseball_glove: "Guante de béisbol",
    skateboard: "Monopatín",
    surfboard: "Tabla de surf",
    tennis_racket: "Raqueta de tenis",
    
    // Other
    traffic_light: "Semáforo",
    fire_hydrant: "Hidrante",
    stop_sign: "Señal de alto",
    parking_meter: "Parquímetro",
    bench: "Banco"
  }
};

// Example sentences for common objects
const objectExampleSentences: Record<string, Record<string, {original: string, translated: string}>> = {
  fi: {
    // Select common objects with example sentences
    person: {
      original: "Henkilö kävelee kadulla.",
      translated: "The person is walking on the street."
    },
    cat: {
      original: "Kissa nukkuu sohvalla.",
      translated: "The cat is sleeping on the couch."
    },
    dog: {
      original: "Koira leikkii pallolla.",
      translated: "The dog is playing with a ball."
    },
    chair: {
      original: "Istu tuolille.",
      translated: "Sit on the chair."
    },
    book: {
      original: "Luen kirjaa.",
      translated: "I am reading a book."
    },
    car: {
      original: "Auto on punainen.",
      translated: "The car is red."
    },
    cup: {
      original: "Juo kupista.",
      translated: "Drink from the cup."
    },
    laptop: {
      original: "Työskentelen kannettavalla tietokoneella.",
      translated: "I am working on a laptop."
    },
    clock: {
      original: "Kello näyttää kolmea.",
      translated: "The clock shows three o'clock."
    },
    phone: {
      original: "Puhun puhelimessa.",
      translated: "I am talking on the phone."
    },
    cell_phone: {
      original: "Missä on matkapuhelimeni?",
      translated: "Where is my cell phone?"
    }
  },
  ru: {
    cat: {
      original: "Кошка спит на диване.",
      translated: "The cat is sleeping on the couch."
    },
    dog: {
      original: "Собака играет с мячом.",
      translated: "The dog is playing with a ball."
    },
    chair: {
      original: "Сядь на стул.",
      translated: "Sit on the chair."
    },
    book: {
      original: "Я читаю книгу.",
      translated: "I am reading a book."
    },
    car: {
      original: "Машина красная.",
      translated: "The car is red."
    },
    cup: {
      original: "Пей из чашки.",
      translated: "Drink from the cup."
    },
    laptop: {
      original: "Я работаю на ноутбуке.",
      translated: "I am working on a laptop."
    },
    cell_phone: {
      original: "Где мой телефон?",
      translated: "Where is my cell phone?"
    }
  },
  fr: {
    cat: {
      original: "Le chat dort sur le canapé.",
      translated: "The cat is sleeping on the couch."
    },
    dog: {
      original: "Le chien joue avec une balle.",
      translated: "The dog is playing with a ball."
    },
    chair: {
      original: "Asseyez-vous sur la chaise.",
      translated: "Sit on the chair."
    },
    book: {
      original: "Je lis un livre.",
      translated: "I am reading a book."
    },
    car: {
      original: "La voiture est rouge.",
      translated: "The car is red."
    },
    cup: {
      original: "Buvez dans la tasse.",
      translated: "Drink from the cup."
    },
    laptop: {
      original: "Je travaille sur un ordinateur portable.",
      translated: "I am working on a laptop."
    },
    cell_phone: {
      original: "Où est mon téléphone portable?",
      translated: "Where is my cell phone?"
    }
  },
  es: {
    cat: {
      original: "El gato duerme en el sofá.",
      translated: "The cat is sleeping on the couch."
    },
    dog: {
      original: "El perro juega con una pelota.",
      translated: "The dog is playing with a ball."
    },
    chair: {
      original: "Siéntate en la silla.",
      translated: "Sit on the chair."
    },
    book: {
      original: "Estoy leyendo un libro.",
      translated: "I am reading a book."
    },
    car: {
      original: "El coche es rojo.",
      translated: "The car is red."
    },
    cup: {
      original: "Bebe de la taza.",
      translated: "Drink from the cup."
    },
    laptop: {
      original: "Estoy trabajando en un portátil.",
      translated: "I am working on a laptop."
    },
    cell_phone: {
      original: "¿Dónde está mi teléfono móvil?",
      translated: "Where is my cell phone?"
    }
  }
};

// Default examples for any object without a specific example
const defaultExamples: Record<string, {original: string, translated: string}> = {
  fi: {
    original: "Tämä on OBJECT.",
    translated: "This is a/an OBJECT."
  },
  ru: {
    original: "Это OBJECT.",
    translated: "This is a/an OBJECT."
  },
  fr: {
    original: "C'est un(e) OBJECT.",
    translated: "This is a/an OBJECT."
  },
  es: {
    original: "Esto es un(a) OBJECT.",
    translated: "This is a/an OBJECT."
  }
};

let model: cocoSsd.ObjectDetection | null = null;

/**
 * Initialize the object detection model
 * @returns A promise that resolves when the model is loaded
 */
export async function initObjectDetection(): Promise<void> {
  if (!model) {
    console.log("Initializing TensorFlow.js and COCO-SSD model...");
    // Make sure TensorFlow.js is initialized
    await tf.ready();
    // Load the COCO-SSD model
    model = await cocoSsd.load();
    console.log("Object detection model loaded successfully");
  }
}

/**
 * Detect objects in an image
 * @param imageElement HTML image or video element containing the image to analyze
 * @param targetLanguage Target language code (e.g., 'fi' for Finnish)
 * @returns Array of detected objects with translations
 */
export async function detectObjects(
  imageElement: HTMLImageElement | HTMLVideoElement,
  targetLanguage: string = 'fi'
): Promise<Array<{
  object: string;
  translation: string;
  exampleSentence: string;
  sentenceTranslation: string;
  position: { x: number; y: number };
  bbox: [number, number, number, number]; // [x, y, width, height]
  score: number;
}>> {
  // Ensure the model is loaded
  if (!model) {
    await initObjectDetection();
  }

  // Perform object detection
  const predictions = await model!.detect(imageElement);
  
  // Get translations for detected objects
  return predictions
    .filter(prediction => prediction.score > 0.5) // Filter out low confidence predictions
    .filter(prediction => {
      const className = prediction.class.toLowerCase();
      // Exclude people, faces, and person-related classes
      return !['person', 'face', 'head', 'man', 'woman', 'child', 'baby'].includes(className);
    })
    .map(prediction => {
      const objectName = prediction.class;
      const score = prediction.score;
      const bbox = prediction.bbox; // [x, y, width, height]
      
      // Normalize coordinates to 0-1 range for consistent positioning
      // Determine if element is a video element to access correct properties
      function isVideoElement(element: HTMLImageElement | HTMLVideoElement): 
        element is HTMLVideoElement {
        return 'videoWidth' in element;
      }
      
      const imageWidth = isVideoElement(imageElement) 
        ? imageElement.videoWidth 
        : imageElement.width;
      const imageHeight = isVideoElement(imageElement) 
        ? imageElement.videoHeight 
        : imageElement.height;
      
      // Calculate center point of the bounding box
      const centerX = (bbox[0] + bbox[2] / 2) / imageWidth;
      const centerY = (bbox[1] + bbox[3] / 2) / imageHeight;
      
      // Look up translation with fallback
      const translations = objectTranslations[targetLanguage] || objectTranslations['fi'] || {};
      const translation = translations[objectName] || objectName;
      
      // Look up example sentence with fallback
      const examples = objectExampleSentences[targetLanguage] || objectExampleSentences['fi'] || {};
      const example = examples[objectName] || defaultExamples[targetLanguage] || defaultExamples['fi'];
      
      // Replace OBJECT placeholder if using default example
      const exampleSentence = example.original.replace('OBJECT', translation);
      const sentenceTranslation = example.translated.replace('OBJECT', objectName);
      
      return {
        object: objectName,
        translation,
        exampleSentence,
        sentenceTranslation,
        position: { x: centerX, y: centerY },
        bbox: prediction.bbox,
        score: prediction.score
      };
    });
}