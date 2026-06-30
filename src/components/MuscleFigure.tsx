/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Granular front/back body figures. Each shape is keyed to a sub-muscle region;
 * its fill is that region's bucket colour (from the per-muscle scores), and
 * untouched regions + the outline use currentColor so the figure reads in dark
 * and light. Only the violet intensities are literals. Shared by the
 * post-workout coach analysis and the Insights muscle map.
 */
import React from "react";
import { Muscle } from "../data/muscleMap";

export default function MuscleFigure({ view, color }: { view: "front" | "back"; color: Record<string, string> }) {
  const f = (m: Muscle) => {
    const c = color[m];
    return c ? { fill: c } : { fill: "currentColor", fillOpacity: 0.05 };
  };
  const base = { fill: "currentColor", fillOpacity: 0.05 };
  if (view === "front") {
    return (
      <svg className="fig" viewBox="0 0 360 470" width="190">
        <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5}>
          <circle cx="180" cy="42" r="22" {...base} />
          <rect x="170" y="62" width="20" height="14" rx="6" {...base} />
          {/* traps (front, upper) */}
          <path d="M160 70 L132 94 L152 96 L174 78 Z" {...f("traps")} />
          <path d="M200 70 L228 94 L208 96 L186 78 Z" {...f("traps")} />
          {/* side + front delts */}
          <ellipse cx="100" cy="116" rx="12" ry="17" {...f("delt_side")} />
          <ellipse cx="260" cy="116" rx="12" ry="17" {...f("delt_side")} />
          <ellipse cx="120" cy="108" rx="20" ry="16" {...f("delt_front")} />
          <ellipse cx="240" cy="108" rx="20" ry="16" {...f("delt_front")} />
          {/* chest: upper / mid / lower */}
          <rect x="142" y="96" width="36" height="13" rx="5" {...f("chest_upper")} />
          <rect x="182" y="96" width="36" height="13" rx="5" {...f("chest_upper")} />
          <rect x="142" y="111" width="36" height="13" rx="5" {...f("chest_mid")} />
          <rect x="182" y="111" width="36" height="13" rx="5" {...f("chest_mid")} />
          <rect x="142" y="126" width="36" height="14" rx="6" {...f("chest_lower")} />
          <rect x="182" y="126" width="36" height="14" rx="6" {...f("chest_lower")} />
          {/* biceps + forearms */}
          <rect x="104" y="126" width="22" height="54" rx="11" {...f("biceps")} />
          <rect x="234" y="126" width="22" height="54" rx="11" {...f("biceps")} />
          <rect x="101" y="184" width="20" height="56" rx="10" {...f("forearms")} />
          <rect x="239" y="184" width="20" height="56" rx="10" {...f("forearms")} />
          {/* obliques + abs */}
          <rect x="140" y="150" width="12" height="56" rx="5" {...f("obliques")} />
          <rect x="208" y="150" width="12" height="56" rx="5" {...f("obliques")} />
          <rect x="154" y="148" width="52" height="29" rx="9" {...f("abs")} />
          <rect x="154" y="180" width="52" height="29" rx="9" {...f("abs")} />
          {/* quads + adductors */}
          <rect x="144" y="224" width="26" height="96" rx="13" {...f("quads")} />
          <rect x="190" y="224" width="26" height="96" rx="13" {...f("quads")} />
          <rect x="170" y="228" width="9" height="66" rx="4" {...f("adductors")} />
          <rect x="181" y="228" width="9" height="66" rx="4" {...f("adductors")} />
          {/* lower legs (shin, no region) */}
          <rect x="150" y="326" width="26" height="84" rx="13" {...base} />
          <rect x="184" y="326" width="26" height="84" rx="13" {...base} />
        </g>
      </svg>
    );
  }
  return (
    <svg className="fig" viewBox="0 0 360 470" width="190">
      <g stroke="currentColor" strokeOpacity={0.12} strokeWidth={1.5}>
        <circle cx="180" cy="42" r="22" {...base} />
        {/* traps (back, upper diamond) */}
        <path d="M150 116 L180 80 L210 116 L196 138 L164 138 Z" {...f("traps")} />
        {/* side + rear delts */}
        <ellipse cx="100" cy="116" rx="12" ry="17" {...f("delt_side")} />
        <ellipse cx="260" cy="116" rx="12" ry="17" {...f("delt_side")} />
        <ellipse cx="120" cy="110" rx="20" ry="16" {...f("delt_rear")} />
        <ellipse cx="240" cy="110" rx="20" ry="16" {...f("delt_rear")} />
        {/* upper back (rhomboids / mid traps) */}
        <rect x="156" y="138" width="48" height="34" rx="8" {...f("upper_back")} />
        {/* lats */}
        <path d="M152 146 C140 178 152 206 178 214 L180 150 Z" {...f("lats")} />
        <path d="M208 146 C220 178 208 206 182 214 L180 150 Z" {...f("lats")} />
        {/* lower back (erectors) */}
        <rect x="165" y="206" width="30" height="40" rx="8" {...f("lower_back")} />
        {/* triceps + forearms */}
        <rect x="104" y="126" width="22" height="54" rx="11" {...f("triceps")} />
        <rect x="234" y="126" width="22" height="54" rx="11" {...f("triceps")} />
        <rect x="101" y="184" width="20" height="54" rx="10" {...f("forearms")} />
        <rect x="239" y="184" width="20" height="54" rx="10" {...f("forearms")} />
        {/* glutes */}
        <ellipse cx="165" cy="252" rx="22" ry="18" {...f("glutes")} />
        <ellipse cx="195" cy="252" rx="22" ry="18" {...f("glutes")} />
        {/* hamstrings */}
        <rect x="146" y="270" width="32" height="78" rx="15" {...f("hamstrings")} />
        <rect x="182" y="270" width="32" height="78" rx="15" {...f("hamstrings")} />
        {/* calves */}
        <rect x="150" y="352" width="26" height="74" rx="13" {...f("calves")} />
        <rect x="184" y="352" width="26" height="74" rx="13" {...f("calves")} />
      </g>
    </svg>
  );
}
