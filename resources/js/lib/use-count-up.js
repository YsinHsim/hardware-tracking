import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "motion/react";

// Animates a number from 0 to `value` on mount and whenever `value` changes.
// Returns an integer string. With reduced motion enabled, returns the value
// immediately without animating.
export function useCountUp(value, { duration = 0.9, delay = 0 } = {}) {
    const reduceMotion = useReducedMotion();
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (reduceMotion) {
            setDisplay(value);
            return;
        }

        setDisplay(0);
        const controls = animate(0, value, {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1], // easeOutExpo-ish, matches the spring entrances
            onUpdate: (latest) => setDisplay(Math.round(latest)),
        });

        return () => controls.stop();
    }, [value, reduceMotion, duration, delay]);

    return reduceMotion ? value : display;
}
