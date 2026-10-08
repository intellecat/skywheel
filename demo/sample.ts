import type { WheelData } from 'skywheel';

// London, 26 September 2026, 11:21 BST (10:21 UT), Placidus houses.
// Longitudes from the Swiss Ephemeris; speeds are rounded (only their sign matters here: retrograde).
export const LONDON_2026: WheelData = {
  asc: 229.3564,
  mc: 158.7498,
  cusps: [229.3564, 259.7128, 298.9502, 338.7498, 9.5489, 32.0386, 49.3564, 79.7128, 118.9502, 158.7498, 189.5489, 212.0386],
  sunAltitude: 33.8,
  bodies: [
    { id: 'sun', lon: 183.3557, speed: 0.98 },
    { id: 'moon', lon: 359.9801, speed: 13.2 },
    { id: 'mercury', lon: 204.4219, speed: 1.5 },
    { id: 'venus', lon: 217.6142, speed: 1.2 },
    { id: 'mars', lon: 119.0053, speed: 0.6 },
    { id: 'jupiter', lon: 138.7591, speed: 0.2 },
    { id: 'saturn', lon: 11.9341, speed: -0.07 },
    { id: 'uranus', lon: 65.5938, speed: -0.02 },
    { id: 'neptune', lon: 2.9886, speed: -0.02 },
    { id: 'pluto', lon: 303.159, speed: -0.01 },
  ],
};
