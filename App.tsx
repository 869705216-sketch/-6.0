// src/App.tsx
import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { TreeScene } from './components/TreeScene';
import { useGestureControl } from './hooks/useGestureControl';

const App: React.FC = () => {
  const { gestureState, cameraOffset, initCameraStream } = useGestureControl();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#02170f] via-[#021c13] to-[#0b0b0b] text-slate-100 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_10%,rgba(250,204,21,0.12),transparent_55%),radial-gradient(circle_at_80%_0%,rgba(248,250,252,0.06),transparent_60%)]" />

      {/* 顶部小标题（特朗普金色调） */}
      <header className="absolute top-4 left-4 z-20">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold tracking-[0.35em] text-[#facc15]">
            GRAND LUXURY
          </span>
          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-300/70">
            interactive christmas tree · offline lobby
          </span>
        </div>
      </header>

      {/* 底部 UI / 状态显示 */}
      <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center pointer-events-none">
        <div className="pointer-events-auto glass-panel px-4 py-2 rounded-full flex items-center gap-4 text-[11px] md:text-xs border border-[#a16207]/40 bg-black/40 backdrop-blur-xl">
          <span className="uppercase tracking-[0.25em] text-[#facc15] font-semibold">
            | manual override |
          </span>
          <span className="text-slate-200/80 hidden md:inline">
            Hand open = unleash chaos · Hand closed = reform the tree · Move hand to orbit camera
          </span>
          <button
            className="ml-2 px-3 py-1 rounded-full border border-slate-500/60 text-slate-200 text-[10px] hover:bg-slate-800/60 transition"
            onClick={initCameraStream}
          >
            {gestureState.cameraActive ? 'Camera active' : 'Enable camera control'}
          </button>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${
              gestureState.mode === 'CHAOS'
                ? 'bg-red-500/20 text-red-200 border border-red-500/60'
                : 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/60'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {gestureState.mode === 'CHAOS' ? 'CHAOS UNLEASHED' : 'TREE FORMED'}
          </span>
        </div>
      </div>

      <Canvas
        camera={{ position: [0 + cameraOffset.x, 4 + cameraOffset.y, 20], fov: 35 }}
        gl={{ antialias: true, toneMappingExposure: 1.2 }}
      >
        {/* 柔和环境 */}
        <color attach="background" args={['#020617']} />
        <fog attach="fog" args={['#020617', 15, 45]} />

        {/* 环境光：HDRI Lobby / 替代用 preset */}
        <Environment preset="lobby" />

        {/* 树主体 + 粒子 */}
        <TreeScene mode={gestureState.mode} />

        {/* 轨道控制（手势控制不方便时的备用） */}
        <OrbitControls
          enablePan={false}
          maxPolarAngle={Math.PI * 0.85}
          minDistance={10}
          maxDistance={30}
        />

        {/* 后期处理 */}
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.2}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.15}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
};

export default App;
