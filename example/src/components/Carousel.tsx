import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useRef } from "react";

interface CarouselProps {
  items: ReactNode[];
  index: number;
  onChange: (index: number) => void;
}

const Carousel = ({ items, index, onChange }: CarouselProps) => {
  const direction = useRef(1);

  const prev = () => {
    direction.current = -1;
    onChange((index - 1 + items.length) % items.length);
  };

  const next = () => {
    direction.current = 1;
    onChange((index + 1) % items.length);
  };

  return (
    <div className="flex items-center gap-4 select-none absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-none">
      <button
        onClick={prev}
        className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10  transition-colors  cursor-pointer"
      >
        <ChevronLeft size={32} />
      </button>

      <div className="relative w-48 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction.current}>
          <motion.div
            key={index}
            custom={direction.current}
            variants={{
              initial: (d: number) => ({ x: d * 40, opacity: 0 }),
              animate: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -40, opacity: 0 }),
            }}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="text-center text-3xl uppercase tracking-widest"
          >
            {items[index]}
          </motion.div>
        </AnimatePresence>
      </div>

      <button
        onClick={next}
        className="pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors  cursor-pointer"
      >
        <ChevronRight size={32} />
      </button>
    </div>
  );
};

export default Carousel;
