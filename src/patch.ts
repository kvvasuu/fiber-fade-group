import { CustomBlending, Material, Mesh, Object3D } from "three";
import { fadeShaders } from "./shaders";
import {
  LISTENING,
  MaterialDescriptorInfo,
  MaterialGetter,
  MaterialSetter,
  MeshMaterial,
  ORIGINAL_STATE,
  ORIGINAL_VISIBLE,
  PATCHED,
  type FadeMode,
  type ListeningObject,
  type PatchedMaterial,
  type ShaderRef,
} from "./types";

export const fadeModeThresholds: Record<FadeMode, number> = {
  alpha: 0.001,
  dither: 1 / 64,
  noise: 0.001,
  dissolve: 0.001,
};

const toMaterials = (value: MeshMaterial): Material[] =>
  (Array.isArray(value) ? value : [value]).filter((mat): mat is Material => Boolean(mat));

function getMaterialDescriptorInfo(mesh: Mesh): MaterialDescriptorInfo {
  const hadOwnDescriptor = Object.prototype.hasOwnProperty.call(mesh, "material");
  const ownDescriptor = Object.getOwnPropertyDescriptor(mesh, "material");

  let proto: object | null = mesh;
  let inheritedDescriptor: PropertyDescriptor | undefined;
  while (proto && !inheritedDescriptor) {
    inheritedDescriptor = Object.getOwnPropertyDescriptor(proto, "material");
    proto = Object.getPrototypeOf(proto);
  }

  const descriptor = ownDescriptor ?? inheritedDescriptor;

  return {
    hadOwnDescriptor,
    ownDescriptor,
    descriptor,
    getter: descriptor?.get as MaterialGetter | undefined,
    setter: descriptor?.set as MaterialSetter | undefined,
  };
}

function readCurrentMaterial(mesh: Mesh, getter: MaterialGetter | undefined, fallback: MeshMaterial): MeshMaterial {
  return getter ? getter.call(mesh) : fallback;
}

function cleanupMaterials(materials: PatchedMaterial[]) {
  materials.forEach((mat) => {
    const m = mat;
    const orig = m[ORIGINAL_STATE];
    if (orig) {
      m.transparent = orig.transparent;
      m.forceSinglePass = orig.forceSinglePass;
      m.onBeforeCompile = orig.onBeforeCompile;
      delete m[ORIGINAL_STATE];
    }
    delete m[PATCHED];
    m.needsUpdate = true;
  });
}

const easing = (t: number) => 1 / (1 + t + 0.48 * t * t + 0.235 * t * t * t);

export function damp(
  current: Record<string, any>,
  prop: string,
  target: number,
  smoothTime: number = 0.25,
  delta: number = 0.01,
): boolean {
  const vel = `velocity_${prop}`;
  if (current.__damp === undefined) current.__damp = {};
  if (current.__damp[vel] === undefined) current.__damp[vel] = 0;

  if (Math.abs(current[prop] - target) <= 0.001) {
    current[prop] = target;
    return false;
  }

  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const t = easing(omega * delta);
  let change = current[prop] - target;
  const originalTo = target;

  target = current[prop] - change;

  const temp = (current.__damp[vel] + omega * change) * delta;
  current.__damp[vel] = (current.__damp[vel] - omega * temp) * t;
  let output = target + (change + temp) * t;

  if (originalTo - current[prop] > 0.0 === output > originalTo) {
    output = originalTo;
    current.__damp[vel] = (output - originalTo) / delta;
  }

  current[prop] = output;
  return true;
}

export function patchMaterial(
  mode: FadeMode,
  mat: PatchedMaterial,
  fade: { value: number },
  shadersMap: Map<Material, ShaderRef>,
) {
  if (mat[PATCHED]) return;

  if (mode === "alpha" && mat?.blending === CustomBlending) return;

  mat[ORIGINAL_STATE] = {
    transparent: mat.transparent,
    forceSinglePass: mat.forceSinglePass,
    onBeforeCompile: mat.onBeforeCompile,
  };

  if (mode === "alpha") {
    mat.transparent = true;
    mat.forceSinglePass = true;
  }

  mat[PATCHED] = true;

  const originalOnBeforeCompile = mat.onBeforeCompile;

  mat.onBeforeCompile = (shader, renderer) => {
    originalOnBeforeCompile?.(shader, renderer);

    shader.uniforms.uFade = shader.uniforms.uFade ?? { value: fade.value };

    if (!shader.fragmentShader.includes("_main()")) {
      shader.fragmentShader = shader.fragmentShader.replace(/void\s+main\s*\(\s*\)/, "void _main()");
      shader.fragmentShader += fadeShaders[mode];
    }

    shadersMap.set(mat, shader as unknown as ShaderRef);
  };

  mat.needsUpdate = true;
}

