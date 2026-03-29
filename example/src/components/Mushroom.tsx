import { Float, useGLTF } from "@react-three/drei";
import { FadeGroup } from "fiber-fade-group";
import { useEffect } from "react";
import { useMainStore } from "../store";
import Rotator from "./Rotator";

useGLTF.preload(`${import.meta.env.BASE_URL}/Mushroom.glb`);

export default function Mushroom() {
  const { nodes, materials } = useGLTF(`${import.meta.env.BASE_URL}/Mushroom.glb`) as any;
  const noiseVisible = useMainStore((state) => state.noiseVisible);
  const selectedMode = useMainStore((state) => state.selectedMode);

  useEffect(() => {
    useMainStore.setState({ noiseVisible: true });
  }, [selectedMode]);

  return (
    <Float position={[7, 0, 0]}>
      <Rotator>
        <FadeGroup mode="noise" visible={noiseVisible} damping={0.3}>
          <mesh
            dispose={null}
            geometry={nodes.Retopo_grzyb4002_Default_OBJ028_0.geometry}
            material={materials["Default_OBJ.028"]}
            scale={0.7}
            onClick={() => useMainStore.setState((state) => ({ noiseVisible: !state.noiseVisible }))}
          />
        </FadeGroup>
      </Rotator>
    </Float>
  );
}
