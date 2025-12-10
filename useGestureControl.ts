// src/hooks/useGestureControl.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { TreeMode } from '../components/TreeScene';

export interface GestureState {
  mode: TreeMode;
  cameraActive: boolean;
}

export const useGestureControl = () => {
  const [gestureState, setGestureState] = useState<GestureState>({
    mode: 'FORMED',
    cameraActive: false,
  });

  const [cameraOffset, setCameraOffset] = useState({ x: 0, y: 0 });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const initCameraStream = useCallback(async () => {
    try {
      if (streamRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });

      const video = document.createElement('video');
      video.autoplay = true;
      video.playsInline = true;
      video.srcObject = stream;
      streamRef.current = stream;
      videoRef.current = video;

      video.onloadedmetadata = () => {
        video.play();
        setGestureState((s) => ({ ...s, cameraActive: true }));
        startGestureLoop();
      };
    } catch (err) {
      console.error('Camera init error', err);
    }
  }, []);

  const startGestureLoop = useCallback(() => {
    const loop = () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // ==== 这里接入手势检测模型 ====
      // 伪逻辑：
      //   1. 从 video 当前帧取图像
      //   2. 送入手部检测模型，得到关键点
      //   3. 判断手张开 / 合拢（例如：五指平均间距）
      //   4. 使用手掌中心 X / Y 偏移来影响 cameraOffset

      // 🔸示例：假设我们拿到了以下结果：
      // const isHandOpen = ...boolean
      // const normX = ... [-1, 1]
      // const normY = ... [-1, 1]

      // 这里先用简单的“伪随机摆动”做占位，方便你看效果：
      const t = performance.now() * 0.001;
      const fakeOpen = Math.sin(t * 0.7) > 0.2; // 手势开关占位
      const normX = Math.sin(t * 0.4) * 0.4;
      const normY = Math.cos(t * 0.6) * 0.3;

      setGestureState((s) => ({
        ...s,
        mode: fakeOpen ? 'CHAOS' : 'FORMED',
      }));

      setCameraOffset({
        x: normX * 4, // 控制水平绕行
        y: normY * 2, // 控制仰俯
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return {
    gestureState,
    cameraOffset,
    initCameraStream,
  };
};
