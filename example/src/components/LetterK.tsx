import { CubeCamera, Float, MeshRefractionMaterial, useGLTF } from "@react-three/drei";
import { FadeGroup } from "fiber-fade-group";
import { useEffect } from "react";
import { useMainStore } from "../store";
import Rotator from "./Rotator";

useGLTF.preload(`${import.meta.env.BASE_URL}/K.glb`);

export default function LetterK() {
  const { nodes } = useGLTF(`${import.meta.env.BASE_URL}/K.glb`) as any;
  const alphaVisible = useMainStore((state) => state.alphaVisible);
  const selectedMode = useMainStore((state) => state.selectedMode);

  useEffect(() => {
    useMainStore.setState({ alphaVisible: true });
  }, [selectedMode]);

  return (
    <CubeCamera resolution={256} frames={Infinity} position={[14, 0, 0]}>
      {(texture) => (
        <Float>
          <Rotator>
            <FadeGroup mode="alpha" visible={alphaVisible} damping={0.3}>
              <mesh
                dispose={null}
                castShadow
                geometry={nodes.base.geometry}
                onClick={() => useMainStore.setState((state) => ({ alphaVisible: !state.alphaVisible }))}
              >
                <MeshRefractionMaterial
                  envMap={texture}
                  color={[0.5, 0.5, 0.5]}
                  ior={2.75}
                  aberrationStrength={0.01}
                  fresnel={1}
                  bounces={3}
                  toneMapped={false}
                />
              </mesh>
            </FadeGroup>
          </Rotator>
        </Float>
      )}
    </CubeCamera>
  );
}
