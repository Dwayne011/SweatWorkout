/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * One-time swipe-to-delete hint (w5). The resting rows stay clean; this shows
 * once (per install) above the exercise list with a little demo row peeking
 * left to reveal the delete pane, so it's clear sets and exercises can be
 * swiped away. Auto-dismisses, or tap to dismiss.
 */
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Trash2 } from "lucide-react";

const KEY = "projectpb_swipe_hint_seen";

export default function SwipeHint() {
  const [show, setShow] = useState(() => {
    try { return !localStorage.getItem(KEY); } catch { return false; }
  });

  const dismiss = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* ignore */ }
    setShow(false);
  };

  useEffect(() => {
    if (!show) return;
    const t = setTimeout(dismiss, 5600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  return (
    <motion.div
      className="pbw-swipehint-tip"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onClick={dismiss}
    >
      <div className="demo">
        <div className="delpane"><Trash2 /></div>
        <motion.div
          className="row"
          animate={{ x: [0, -38, -38, 0, 0] }}
          transition={{ duration: 2.6, times: [0, 0.18, 0.42, 0.62, 1], repeat: Infinity, repeatDelay: 0.5, ease: "easeInOut" }}
        >
          <span className="dots" />
          <span className="lbl">Set 1</span>
        </motion.div>
      </div>
      <div className="txt">
        <b>Swipe left to delete</b>
        <span>Drag a set or exercise row left to remove it. Tap to dismiss.</span>
      </div>
    </motion.div>
  );
}
