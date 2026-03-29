import { CameraControls, CameraControlsImpl } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { useMainStore } from "../store";

const cameraPresets = {
  dissolve: { position: new Vector3(0, 0.2, 4), target: new Vector3(0, 0, 0) },
  noise: { position: new Vector3(7, 0.2, 4), target: new Vector3(7, 0, 0) },
  alpha: { position: new Vector3(14, 0.2, 4), target: new Vector3(14, 0, 0) },
  dither: { position: new Vector3(21, 0.2, 4), target: new Vector3(21, 0, 0) },
};

const { ACTION } = CameraControlsImpl;

export function CameraController() {
  const selectedMode = useMainStore((state) => state.selectedMode);

  const ref = useRef<CameraControlsImpl>(null);

  useEffect(() => {
    const controls = ref.current;
    if (controls) {
      const preset = cameraPresets[selectedMode];
      controls.setLookAt(preset.position.x, preset.position.y, preset.position.z, preset.target.x, preset.target.y, preset.target.z, true);
    }
  }, [selectedMode]);

  return (
    <CameraControls
      ref={ref}
      smoothTime={0.3}
      enabled={true}
      maxDistance={8}
      minDistance={2}
      mouseButtons={{
        left: ACTION.ROTATE,
        middle: ACTION.DOLLY,
        right: ACTION.NONE,
        wheel: ACTION.DOLLY,
      }}
      touches={{
        one: ACTION.TOUCH_ROTATE,
        two: ACTION.TOUCH_DOLLY,
        three: ACTION.TOUCH_DOLLY,
      }}
    />
  );
}
