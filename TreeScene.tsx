// src/components/TreeScene.tsx
import React, { useMemo } from 'react';
import { GroupProps, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FoliagePoints } from './FoliagePoints';
import { Ornaments } from './Ornaments';

export type TreeMode = 'CHAOS' | 'FORMED';

interface TreeSceneProps extends GroupProps {
  mode: TreeMode;
}

export const TreeScene: React.FC<TreeSceneProps> = ({ mode, ...props }) => {
  // 进度 0 = 完全 Chaos, 1 = 完全 Formed
  const progressRef = React.useRef(0);

  useFrame((_, delta) => {
    const target = mode === 'FORMED' ? 1 : 0;
    const speed = 0.8; // 调整体感
    progressRef.current = THREE.MathUtils.damp(
      progressRef.current,
      target,
      speed,
      delta
    );
  });

  const chaosSeed = useMemo(() => Math.random() * 1000, []);

  return (
    <group {...props}>
      {/* 轻微地面光晕 */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -4, 0]}>
        <circleGeometry args={[6, 64]} />
        <meshBasicMaterial color="#0f172a" transparent opacity={0.6} />
      </mesh>

      {/* 树体 */}
      <group position={[0, -2.5, 0]}>
        <FoliagePoints progressRef={progressRef} chaosSeed={chaosSeed} />
        <Ornaments progressRef={progressRef} chaosSeed={chaosSeed} />
      </group>

      {/* 顶部金字塔星星 */}
      <mesh position={[0, 6.5, 0]}>
        <octahedronGeometry args={[0.8, 0]} />
        <meshBasicMaterial color="#facc15" />
      </mesh>
    </group>
  );
};
