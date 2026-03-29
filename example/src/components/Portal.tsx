import { useAnimations, useCursor, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { FadeGroup, type FadeGroupRef } from "fiber-fade-group";
import { cubic, damp3 } from "maath/easing";
import { useEffect, useRef, useState } from "react";
import { Color, Vector3, type Group } from "three";
import { useMainStore } from "../store";
import FadingObject from "./FadingObject";

useGLTF.preload(`${import.meta.env.BASE_URL}/portal.glb`);

const pointA = new Vector3(0, 1.8, 2.4);
const pointB = new Vector3(0, 1.8, -2.8);
const flyDuration = 2.5;

export default function Portal() {
  const group = useRef<Group>(null);
  const rockRef = useRef<Group>(null);
  const fadeGroupRef = useRef<FadeGroupRef>(null);
  const prevDissolveVisibleRef = useRef(true);

  const { nodes, materials, animations } = useGLTF(`${import.meta.env.BASE_URL}/portal.glb`) as any;
  const { actions } = useAnimations(animations, group);

  const dissolveVisible = useMainStore((state) => state.dissolveVisible);
  const canAnimate = useMainStore((state) => state.selectedMode === "dissolve" && !state.dissolveFlying);

  const progressRef = useRef(0);
  const isFlyingRef = useRef(false);
  const directionRef = useRef<1 | -1>(1);
  const targetPositionRef = useRef(new Vector3());

  const [hovered, setHovered] = useState(false);

  useCursor(hovered, "pointer", "auto");

  useEffect(() => {
    if (actions?.["Animation"]) {
      actions["Animation"].play();
    }
  }, [actions]);

  useEffect(() => {
    if (materials.M_Portal) {
      materials.M_Portal.roughness = 0.4;
    }
  }, [materials]);

  useEffect(() => {
    if (!rockRef.current) return;

    const mesh = rockRef.current.children.find((child) => (child as any).isMesh) as any;
    if (!mesh || !mesh.material) return;

    const clonedMaterial = mesh.material.clone();
    clonedMaterial.emissive = new Color(0xf74a4a);
    clonedMaterial.emissiveIntensity = 1;
    clonedMaterial.roughness = 0.3;
    clonedMaterial.metalness = 0.8;
    clonedMaterial.color = new Color(0xf7ff4a);

    mesh.material = clonedMaterial;
  }, [materials, nodes]);

  useEffect(() => {
    if (!rockRef.current) return;

    const wasVisible = prevDissolveVisibleRef.current;
    prevDissolveVisibleRef.current = dissolveVisible;

    if (!(wasVisible && !dissolveVisible)) return;

    rockRef.current.position.copy(pointA);
    progressRef.current = 0;
    directionRef.current = 1;
    isFlyingRef.current = true;
    useMainStore.setState({ dissolveFlying: true });
  }, [dissolveVisible]);

  useFrame((_, delta) => {
    if (!rockRef.current) return;
    rockRef.current.rotation.y += delta * 0.8;
    rockRef.current.rotation.x += delta * 0.4;

    if (!isFlyingRef.current) return;

    progressRef.current = Math.min(progressRef.current + delta / flyDuration, 1);
    const easedProgress = cubic.inOut(progressRef.current);

    if (directionRef.current === 1) {
      targetPositionRef.current.lerpVectors(pointA, pointB, easedProgress);
    } else {
      targetPositionRef.current.lerpVectors(pointB, pointA, easedProgress);
    }

    damp3(rockRef.current.position, targetPositionRef.current, 0.12, delta);

    if (fadeGroupRef.current) {
      const p = progressRef.current;
      const openStart = 0.15;
      const fullyOpenAt = 0.35;
      const closeStart = 0.65;
      const closeEnd = 0.85;

      if (p < openStart) {
        fadeGroupRef.current.fade.current.value = 1;
      } else if (p < fullyOpenAt) {
        fadeGroupRef.current.fade.current.value = 1 - (p - openStart) / (fullyOpenAt - openStart);
      } else if (p < closeStart) {
        fadeGroupRef.current.fade.current.value = 0;
      } else if (p < closeEnd) {
        fadeGroupRef.current.fade.current.value = (p - closeStart) / (closeEnd - closeStart);
      } else {
        fadeGroupRef.current.fade.current.value = 1;
      }
    }

    if (progressRef.current >= 1) {
      if (directionRef.current === 1) {
        directionRef.current = -1;
        progressRef.current = 0;
      } else {
        isFlyingRef.current = false;
        useMainStore.setState({ dissolveFlying: false, dissolveVisible: true });
      }
    }
  });

  return (
    <group
      dispose={null}
      position={[0, -1, 0]}
      scale={0.66}
      rotation={[0, 0.7, 0]}
      onPointerOver={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
      onClick={() => {
        if (canAnimate) useMainStore.setState((state) => ({ dissolveVisible: !state.dissolveVisible }));
      }}
    >
      <group ref={rockRef} name="rock001_3" position={[0, 1.8, 2.4]} rotation={[-0.011, 0.068, 0.759]}>
        <mesh name="Object_10" geometry={nodes.Object_10.geometry} material={materials.M_Main} />
      </group>

      <group name="Sketchfab_Scene" ref={group}>
        <group name="GLTF_SceneRootNode" scale={1.377}>
          <FadingObject>
            <group name="rock_2">
              <mesh name="Object_8" geometry={nodes.Object_8.geometry} material={materials.M_Main} />
            </group>
          </FadingObject>
          <FadingObject>
            <group name="rock002_4" position={[-1.136, 3.382, -0.283]} rotation={[0.022, -0.093, -0.535]}>
              <mesh name="Object_12" geometry={nodes.Object_12.geometry} material={materials.M_Main} />
            </group>
          </FadingObject>
          <FadingObject>
            <group name="rock003_5" position={[-0.479, 3.605, -0.164]} rotation={[-0.18, 0.154, 0.561]}>
              <mesh name="Object_14" geometry={nodes.Object_14.geometry} material={materials.M_Main} />
            </group>
          </FadingObject>
          <FadingObject>
            <group name="rock004_6" position={[0.596, 3.992, 0.232]} rotation={[-0.784, 0.434, 1.543]}>
              <mesh name="Object_16" geometry={nodes.Object_16.geometry} material={materials.M_Main} />
            </group>
          </FadingObject>
          <group name="Chain_30" position={[-1.974, 0.541, 0.601]} rotation={[0.021, -0.294, 0]}>
            <mesh name="Object_56" geometry={nodes.Object_56.geometry} material={materials.M_Main} />
          </group>
        </group>
        <mesh name="Object_4" geometry={nodes.Object_4.geometry} material={materials.M_Main} scale={1.377} />
        <FadeGroup ref={fadeGroupRef} mode="dissolve" manual>
          <mesh name="Object_36" geometry={nodes.Object_36.geometry} material={materials.M_Portal} position={[0, 0.522, 0]} scale={1.377}></mesh>
        </FadeGroup>
        <mesh name="Object_38" geometry={nodes.Object_38.geometry} material={materials.M_Eyes_02} position={[1.69, 0.597, 1.068]} scale={1.377} />
        <mesh name="Object_40" geometry={nodes.Object_40.geometry} material={materials.M_Eyes_01} position={[-1.728, 1.052, 0.667]} scale={1.377} />
      </group>
    </group>
  );
}
