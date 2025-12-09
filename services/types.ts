export enum GestureType {
  NONE = 'NONE',
  OPEN_HAND = 'OPEN_HAND',
  CLOSED_FIST = 'CLOSED_FIST',
  VICTORY = 'VICTORY'
}

export interface PlanetStats {
  diameter: string;
  temperature: string;
  dayLength: string;
  orbitPeriod: string;
  mass?: string;
  gravity?: string;
  moons?: string;
  funFact?: string;
}

export interface PlanetConfig {
  name: string;
  color: string;
  radius: number;
  distance: number; // Distance from sun (or parent for moons)
  speed: number; // Orbit speed
  rotationSpeed?: number; // Self rotation speed
  textureType: 'basic' | 'striped' | 'ringed' | 'earth' | 'moon' | 'image';
  textureUrl?: string;
  cloudTextureUrl?: string; // New: For Earth's clouds
  description: string;
  moons?: PlanetConfig[];
  ringColor?: string;
  stats?: PlanetStats;
}

export interface CameraState {
  targetPlanetIndex: number;
  zoomLevel: number; // 1 = normal, 2 = zoomed in, 0.5 = zoomed out
  speedMultiplier: number;
}