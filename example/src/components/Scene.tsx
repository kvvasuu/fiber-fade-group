import { useProgress } from "@react-three/drei";
import { useEffect, useRef } from "react";
import Fish from "./Fish";
import LetterK from "./LetterK";
import Mushroom from "./Mushroom";
import Portal from "./Portal";

export function Scene({ onLoaded }: { onLoaded: () => void }) {
  const { active } = useProgress();
  const initialized = useRef(false);

  useEffect(() => {
    if (!active && !initialized.current) {
      onLoaded?.();
      initialized.current = true;
    }
  }, [active, onLoaded]);

  return (
    <group>
      <LetterK />
      <Mushroom />
      <Fish />
      <Portal />
    </group>
  );
}
