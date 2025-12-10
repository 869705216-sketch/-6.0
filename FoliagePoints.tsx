// src/components/FoliagePoints.tsx
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface FoliagePointsProps {
  progressRef: React.MutableRefObject<number>;
  chaosSeed: number;
}

const FOLIAGE_COUNT = 6000;

export const FoliagePoints: React.FC<FoliagePointsProps> = ({
  progressRef,
  chaosSeed,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { chaosPositions, targetPositions, colors } = useMemo(() => {
    const chaos = new Float32Array(FOLIAGE_COUNT * 3);
    const target = new Float32Array(FOLIAGE_COUNT * 3);
    const cols = new Float32Array(FOLIAGE_COUNT * 3);

    const rand = new THREE.MathUtils.seededRandom;

    for (let i = 0; i < FOLIAGE_COUNT; i++) {
      // --- Chaos：球形空间 ---
      const r = 12 * rand();
      const theta = Math.acos(2 * rand() - 1);
      const phi = 2 * Math.PI * rand();

      const cx = r * Math.sin(theta) * Math.cos(phi);
      const cy = r * Math.cos(theta);
      const cz = r * Math.sin(theta) * Math.sin(phi);

      chaos[i * 3 + 0] = cx;
      chaos[i * 3 + 1] = cy;
      chaos[i * 3 + 2] = cz;

      // --- Target：圆锥树体 ---
      const height = 10;
      const y = Math.random() * height;
      const radiusAtY = THREE.MathUtils.lerp(0.3, 3.5, 1 - y / height);
      const angle = Math.random() * Math.PI * 2;

      const tx = Math.cos(angle) * radiusAtY * (0.7 + 0.3 * Math.random());
      const ty = y - height / 2;
      const tz = Math.sin(angle) * radiusAtY * (0.7 + 0.3 * Math.random());

      target[i * 3 + 0] = tx;
      target[i * 3 + 1] = ty;
      target[i * 3 + 2] = tz;

      // 颜色：深祖母绿 + 微金
      const green = THREE.MathUtils.lerp(0.1, 0.3, Math.random());
      cols[i * 3 + 0] = green * 0.5;
      cols[i * 3 + 1] = green * 1.6;
      cols[i * 3 + 2] = green * 0.9;
    }
    return { chaosPositions: chaos, targetPositions: target, colors: cols };
  }, [chaosSeed]);

  const lerpedPositions = useMemo(
    () => new Float32Array(FOLIAGE_COUNT * 3),
    []
  );

  useFrame((state) => {
    const progress = progressRef.current;
    const points = pointsRef.current;
    if (!points) return;

    for (let i = 0; i < FOLIAGE_COUNT * 3; i++) {
      lerpedPositions[i] = THREE.MathUtils.lerp(
        chaosPositions[i],
        targetPositions[i],
        progress
      );
    }

    const g = points.geometry as THREE.BufferGeometry;
    g.setAttribute(
      'position',
      new THREE.BufferAttribute(lerpedPositions, 3)
    );
    g.attributes.position.needsUpdate = true;

    // 轻微呼吸感 scale
    points.rotation.y += 0.02 * (1 - progress);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={targetPositions}
          count={FOLIAGE_COUNT}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          array={colors}
          count={FOLIAGE_COUNT}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        vertexColors
        depthWrite={false}
        transparent
        opacity={0.9}
        sizeAttenuation
      />
    </points>
  );
};
