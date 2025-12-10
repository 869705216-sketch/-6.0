import * as THREE from 'three';

// Generate random point inside a sphere
export const getRandomSpherePoint = (radius: number): THREE.Vector3 => {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const r = Math.cbrt(Math.random()) * radius;
  const sinPhi = Math.sin(phi);
  return new THREE.Vector3(
    r * sinPhi * Math.cos(theta),
    r * sinPhi * Math.sin(theta),
    r * Math.cos(phi)
  );
};

// Generate point on a cone surface (Tree shape) with curved profile
export const getConePoint = (height: number, radiusBase: number, yOffset: number = 0): THREE.Vector3 => {
  const y = Math.random() * height; // Height from base
  
  // Normalized height (0 at bottom, 1 at top)
  const normY = y / height;

  // Power function for a fuller "fir tree" look.
  // Using an exponent > 1 creates a "scooped" shape, < 1 creates a "bulging" shape.
  // We combine a linear taper with a curve for a natural look.
  const taper = (1 - normY); 
  const curvedTaper = Math.pow(taper, 0.85); // Slight outward bulge for fullness
  
  const actualR = radiusBase * curvedTaper;
  
  const theta = Math.random() * Math.PI * 2;
  
  // Volume distribution: concentrate points near the surface but keep some inner volume
  // r is the distance from center
  const rRandom = Math.random();
  // Squaring the random value pushes points towards the outside (surface)
  const r = actualR * (0.2 + 0.8 * Math.sqrt(rRandom)); 

  return new THREE.Vector3(
    r * Math.cos(theta),
    y + yOffset,
    r * Math.sin(theta)
  );
};

export const lerp = (start: number, end: number, t: number) => {
  return start * (1 - t) + end * t;
};