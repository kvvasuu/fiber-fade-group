import type { ThreeElements } from "@react-three/fiber";
import { forwardRef, useImperativeHandle, useRef, type ReactNode } from "react";
import { Group } from "three";
import { useFadeGroup, type UseFadeGroupOptions } from "./useFadeGroup";

type FadeGroupProps = ThreeElements["group"] &
  UseFadeGroupOptions & {
    children?: ReactNode;
    visible?: boolean;
  };

/**
 * A Group component that animates its children in and out using configurable fade modes (alpha, dither, noise, dissolve).
 */
export const FadeGroup = forwardRef<Group, FadeGroupProps>(
  ({ children, visible = true, damping = 0.2, manual = false, onFadeComplete, mode, ...props }, forwardedRef) => {
    const ref = useRef<Group>(null);
    useFadeGroup(ref, visible, { mode, damping, manual, onFadeComplete });

    useImperativeHandle(forwardedRef, () => {
      return ref.current!;
    });

    return (
      <group ref={ref} {...props}>
        {children}
      </group>
    );
  },
);

FadeGroup.displayName = "FadeGroup";
