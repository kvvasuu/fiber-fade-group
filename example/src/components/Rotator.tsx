import { useCursor } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, type ReactNode } from "react";
import type { Group } from "three";

export default function Rotator({ children }: { children: ReactNode }) {
  const groupRef = useRef<Group>(null);

  const [hovered, setHovered] = useState(false);

  useCursor(hovered, "pointer", "auto");

  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group
      ref={groupRef}
      onPointerOver={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
    >
      {children}
    </group>
  );
}
