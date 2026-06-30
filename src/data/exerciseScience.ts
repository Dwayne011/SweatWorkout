/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Authored exercise science — the "Why this works" and "Watch out for" copy for
 * the exercise-detail page. Plain coaching language, grounded in established
 * biomechanics, muscle actions, and the well-documented common form errors
 * (not model-invented studies, no citations claimed).
 *
 * STATUS: first draft, pending the owner's review pass. Anything not yet in this
 * map falls back to the exercise's `coachTip` (for "why") or a "coming soon"
 * line on the detail page, so partial coverage is safe.
 *
 * Batches: Chest ✅ · Back ⬜ · Shoulders ⬜ · Legs ⬜ · Glutes ⬜ · Calves ⬜ ·
 * Arms ⬜ · Core ⬜. (Cardio is conditioning — no per-muscle science copy.)
 */

export interface ExerciseScience {
  /** Why the movement works — the stimulus + mechanism, in plain terms. */
  why: string;
  /** The most common form errors / what to avoid. */
  watchOut: string;
}

export const exerciseScience: Record<string, ExerciseScience> = {
  // ==================== CHEST ====================
  "barbell-bench-press": {
    why: "The flat barbell press is the heaviest loadable horizontal push, so it drives the most total tension through the mid and lower chest while the front delts and triceps assist. The barbell also lets you add small, steady weight jumps over time, which is what makes it such a reliable strength and size builder.",
    watchOut: "Flaring the elbows out to 90° and bouncing the bar off the chest. Keep a slight elbow tuck (around 45–75°), shoulder blades pulled back and down, and lower under control to the mid-chest — don't let the shoulders round forward at the bottom.",
  },
  "close-grip-bench-press": {
    why: "Narrowing the grip shifts more of the work onto the triceps while still loading the inner and mid chest, so it doubles as a pressing-power and lockout-strength builder that carries over to your other presses.",
    watchOut: "Going too narrow strains the wrists and elbows. Keep the hands about shoulder-width, wrists stacked over the elbows, and the elbows tracking close to the ribs rather than flaring out.",
  },
  "wide-grip-bench-press": {
    why: "A wider grip shortens the press distance and biases the outer chest and front delts, emphasising the stretch on the pecs at the bottom of each rep.",
    watchOut: "Too wide overstresses the shoulder joint. Don't lower so deep that the shoulders roll forward — keep the blades retracted and stop where you still feel the chest, not the front of the shoulder.",
  },
  "incline-barbell-bench-press": {
    why: "Tilting the bench to 15–30° points the press path higher, putting more tension on the upper (clavicular) chest and front delts — the region a flat press tends to under-train.",
    watchOut: "Setting the bench too steep (over ~45°) turns it into a shoulder press. Keep the incline moderate and the bar path over the upper chest, not up by the throat.",
  },
  "decline-barbell-bench-press": {
    why: "The decline angle lines the press up with the lower chest fibres and shortens the range, which often lets you handle slightly more load with less shoulder strain.",
    watchOut: "Getting in and out safely is the main risk — use a spotter or a weight you fully control. Keep the bar over the lower chest and avoid bouncing it at the bottom.",
  },
  "dumbbell-bench-press": {
    why: "Dumbbells free each arm to move independently and travel through a longer range, so the chest gets a deeper stretch and both sides are trained evenly without the stronger side taking over.",
    watchOut: "Letting the dumbbells drift apart or clash at the top, and dropping the elbows too far below the bench. Lower to a comfortable stretch, not a painful one, and press in a slight arc without banging the bells together.",
  },
  "incline-dumbbell-press": {
    why: "Combines the upper-chest angle of the incline with the deeper stretch and even loading of dumbbells, making it one of the best builders for the often-lagging upper chest.",
    watchOut: "An over-steep bench or pressing the weights back over your face. Keep a moderate incline and press up over the upper chest, lowering only to a stretch you control.",
  },
  "decline-dumbbell-press": {
    why: "Targets the lower chest through a long, free range with each arm loaded independently for balanced development.",
    watchOut: "Control on the way down matters most at this angle — don't let the shoulders shrug up or the bells drop past a comfortable stretch.",
  },
  "dumbbell-flyes": {
    why: "An isolation move: with a slight, fixed elbow bend, the chest does the work of bringing the arms together (adduction), training the stretch and the squeeze rather than pressing strength.",
    watchOut: "Bending the elbows more as you lower turns it into a press, and dropping too deep stresses the shoulder. Keep a soft, fixed elbow angle and stop the stretch before the front of the shoulder takes over.",
  },
  "incline-dumbbell-flyes": {
    why: "The incline aims the fly at the upper chest, loading it hard in the stretched position where it responds well.",
    watchOut: "Same as flat flyes — keep the elbows soft and fixed and the stretch controlled. Don't chase depth at the expense of the shoulder joint.",
  },
  "decline-dumbbell-flyes": {
    why: "Isolates the lower chest through adduction, with strong tension in the stretched bottom position.",
    watchOut: "Keep the elbow angle locked and the range within a comfortable stretch; let the chest, not momentum, bring the arms together.",
  },
  "chest-press-machine": {
    why: "A fixed press path means you don't have to balance the load, so you can push the chest close to failure safely — useful when learning to press and for high-effort finishing sets.",
    watchOut: "A seat set so the handles aren't at chest height, and letting the stack slam. Adjust the seat so you press straight out from the mid-chest, and control the return.",
  },
  "incline-chest-press-machine": {
    why: "Trains the upper chest on a guided path, so you can load it hard and take it to failure without a spotter.",
    watchOut: "The wrong seat height changes the angle — set it so the handles line up with the upper chest, and don't shrug the shoulders up to move the weight.",
  },
  "hammer-strength-chest-press": {
    why: "Plate-loaded converging handles follow the chest's natural arc and let each arm work independently, giving a strong squeeze at the top with very stable loading.",
    watchOut: "Letting the dominant side push harder, and trading range for load. Press both arms evenly through a full, controlled path.",
  },
  "pec-deck": {
    why: "Isolates the chest in pure adduction with constant machine tension and no balance demand, making it a clean way to train the squeeze and pile up volume.",
    watchOut: "Yanking the pads together with the shoulders rolled forward. Keep the back on the pad, shoulders down, and bring the arms together with the chest rather than the front delts.",
  },
  "cable-chest-fly": {
    why: "Cables keep tension on the chest through the whole range — including the fully squeezed position where free-weight flyes go light — so the chest works hard from stretch to contraction.",
    watchOut: "Using so much weight that it becomes a press. Keep a soft, fixed elbow, lead with the chest, and control the stretch rather than letting the arms get yanked back.",
  },
  "low-to-high-cable-fly": {
    why: "Pulling from low to high matches the line of the upper chest fibres, giving a strong upper-chest contraction under constant cable tension.",
    watchOut: "Shrugging the shoulders up to finish the rep. Drive the hands up and in with the chest while keeping the shoulders set down.",
  },
  "high-to-low-cable-fly": {
    why: "Pulling from high to low targets the lower chest fibres, with constant tension and a strong squeeze at the bottom.",
    watchOut: "Leaning forward and pressing with the arms. Keep a fixed elbow and finish each rep by bringing the hands together low, led by the chest.",
  },
  "single-arm-cable-fly": {
    why: "Working one side at a time lets you train each pec through a full range with constant tension and iron out any left-to-right imbalance.",
    watchOut: "Twisting the torso to help the arm. Brace the core, keep the hips square, and move only the working arm.",
  },
  "cable-chest-press": {
    why: "A pressing pattern with constant cable tension and the freedom to find a natural path — blending pressing strength with the steady load cables provide.",
    watchOut: "Letting the cables pull the hands too far back at the start. Keep the shoulders set and press from a controlled, comfortable stretch.",
  },
  "push-up": {
    why: "The bodyweight horizontal press — it trains the chest, front delts and triceps together while the core braces, and it scales from beginner to advanced with leverage and added load.",
    watchOut: "Sagging or hiking the hips and flaring the elbows wide. Keep a straight line from head to heels, brace the core, and let the elbows track back at about 45°.",
  },
  "incline-push-up": {
    why: "Raising the hands reduces the load, making the push-up pattern accessible while still training the chest, shoulders and triceps — a good entry point or high-rep option.",
    watchOut: "Letting the hips sag as you tire. Keep the body in one line and lower with control even though it feels easier.",
  },
  "decline-push-up": {
    why: "Elevating the feet shifts more bodyweight onto the arms and biases the upper chest and shoulders, raising the difficulty with no equipment.",
    watchOut: "The hips piking up or the lower back arching. Keep a straight line and don't let the head drop toward the floor first.",
  },
  "diamond-push-up": {
    why: "Bringing the hands together under the chest shifts emphasis onto the triceps and inner chest, and raises the difficulty of the standard push-up.",
    watchOut: "Letting the elbows flare wide (which defeats the triceps focus) or the hips sag. Keep the elbows tucked toward the body and the torso braced.",
  },
  "weighted-push-up": {
    why: "Adding load (a plate, vest or band) takes the push-up past bodyweight into a hypertrophy and strength rep range, progressing the pattern once standard reps get easy.",
    watchOut: "Letting form break down under the added weight. Keep the straight-line position and full range rather than shortening the reps to move the load.",
  },
  "dips-chest-focus": {
    why: "Leaning the torso forward on a dip points the movement at the lower chest, loading it through a deep stretch under bodyweight (and added weight later).",
    watchOut: "Dropping too fast and over-stretching the shoulder. Lean forward, lower under control to a comfortable depth, and don't let the shoulders shrug up at the bottom.",
  },
  "assisted-chest-dip": {
    why: "Machine or band assistance lets you train the chest-focused dip with proper forward-lean technique before you can do full bodyweight reps.",
    watchOut: "Relying on the assist to rush the reps. Use the forward lean and full range, and reduce the assistance gradually as you get stronger.",
  },
  "smith-machine-bench-press": {
    why: "The fixed vertical bar path removes the balance demand, so you can press heavy and close to failure with less stabilising — handy for controlled overload and for learning the press.",
    watchOut: "The path is locked, so set your bench and shoulder position to match it. Sliding too far up or down the bench puts the press on the wrong part of the chest or onto the shoulders.",
  },
  "smith-machine-incline-press": {
    why: "Combines the upper-chest incline angle with the Smith's fixed path, letting you load the upper chest hard without balancing the bar.",
    watchOut: "Set the bench so the fixed bar lands on the upper chest, not the neck, and keep the shoulders retracted against the locked path.",
  },
  "landmine-press": {
    why: "Pressing a barbell anchored at one end gives an arcing, shoulder-friendly path that hits the upper chest and front delt, with the core working to resist rotation.",
    watchOut: "Letting the lower back arch or the torso twist. Brace the core, keep the ribs down, and press up and slightly in along the bar's arc.",
  },
  "svend-press": {
    why: "Squeezing plates together and pressing out keeps the chest under constant adduction tension — a light finishing move for the inner chest and the mind-muscle squeeze.",
    watchOut: "It's a low-load isolation move, so don't chase heavy weight. Keep the plates pressed firmly together the whole time and move slowly.",
  },
  "plate-press": {
    why: "Gripping and squeezing a plate while pressing keeps constant inward tension on the chest, training the squeeze with minimal equipment.",
    watchOut: "Loosening the squeeze mid-rep loses the tension that makes it work. Keep pressing the plate together and control the range.",
  },
  "floor-press": {
    why: "Pressing from the floor stops the elbows at the ground, taking the shoulder out of deep stretch and emphasising the mid-range and lockout (triceps and mid-chest) — easier on cranky shoulders.",
    watchOut: "Bouncing the elbows or the weight off the floor. Touch lightly and press without using the floor as a rebound.",
  },
  "resistance-band-chest-press": {
    why: "Bands add resistance that climbs as you press out, so the chest is loaded most in the contracted position — a joint-friendly, travel-friendly press option.",
    watchOut: "Anchor the band securely and keep tension throughout; letting it go slack at the start kills the stimulus. Control the return rather than letting the band snap you back.",
  },
  "resistance-band-fly": {
    why: "Band flyes train chest adduction with rising tension toward the squeeze, isolating the chest with no joint compression and minimal kit.",
    watchOut: "Keep a soft, fixed elbow and control the band back — don't let it pull the arms into an aggressive stretch or yank you backward.",
  },
};
