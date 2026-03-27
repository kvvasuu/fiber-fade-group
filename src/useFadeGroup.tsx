import { invalidate, useFrame } from "@react-three/fiber";
import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";
import { Material, Mesh, Object3D } from "three";
import { attachListener, cleanupListeners, damp, fadeModeThresholds, patchObject } from "./patch";
import {
  ORIGINAL_VISIBLE,
  type ListeningObject,
  type ShaderRef,
  type UseFadeGroupOptions,
  type UseFadeGroupReturn,
} from "./types";

export type { FadeMode, UseFadeGroupOptions, UseFadeGroupReturn } from "./types";

export function useFadeGroup(
  ref: RefObject<Object3D | null>,
  visible: boolean,
  options: UseFadeGroupOptions = {},
): UseFadeGroupReturn {
  const { mode, damping = 0.2, manual = false, onFadeComplete } = options;

  const fade = useRef({ value: visible ? 1 : 0 });
  const isVisible = useRef(visible);
  const isFading = useRef(false);
  const shadersMap = useRef<Map<Material, ShaderRef>>(new Map());
  const meshesMap = useRef<Map<Mesh, boolean>>(new Map());
  const completeFiredRef = useRef(false);

  const needsUpdateRef = useRef(false);
  const prevVisibleRef = useRef(visible);

  const threshold = fadeModeThresholds[mode ?? "alpha"];

  useLayoutEffect(() => {
    const root = ref.current;
    if (root && fade.current.value === 0) {
      root.traverse((obj) => {
        if ((obj as Mesh).isMesh) {
          const mesh = obj as Mesh;
          (mesh as any)[ORIGINAL_VISIBLE] = mesh.visible;
          mesh.visible = false;
        }
      });
    }

    return () => {
      if (!root) return;
      root.traverse((obj) => {
        if ((obj as Mesh).isMesh) {
          const mesh = obj as Mesh;
          if (ORIGINAL_VISIBLE in (mesh as any)) {
            mesh.visible = (mesh as any)[ORIGINAL_VISIBLE] as boolean;
            delete (mesh as any)[ORIGINAL_VISIBLE];
          }
        }
      });
    };
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;

    const root = ref.current;

    root.traverse((obj) => {
      patchObject(obj, fade.current, shadersMap.current, meshesMap.current, mode ?? "alpha");
    });

    root.traverse((obj) => {
      attachListener(obj as ListeningObject, fade.current, shadersMap.current, meshesMap.current, mode ?? "alpha");
    });

    return () => {
      cleanupListeners(root);
      shadersMap.current.clear();
      meshesMap.current.clear();
    };
  }, [ref]);

  useEffect(() => {
    if (prevVisibleRef.current !== visible) {
      if (!visible && fade.current.value > threshold) {
        meshesMap.current.forEach((_, mesh, map) => {
          map.set(mesh, mesh.visible);
        });
      }

      invalidate();
      prevVisibleRef.current = visible;
      needsUpdateRef.current = true;
      completeFiredRef.current = false;
    }
  }, [visible]);

  useFrame((_state, delta) => {
    if (!needsUpdateRef.current && !manual) return;

    const target = visible ? 1 : 0;

    if (!manual) {
      damp(fade.current, "value", target, damping, delta);
    }

    const distance = Math.abs(fade.current.value - target);
    const animating = distance > threshold;

    if (!animating && !completeFiredRef.current) {
      fade.current.value = target;
      completeFiredRef.current = true;
      needsUpdateRef.current = false;
      onFadeComplete?.(target);
    }

    if (animating) {
      invalidate();
      completeFiredRef.current = false;
    }

    const currentFade = fade.current.value;

    isFading.current = animating;
    isVisible.current = currentFade > threshold;

    shadersMap.current.forEach((shader) => {
      if (shader?.uniforms?.uFade) {
        shader.uniforms.uFade.value = currentFade;
      }
    });

    meshesMap.current.forEach((originallyVisible, mesh) => {
      if (originallyVisible) {
        mesh.visible = currentFade > threshold;
      }
    });
  });

  return { fade, isVisible, isFading };
}
