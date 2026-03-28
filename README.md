# Fiber Fade Group

[![Version](https://badgen.net/npm/v/fiber-fade-group)](https://www.npmjs.com/package/fiber-fade-group)

Animated show/hide component and hook for [React Three Fiber](https://github.com/pmndrs/react-three-fiber) with multiple shader-based fade modes.

## Description

**Fiber Fade Group** lets you animate objects in and out of your R3F scene using shader-based effects. It patches materials at compile time via `onBeforeCompile`, leaving original shaders intact and avoiding unnecessary re-renders.

Four fade modes are available:

| Mode       | Description                                                                                                                                                                                                                                                                                                                                                                                          |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `alpha`    | True alpha transparency. Smooth fade. Works for most standard materials, but sets `transparent = true` on them in order to manipulate alpha in the shader — this moves the affected materials earlier in the render queue (before opaque objects), which can cause unexpected behavior on materials with transmission elsewhere in the scene. In that case, prefer `dither`, `noise`, or `dissolve`. |
| `dither`   | Ordered dithering (Bayer 8×8 matrix). Stable, no transparency overhead.                                                                                                                                                                                                                                                                                                                              |
| `noise`    | Random per-pixel hash noise pattern. Stable.                                                                                                                                                                                                                                                                                                                                                         |
| `dissolve` | Smooth noise dissolve with an edge highlight. Stable.                                                                                                                                                                                                                                                                                                                                                |

## Installation

```bash
npm install fiber-fade-group
```

Alternatively, since the library is small, you can copy the source files directly into your project instead of adding a dependency.

## Quickstart

### Component

```jsx
import { FadeGroup } from "fiber-fade-group";

<FadeGroup visible={isVisible} mode="dither">
  <mesh>
    <boxGeometry />
    <meshStandardMaterial />
  </mesh>
</FadeGroup>;
```

### Hook

```jsx
import { useRef } from "react";
import { useFadeGroup } from "fiber-fade-group";

const MyObject = ({ visible }) => {
  const ref = useRef();
  useFadeGroup(ref, visible, { mode: "dissolve", damping: 0.15 });

  return (
    <group ref={ref}>
      <mesh>...</mesh>
    </group>
  );
};
```

## API

### `<FadeGroup>`

| Prop             | Type                                           | Default   | Description                                                          |
| ---------------- | ---------------------------------------------- | --------- | -------------------------------------------------------------------- |
| `visible`        | `boolean`                                      | `true`    | Show or hide children.                                               |
| `mode`           | `"alpha" \| "dither" \| "noise" \| "dissolve"` | `"alpha"` | Fade effect mode. Not reactive — changing after mount has no effect. |
| `damping`        | `number`                                       | `0.2`     | Spring smoothing. Lower = faster. Set to 0 to disable animation.     |
| `manual`         | `boolean`                                      | `false`   | Disable auto-animation; control `fade.current.value` yourself.       |
| `onFadeComplete` | `(value: number) => void`                      | –         | Called when animation reaches 0 or 1.                                |

The forwarded ref is typed as `FadeGroupRef` (`Group & UseFadeGroupReturn`) and exposes the underlying `Group` along with `fade`, `isVisible`, and `isFading` refs — the same values returned by `useFadeGroup`.

```tsx
import { useRef } from "react";
import { FadeGroup, type FadeGroupRef } from "fiber-fade-group";

const ref = useRef<FadeGroupRef>(null);

<FadeGroup ref={ref} visible={isVisible}>
  <mesh>...</mesh>
</FadeGroup>;

// Access anywhere:
ref.current?.fade.current.value; // current fade value (0–1)
ref.current?.isVisible.current; // true when at least partially visible
ref.current?.isFading.current; // true while animating
```

### `useFadeGroup(ref, visible, options)`

Returns `{ fade, isVisible, isFading }`.

| Return      | Type                           | Description                                                 |
| ----------- | ------------------------------ | ----------------------------------------------------------- |
| `fade`      | `RefObject<{ value: number }>` | Current fade value (0–1). Set manually when `manual: true`. |
| `isVisible` | `RefObject<boolean>`           | `true` when at least partially visible.                     |
| `isFading`  | `RefObject<boolean>`           | `true` while animation is in progress.                      |

## Support

If this project helps you, consider supporting development.

- GitHub Sponsors: https://github.com/sponsors/kvvasuu

## License

MIT – free to use, modify, and expand.
