import { PlanetConfig } from './services/types';

// Texture URLs (using reliable GitHub raw links from Three.js examples or public wikimedia)
const TEXTURE_URLS = {
  earth: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
  earthClouds: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png',
  moon: 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/moon_1024.jpg',
  venus: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg', // Fallback or basic color will be used if this fails, but usually we use basic for Venus to ensure style match
};

export const PLANETS: PlanetConfig[] = [
  {
    name: "SUN",
    color: "#ffaa00", // Hotter orange-yellow
    radius: 5,
    distance: 0,
    speed: 0,
    textureType: 'basic',
    description: "The Star at the Center",
    stats: {
      diameter: "1,392,700 km",
      temperature: "5,500°C (surface)",
      dayLength: "27 Earth days",
      orbitPeriod: "N/A",
      mass: "1.989 × 10³⁰ kg",
      gravity: "274 m/s²",
      moons: "0",
      funFact: "The Sun contains 99.86% of the mass in our Solar System and could fit 1.3 million Earths inside it!"
    }
  },
  {
    name: "MERCURY",
    color: "#8C7853",
    radius: 0.6,
    distance: 8,
    speed: 0.8,
    textureType: 'basic',
    description: "The Swift Messenger",
    stats: {
      diameter: "4,879 km",
      temperature: "-173°C to 427°C",
      dayLength: "59 Earth days",
      orbitPeriod: "88 days",
      mass: "3.285 × 10²³ kg",
      gravity: "3.7 m/s²",
      moons: "0",
      funFact: "Mercury has the most extreme temperature variations in the solar system - over 600°C between day and night!"
    }
  },
  {
    name: "VENUS",
    color: "#FFC649",
    radius: 0.9,
    distance: 12,
    speed: 0.6,
    textureType: 'basic',
    description: "The Morning Star",
    stats: {
      diameter: "12,104 km",
      temperature: "464°C (hottest planet)",
      dayLength: "243 Earth days",
      orbitPeriod: "225 days",
      mass: "4.867 × 10²⁴ kg",
      gravity: "8.87 m/s²",
      moons: "0",
      funFact: "Venus rotates backwards and has a day longer than its year! Its thick atmosphere creates a runaway greenhouse effect."
    }
  },
  {
    name: "EARTH",
    color: "#4b9cd3",
    radius: 1,
    distance: 17,
    speed: 0.5,
    textureType: 'earth',
    textureUrl: TEXTURE_URLS.earth,
    cloudTextureUrl: TEXTURE_URLS.earthClouds,
    description: "Our Blue Marble",
    moons: [
      {
        name: "MOON",
        color: "#DDDDDD",
        radius: 0.27,
        distance: 2, // Relative to Earth
        speed: 2,
        textureType: 'moon',
        textureUrl: TEXTURE_URLS.moon,
        description: "Luna - Our Natural Satellite"
      }
    ],
    stats: {
      diameter: "12,742 km",
      temperature: "15°C (average)",
      dayLength: "24 hours",
      orbitPeriod: "365.25 days",
      mass: "5.972 × 10²⁴ kg",
      gravity: "9.81 m/s²",
      moons: "1 (Luna)",
      funFact: "Earth is the only known planet with liquid water on its surface and the only place in the universe where life is known to exist!"
    }
  },
  {
    name: "MARS",
    color: "#CD5C5C",
    radius: 0.7,
    distance: 23,
    speed: 0.4,
    textureType: 'basic',
    description: "The Red Planet",
    stats: {
      diameter: "6,779 km",
      temperature: "-65°C (avg), -125°C to 20°C",
      dayLength: "24h 37m",
      orbitPeriod: "687 days",
      mass: "6.39 × 10²³ kg",
      gravity: "3.71 m/s²",
      moons: "2 (Phobos & Deimos)",
      funFact: "Mars has the largest volcano in our solar system - Olympus Mons, which is 3x taller than Mount Everest!"
    }
  },
  {
    name: "JUPITER",
    color: "#C88B3A",
    radius: 3.5,
    distance: 34,
    speed: 0.2,
    textureType: 'striped',
    description: "King of Planets",
    stats: {
      diameter: "139,820 km",
      temperature: "-110°C (cloud tops)",
      dayLength: "9h 56m (fastest)",
      orbitPeriod: "12 years",
      mass: "1.898 × 10²⁷ kg",
      gravity: "24.79 m/s²",
      moons: "95+ known moons",
      funFact: "Jupiter's Great Red Spot is a storm that has been raging for over 400 years and is larger than Earth!"
    }
  },
  {
    name: "SATURN",
    color: "#FAD5A5",
    radius: 3,
    distance: 48,
    speed: 0.15,
    textureType: 'ringed',
    ringColor: "#E5C29F",
    description: "Lord of the Rings",
    stats: {
      diameter: "116,460 km",
      temperature: "-140°C (cloud tops)",
      dayLength: "10h 42m",
      orbitPeriod: "29.5 years",
      mass: "5.683 × 10²⁶ kg",
      gravity: "10.44 m/s²",
      moons: "146+ known moons",
      funFact: "Saturn's rings are made of billions of ice particles and are so wide they could fit 6 Earths across, but only 10m thick!"
    }
  },
  {
    name: "URANUS",
    color: "#4FD0E7",
    radius: 2,
    distance: 60,
    speed: 0.1,
    textureType: 'basic',
    description: "The Sideways Planet",
    stats: {
      diameter: "50,724 km",
      temperature: "-195°C (coldest atmosphere)",
      dayLength: "17h 14m",
      orbitPeriod: "84 years",
      mass: "8.681 × 10²⁵ kg",
      gravity: "8.69 m/s²",
      moons: "28 known moons",
      funFact: "Uranus rotates on its side at a 98° angle! It appears to roll like a ball as it orbits the Sun."
    }
  },
  {
    name: "NEPTUNE",
    color: "#4169E1",
    radius: 1.9,
    distance: 72,
    speed: 0.08,
    textureType: 'basic',
    description: "The Windiest Planet",
    stats: {
      diameter: "49,244 km",
      temperature: "-200°C (coldest planet)",
      dayLength: "16h 6m",
      orbitPeriod: "165 years",
      mass: "1.024 × 10²⁶ kg",
      gravity: "11.15 m/s²",
      moons: "16 known moons",
      funFact: "Neptune has the fastest winds in the solar system, reaching speeds of up to 2,100 km/h - supersonic speeds!"
    }
  }
];

// Indices of planets that can be cycled through (excluding Sun)
export const ORBITING_PLANET_INDICES = [1, 2, 3, 4, 5, 6, 7, 8];

export const GESTURE_COOLDOWN_MS = 1000;