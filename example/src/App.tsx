import { Environment, Loader, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import { Suspense, useState } from "react";
import { MathUtils } from "three";
import { CameraController } from "./components/CameraController";
import Overlay from "./components/Overlay";
import { Scene } from "./components/Scene";

export default function App() {
  const [showOverlay, setShowOverlay] = useState(false);

  const onSceneLoad = () => {
    setTimeout(() => {
      setShowOverlay(true);
    }, 1000);
  };

  return (
    <>
      <Canvas gl={{ powerPreference: "high-performance" }} camera={{ position: [0, 0, 4], fov: 80, far: 100 }}>
        <EffectComposer>
          <DepthOfField focusDistance={4} focalLength={10} bokehScale={5} height={480} />
          <Vignette />
        </EffectComposer>
        <CameraController />
        <Suspense fallback={null}>
          <Scene onLoaded={onSceneLoad} />

          <Environment preset="dawn" blur={0.5} background backgroundRotation={[0, MathUtils.degToRad(-45), 0]} />

          <Preload all />
        </Suspense>
      </Canvas>
      <Loader />
      <Overlay show={showOverlay} />
    </>
  );
}
