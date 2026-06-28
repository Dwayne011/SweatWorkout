/**
 * Shared press-feedback button — the single source of truth for how every
 * tappable button in Project PB responds to a press.
 *
 * Behaviour ("springy + lift", balanced): the button rests with a soft,
 * type-tinted drop shadow, squashes to scale 0.92 and dips 2px into the surface
 * while held (the shadow flattening toward the surface so the squash reads as
 * physical), then springs back with a gentle overshoot on release.
 *
 * Only the RESTING SHADOW differs by variant; the squash + spring is identical
 * everywhere. Outline / text / icon buttons get no resting shadow but still get
 * the press transform.
 *
 * Reduced motion: the squash + spring is replaced by a brief brightness dip,
 * no scale or translate.
 *
 * Haptics are NOT wired here — an ordinary button tap is visual-only. Haptics
 * stay at the named consequential moments (see src/lib/haptics.ts).
 */
import React, { forwardRef } from "react";
import { motion, useReducedMotion } from "motion/react";

export type ButtonVariant = "primary" | "accent" | "tonal" | "outline" | "text" | "icon" | "none";

// Resting + pressed (flattened) shadow per variant. Filled buttons cast a
// type-tinted shadow; unfilled buttons cast none but still squash.
const SHADOW: Record<ButtonVariant, { rest?: string; press?: string }> = {
  primary: { rest: "0 5px 16px -5px rgba(123,83,246,.55)", press: "0 1px 5px -3px rgba(123,83,246,.5)" },
  accent: { rest: "0 5px 16px -5px rgba(202,242,78,.5)", press: "0 1px 5px -3px rgba(202,242,78,.45)" },
  tonal: { rest: "0 4px 12px -4px rgba(0,0,0,.5)", press: "0 1px 4px -3px rgba(0,0,0,.45)" },
  outline: {},
  text: {},
  icon: {},
  none: {},
};

// scale 0.92 + 2px dip (translateY capped at 2px even on wide pills).
const PRESS = { scale: 0.92, y: 2 };
// Spring tuned to a back-ease feel: small overshoot, ~260ms settle, no wobble.
const SPRING = { type: "spring" as const, stiffness: 500, damping: 19, mass: 0.7 };

type MotionButtonProps = React.ComponentProps<typeof motion.button>;

export interface ButtonProps extends MotionButtonProps {
  variant?: ButtonVariant;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "none", className, style, children, ...rest },
  ref
) {
  const reduce = useReducedMotion();
  const sh = SHADOW[variant];
  return (
    <motion.button
      ref={ref}
      className={className}
      style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent", userSelect: "none", WebkitUserSelect: "none", ...(sh.rest ? { boxShadow: sh.rest } : null), ...style }}
      whileTap={
        reduce
          ? { filter: "brightness(0.92)" }
          : { ...PRESS, ...(sh.press ? { boxShadow: sh.press } : null) }
      }
      transition={reduce ? { duration: 0.12 } : SPRING}
      {...rest}
    >
      {children}
    </motion.button>
  );
});

export interface IconButtonProps extends ButtonProps {}

/** Convenience wrapper for icon-only buttons (no resting shadow, same press). */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "none", ...rest },
  ref
) {
  return <Button ref={ref} variant={variant} {...rest} />;
});

export default Button;
