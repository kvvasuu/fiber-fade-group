import { Float, useAnimations, useGLTF } from "@react-three/drei";
import { FadeGroup, type FadeGroupRef } from "fiber-fade-group";
import { useEffect, useRef } from "react";
import { useMainStore } from "../store";
import Rotator from "./Rotator";

useGLTF.preload(`${import.meta.env.BASE_URL}/fish.glb`);

export default function Fish() {
  const group = useRef<FadeGroupRef>(null);
  const { nodes, materials, animations } = useGLTF(`${import.meta.env.BASE_URL}/fish.glb`) as any;
  const { actions } = useAnimations(animations, group);

  const ditherVisible = useMainStore((state) => state.ditherVisible);
  const selectedMode = useMainStore((state) => state.selectedMode);

  useEffect(() => {
    useMainStore.setState({ ditherVisible: true });
  }, [selectedMode]);

  useEffect(() => {
    if (actions?.["MorphBake"]) {
      actions["MorphBake"].play();
    }
  }, [actions]);

  return (
    <Float position={[21, 0, 0]} speed={2}>
      <Rotator>
        <FadeGroup dispose={null} ref={group} mode="dither" visible={ditherVisible} damping={0.3}>
          <mesh
            scale={0.4}
            name="mesh_0"
            geometry={nodes.mesh_0.geometry}
            material={materials.SimplygonCastMaterial}
            morphTargetDictionary={nodes.mesh_0.morphTargetDictionary}
            morphTargetInfluences={nodes.mesh_0.morphTargetInfluences}
            rotation={[0, 0.4, 0]}
            onClick={() => useMainStore.setState((state) => ({ ditherVisible: !state.ditherVisible }))}
          />
        </FadeGroup>
      </Rotator>
    </Float>
  );
}