export function patchObject(
  obj: Object3D,
  fade: { value: number },
  shadersMap: Map<Material, ShaderRef>,
  meshesMap: Map<Mesh, boolean>,
  mode: FadeMode,
) {
  if ((obj as Mesh).isMesh && (obj as Mesh).material) {
    const mesh = obj as Mesh;

    const originallyVisible =
      ORIGINAL_VISIBLE in (mesh as any) ? ((mesh as any)[ORIGINAL_VISIBLE] as boolean) : mesh.visible;
    const mats = toMaterials(mesh.material);
    mats.forEach((mat) => patchMaterial(mode, mat as PatchedMaterial, fade, shadersMap));
    meshesMap.set(mesh, originallyVisible);
    if (originallyVisible) {
      mesh.visible = fade.value > fadeModeThresholds[mode];
    }
  }
}

export function attachListener(
  obj: ListeningObject,
  fade: { value: number },
  shadersMap: Map<Material, ShaderRef>,
  meshesMap: Map<Mesh, boolean>,
  mode: FadeMode,
) {
  if (obj[LISTENING]) return;
  obj[LISTENING] = true;

  if (!obj.userData.__alphaFadeCleanup) {
    obj.userData.__alphaFadeCleanup = [];
  }

  if ((obj as Mesh).isMesh) {
    const mesh = obj as Mesh;
    const descriptorInfo = getMaterialDescriptorInfo(mesh);
    let _lastMaterial: MeshMaterial = mesh.material;
    let fallbackMaterial: MeshMaterial = mesh.material;

    const syncPatchedMaterials = (nextMaterial: MeshMaterial) => {
      const nextMats = toMaterials(nextMaterial);
      const isAlreadyTracked = nextMats.every((mat) => shadersMap.has(mat));
      if (nextMaterial === _lastMaterial && isAlreadyTracked) return;

      _lastMaterial = nextMaterial;

      nextMats.forEach((mat) => {
        patchMaterial(mode, mat as PatchedMaterial, fade, shadersMap);
      });
    };

    Object.defineProperty(mesh, "material", {
      configurable: true,
      enumerable: descriptorInfo.descriptor?.enumerable ?? true,
      get() {
        return readCurrentMaterial(this as Mesh, descriptorInfo.getter, fallbackMaterial);
      },
      set(value: MeshMaterial) {
        if (descriptorInfo.setter) {
          descriptorInfo.setter.call(this as Mesh, value);
        } else {
          fallbackMaterial = value;
        }

        const currentMaterial = readCurrentMaterial(this as Mesh, descriptorInfo.getter, fallbackMaterial);
        syncPatchedMaterials(currentMaterial);
      },
    });

    syncPatchedMaterials(readCurrentMaterial(mesh, descriptorInfo.getter, fallbackMaterial));

    obj.userData.__alphaFadeCleanup.push(() => {
      if (descriptorInfo.hadOwnDescriptor && descriptorInfo.ownDescriptor) {
        Object.defineProperty(mesh, "material", descriptorInfo.ownDescriptor);
      } else {
        delete (mesh as any).material;
      }
    });
  }

  const handleChildAdded = (event: any) => {
    const child = event.child as ListeningObject;
    child.traverse((o) => patchObject(o, fade, shadersMap, meshesMap, mode));
    child.traverse((o) => attachListener(o as ListeningObject, fade, shadersMap, meshesMap, mode));
  };

  const handleChildRemoved = (event: any) => {
    const child = event.child as Object3D;
    child.traverse((o) => {
      if ((o as Mesh).isMesh) {
        const mesh = o as Mesh;
        meshesMap.delete(mesh);
        const mats = toMaterials(mesh.material);
        mats.forEach((mat) => shadersMap.delete(mat));
        cleanupMaterials(mats);
      }
      const cleanups = o.userData.__alphaFadeCleanup as (() => void)[] | undefined;
      if (cleanups) {
        cleanups.forEach((fn) => fn());
        delete o.userData.__alphaFadeCleanup;
      }
    });
  };

  obj.addEventListener("childadded", handleChildAdded);
  obj.addEventListener("childremoved", handleChildRemoved);

  obj.userData.__alphaFadeCleanup.push(() => {
    obj.removeEventListener("childadded", handleChildAdded);
    obj.removeEventListener("childremoved", handleChildRemoved);
    obj[LISTENING] = false;
  });
}

export function cleanupListeners(root: Object3D) {
  root.traverse((obj) => {
    const cleanups = obj.userData.__alphaFadeCleanup as (() => void)[] | undefined;
    if (cleanups) {
      cleanups.forEach((fn) => fn());
      delete obj.userData.__alphaFadeCleanup;
    }

    if ((obj as Mesh).isMesh && (obj as Mesh).material) {
      const mats = toMaterials((obj as Mesh).material);
      cleanupMaterials(mats);
    }
  });
}
