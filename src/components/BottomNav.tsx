/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bottom nav (bottom-nav-spec.md). One shared component, every screen. The
 * active tab is an expanding violet pill that holds the icon + label; the others
 * sit as quiet icons with an under-label so every page is named. Each tab's size
 * is driven by a registered `--exp` (0→1) custom property, so the whole pill —
 * padding, label width, icon scale, the under-label collapse — transitions as
 * one when you tap a new tab. Reduced motion snaps instead of animating.
 *
 * Note: the spec's press-and-hold "scrub between tabs" gesture was attempted
 * (React + native non-passive pointer listeners, touch-action:none) but would
 * not engage reliably in the Android WebView, so it was dropped in favour of a
 * dependable tap. The expanding-pill look and motion are unchanged.
 */
import React from "react";

export interface NavTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface Props {
  tabs: NavTab[];
  activeKey: string;
  onSelect: (key: string) => void;
}

export default function BottomNav({ tabs, activeKey, onSelect }: Props) {
  return (
    <nav className="pbw-enav">
      {tabs.map((t) => {
        const on = t.key === activeKey;
        return (
          <a
            key={t.key}
            className={`item${on ? " active" : ""}`}
            style={{ ["--exp" as any]: on ? 1 : 0, WebkitTapHighlightColor: "transparent" }}
            onClick={() => onSelect(t.key)}
          >
            <span className="pill"><span className="ic">{t.icon}</span><span className="lblIn">{t.label}</span></span>
            <span className="lblUnder">{t.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
