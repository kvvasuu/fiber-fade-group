import { Eye, EyeOff, Loader2, Play } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { useMainStore, type Store } from "../store";
import Carousel from "./Carousel";

const visibilityKeyByMode: Record<Store["selectedMode"], keyof Store> = {
  alpha: "alphaVisible",
  noise: "noiseVisible",
  dissolve: "dissolveVisible",
  dither: "ditherVisible",
};

const modes = [
  {
    title: "dissolve",
    model: '"Desert Portal" by Stas P',
    href: "https://sketchfab.com/3d-models/desert-portal-2b7a44c47b47497085b1f7b82a94c202",
  },
  {
    title: "noise",
    model: '"Stylized Mushroom" by Agata Wilczek',
    href: "https://sketchfab.com/3d-models/stylized-mushroom-4-7262b8835a114d36a8d7e170002479e1",
  },
  {
    title: "alpha",
    model: "",
    href: "",
  },
  {
    title: "dither",
    model: '"Koi Fish" by 7PLUS',
    href: "https://sketchfab.com/3d-models/koi-fish-236859b809984f52b70c94fd040b9c59",
  },
] as const;

const modeDescriptionByMode: Record<Store["selectedMode"], string> = {
  alpha:
    "True alpha transparency. Smooth fade. Fragment opacity is interpolated in the alpha channel.\n\nDue to current technical constraints of rendering, this mode can sometimes produce unexpected visual behavior in specific setups.\n\nIn the attached example, DepthOfField is enabled, which can make a halo/outline remain visible until the mesh is fully hidden.\n\nYou can also click object to start fading and see the alpha effect in action.",
  noise:
    "A procedural noise field modulates per-fragment cutoff, producing a spatially non-linear fade mask.\n\nYou can also click object to start fading and see the noise effect in action.",
  dissolve:
    "Smooth noise dissolve with an edge highlight.\n\nIn this example, a floating stone moves back and forth through the portal, and fade is driven manually by the animation progress.\n\nTry clicking the stones above the portal to hide them individually. \n\nYou can also click whole scene to start stone animations and see the dissolve effect in action. ",
  dither:
    "Opacity is quantized through a dithering pattern, trading smooth gradients for temporally stable binary coverage.\n\nYou can also click object to start fading and see the dithering effect in action.",
};

export default function Overlay({ show }: { show?: boolean }) {
  const [index, setIndex] = useState(0);
  const selectedMode = useMainStore((state) => state.selectedMode);
  const selectedModeVisible = useMainStore((state) => state[visibilityKeyByMode[state.selectedMode]] as boolean);
  const isDissolveMode = selectedMode === "dissolve";
  const dissolveFlying = useMainStore((state) => state.dissolveFlying);
  const selectedModeDescription = modeDescriptionByMode[selectedMode];

  return (
    <motion.div
      className="absolute inset-0 z-10 pointer-events-none select-none"
      draggable={false}
      initial={{ opacity: 0 }}
      animate={{ opacity: show ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <a
        href="https://github.com/kvvasuu/fiber-fade-group"
        target="_blank"
        rel="author"
        className="absolute px-2 pt-2 sm:px-8 sm:pt-8 flex flex-col transition-colors text-foreground/75 hover:text-neutral-50"
      >
        <h1 className="pointer-events-auto font-display text-3xl sm:text-4xl m-0">Fiber Fade Group</h1>
        <span className="-mt-2 pl-px text-[10px] sm:text-xs">by Kvvasu</span>
      </a>

      <button
        disabled={isDissolveMode && dissolveFlying}
        className={
          "hidden md:flex absolute bottom-30 text-xs shadow-lg shadow-black/5 left-1/2 -translate-x-1/2 group bg-white/10 border  flex-row items-center  text-foreground gap-2 uppercase border-foreground/25 backdrop-blur-md rounded-lg py-2 px-4 sm:py-2.5 sm:px-5 transition-all pointer-events-auto cursor-pointer disabled:pointer-events-none disabled:opacity-70 hover:-translate-y-0.5 text-shadow-2xs "
        }
        onClick={() => {
          if (isDissolveMode) {
            useMainStore.setState((state) => ({ dissolveVisible: !state.dissolveVisible }));
            return;
          }

          useMainStore.setState((state) => {
            const visibilityKey = visibilityKeyByMode[state.selectedMode];
            return { [visibilityKey]: !state[visibilityKey] } as Partial<Store>;
          });
        }}
      >
        {isDissolveMode ? (
          dissolveFlying ? (
            <Loader2 size={16} className="text-foreground/40 animate-spin" />
          ) : (
            <Play size={16} className="text-foreground/40 group-hover:text-foreground/70 transition-colors" />
          )
        ) : selectedModeVisible ? (
          <EyeOff size={16} className="text-foreground/40 group-hover:text-foreground/70 transition-colors" />
        ) : (
          <Eye size={16} className="text-foreground/40 group-hover:text-foreground/70 transition-colors" />
        )}
        {isDissolveMode ? (dissolveFlying ? "In transit" : "Start") : selectedModeVisible ? "Hide" : "Show"}
      </button>

      <Carousel
        items={modes.map((mode) => (
          <p>{mode.title}</p>
        ))}
        index={index}
        onChange={(index) => {
          setIndex(index);
          useMainStore.setState({ selectedMode: modes[index].title });
        }}
      />

      <footer className="absolute bottom-0.5 text-center w-full text-foreground/30 sm:text-foreground/75 text-[0.6rem] select-none pointer-events-auto z-10">
        <LayoutGroup>
          <AnimatePresence initial={false} mode="wait">
            {modes.map((mode) => {
              if (mode.title !== modes[index].title || mode.model === "") return null;
              return (
                <motion.a
                  layout
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ type: "tween", duration: 0.2 }}
                  key={mode.title}
                  href={mode.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-foreground"
                >
                  {mode.model}
                </motion.a>
              );
            })}
          </AnimatePresence>
        </LayoutGroup>
      </footer>

      <div className="md:h-3/5 w-full md:w-1/3 absolute bottom-24 md:bottom-0 right-0 pointer-events-none md:py-12 px-8 md:px-24 flex flex-col items-start justify-start gap-4">
        <div className="space-y-2">
          <p className="hidden md:block text-[10px] uppercase tracking-[0.18em] text-foreground/50">Current mode: {selectedMode}</p>
          <p className="text-sm text-foreground/80 whitespace-pre-line leading-tight">{selectedModeDescription}</p>
        </div>
      </div>
    </motion.div>
  );
}
