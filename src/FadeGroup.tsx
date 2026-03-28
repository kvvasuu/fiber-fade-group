import { forwardRef, useImperativeHandle, useRef } from "react";
import { Group } from "three";
import { FadeGroupProps, FadeGroupRef } from "./types";
import { useFadeGroup } from "./useFadeGroup";

export const FadeGroup = forwardRef<FadeGroupRef, FadeGroupProps>(
  ({ children, visible = true, damping = 0.2, manual = false, onFadeComplete, mode, ...props }, forwardedRef) => {
    const ref = useRef<Group>(null);
    const { fade, isVisible, isFading } = useFadeGroup(ref, visible, { mode, damping, manual, onFadeComplete });

    useImperativeHandle(forwardedRef, () => {
      return Object.assign(ref.current!, { fade, isVisible, isFading });
    });

    return (
      <group ref={ref} {...props}>
        {children}
      </group>
    );
  },
);

FadeGroup.displayName = "FadeGroup";
