import { useCursor, useGLTF } from "@react-three/drei";
import { FadeGroup, type FadeGroupRef } from "fiber-fade-group";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { Material, Mesh } from "three";
import { useMainStore } from "../store";

useGLTF.preload(`${import.meta.env.BASE_URL}/fish.glb`);

export default function FadingObject({ children }: { children: ReactNode }) {
  const [isVisible, setIsVisible] = useState(true);
  const groupRef = useRef<FadeGroupRef>(null);

  const selectedMode = useMainStore((state) => state.selectedMode);

  const [hovered, setHovered] = useState(false);

  useCursor(hovered, "pointer", "auto");

  useLayoutEffect(() => {
    const clonedMaterials: Material[] = [];
    const root = groupRef.current;

    if (!root) return;

    root.traverse((obj) => {
      if (!(obj as Mesh).isMesh) return;

      const mesh = obj as Mesh;

      if (Array.isArray(mesh.material)) {
        mesh.material = mesh.material.map((material) => {
          const clonedMaterial = material.clone();
          clonedMaterials.push(clonedMaterial);
          return clonedMaterial;
        });
      } else {
        const clonedMaterial = mesh.material.clone();
        clonedMaterials.push(clonedMaterial);
        mesh.material = clonedMaterial;
      }
    });

    return () => {
      clonedMaterials.forEach((material) => material.dispose());
    };
  }, []);

  useEffect(() => {
    if (selectedMode !== "dissolve") {
      setIsVisible(true);
    }
  }, [selectedMode]);

  return (
    <FadeGroup
      ref={groupRef}
      mode="dissolve"
      visible={isVisible}
      damping={0.3}
      onClick={(e) => {
        e.stopPropagation();
        setIsVisible((prev) => !prev);
      }}
      onPointerOver={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
    >
      {children}
    </FadeGroup>
  );
}
