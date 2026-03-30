import { ThreeElements } from "@react-three/fiber";
import { ReactNode } from "react";
import { Group, Material, Mesh, Object3D } from "three";
import { fadeShaders } from "./shaders";

export const PATCHED = Symbol("fadePatched");
export const LISTENING = Symbol("fadeListening");
export const ORIGINAL_STATE = Symbol("fadeOriginalState");
export const ORIGINAL_VISIBLE = Symbol("fadeOriginalVisible");

export type FadeMode = keyof typeof fadeShaders;

export type ShaderRef = {
  uniforms: {
    uFade: { value: number };
  };
};

export type MeshMaterial = Mesh["material"];
export type MaterialGetter = (this: Mesh) => MeshMaterial;
export type MaterialSetter = (this: Mesh, value: MeshMaterial) => void;

export type MaterialDescriptorInfo = {
  hadOwnDescriptor: boolean;
  ownDescriptor?: PropertyDescriptor;
  descriptor?: PropertyDescriptor;
  getter?: MaterialGetter;
  setter?: MaterialSetter;
};

export type OriginalMaterialState = {
  transparent: boolean;
  forceSinglePass: boolean;
  onBeforeCompile: Material["onBeforeCompile"];
};

export type PatchedMaterial = Material & {
  [PATCHED]?: boolean;
  [ORIGINAL_STATE]?: OriginalMaterialState;
  transparent: boolean;
  forceSinglePass: boolean;
  needsUpdate: boolean;
};

export type ListeningObject = Object3D & {
  [LISTENING]?: boolean;
};

export interface UseFadeGroupOptions {
  /**
   * Fade animation mode.
   * @default "alpha"
   */
  mode?: FadeMode;
  /**
   * Spring damping for the fade animation.
   * Lower = faster, higher = slower. Set to 0 to disable animation.
   * @default 0.2
   */
  damping?: number;
  /**
   * When true, disables automatic animation in useFrame.
   * You control `fade.current.value` manually — the hook only
   * syncs it to shaders and mesh visibility.
   * @default false
   */
  manual?: boolean;
  /**
   * Called when the fade animation reaches its target (0 or 1).
   * Receives the final value as argument.
   */
  onFadeComplete?: (value: number) => void;
}

export interface UseFadeGroupReturn {
  /** The fade value ref. Set `fade.current.value` manually when `manual: true`. */
  fade: import("react").RefObject<{ value: number }>;
  /** True when the object is at least partially visible. */
  isVisible: import("react").RefObject<boolean>;
  /** True while the fade animation is in progress. */
  isFading: import("react").RefObject<boolean>;
}

export type FadeGroupProps = ThreeElements["group"] &
  UseFadeGroupOptions & {
    children?: ReactNode;
    visible?: boolean;
  };

export type FadeGroupRef = Group & UseFadeGroupReturn;
