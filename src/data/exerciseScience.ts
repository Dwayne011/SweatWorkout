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
 * Batches: Chest ✅ · Back ✅ · Shoulders ✅ · Legs ✅ · Glutes ✅ · Calves ✅ ·
 * Arms ✅ · Core ✅ — full first draft complete (Cardio is conditioning, no
 * per-muscle science copy). Awaiting the owner's review pass.
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

  // ==================== BACK ====================
  "conventional-deadlift": {
    why: "The deadlift is the foundational hip hinge — it loads the entire posterior chain (glutes, hamstrings, spinal erectors) plus the lats and traps as you pull the bar from the floor, building total-body pulling strength like nothing else.",
    watchOut: "Rounding the lower back and yanking with the arms. Brace the core, keep the bar against the legs, and drive the floor away so the bar and shoulders rise together.",
  },
  "rack-pull": {
    why: "Starting the bar elevated in a rack shortens it to the top half of the deadlift, letting you overload the upper back, traps and lockout with heavier weight and less low-back fatigue.",
    watchOut: "Leaning back hard at the top. Lock out by squeezing the glutes, not by arching the lower back, and keep the bar dragging up the thighs.",
  },
  "romanian-deadlift-back": {
    why: "Keeping the legs nearly straight and pushing the hips back loads the hamstrings and glutes through a deep stretch — a top builder for posterior-chain size and hinge strength.",
    watchOut: "Rounding the back or turning it into a squat. Soft knees, push the hips back, and lower only as far as your hamstrings allow with a flat back, then drive the hips forward.",
  },
  "sumo-deadlift-back": {
    why: "The wide stance and upright torso shift more work onto the glutes, adductors and quads while shortening the range — an alternative pull that's easier on the lower back for many lifters.",
    watchOut: "Knees caving in and hips shooting up first. Push the knees out over the toes, keep the chest up, and drive hips and shoulders together off the floor.",
  },
  "pull-up": {
    why: "The benchmark vertical pull — your bodyweight loads the lats, biceps and mid-back as you pull the chest to the bar, building width and pulling strength that scales with added weight.",
    watchOut: "Half-reps and swinging. Start from a full dead hang, pull the elbows down and back to bring the chest toward the bar, and lower under control rather than dropping.",
  },
  "weighted-pull-up": {
    why: "Adding load (belt, vest or dumbbell) pushes the pull-up into a lower rep range for strength and size once bodyweight reps get easy — the same progression as adding plates to a press.",
    watchOut: "Letting range shorten under the extra weight. Keep the full dead-hang-to-chest range and a controlled descent; add weight only when strict form holds.",
  },
  "assisted-pull-up": {
    why: "Band or machine assistance lets you train the full pull-up pattern with good technique before you can do bodyweight reps, building the lats and grip toward your first unassisted rep.",
    watchOut: "Bouncing off the band at the bottom. Use the assistance to control a full range, not to rebound, and reduce it as you get stronger.",
  },
  "chin-up": {
    why: "The underhand grip brings the biceps in more strongly alongside the lats, often letting you pull a little more weight — a great lat-and-biceps builder.",
    watchOut: "Not reaching a full hang or kipping. Control the bottom stretch and pull the chest to the bar with the back and arms, not a leg swing.",
  },
  "neutral-grip-pull-up": {
    why: "The palms-facing grip is the most shoulder-friendly vertical pull and brings in the brachialis and lats evenly — a comfortable way to build pulling volume.",
    watchOut: "Shrugging at the bottom instead of starting the pull from the lats. Set the shoulders down, then pull the elbows to the ribs.",
  },
  "lat-pulldown": {
    why: "A cable vertical pull you can load at any weight, training the lats through a full range — ideal for building pulling strength before pull-ups or adding back volume.",
    watchOut: "Leaning way back and using momentum. Keep the torso fairly upright, pull the bar to the upper chest by driving the elbows down, and control it back up.",
  },
  "wide-grip-lat-pulldown": {
    why: "A wider grip emphasises the outer lats and upper back, biasing back width.",
    watchOut: "Going so wide it strains the shoulders or shortens the range. Pull to the upper chest with the elbows driving down, not behind the neck.",
  },
  "close-grip-lat-pulldown": {
    why: "A closer (often neutral) grip increases the range and brings in the lower lats and biceps — good for back thickness and a strong contraction.",
    watchOut: "Rounding forward at the top. Keep the chest up, pull to the lower chest, and feel the lats rather than just bending the arms.",
  },
  "single-arm-lat-pulldown": {
    why: "Pulling one arm at a time gives a longer range and lets you fix side-to-side imbalances with a strong individual lat contraction.",
    watchOut: "Twisting the torso to help. Keep the hips and shoulders square and pull with the working lat only.",
  },
  "straight-arm-pulldown": {
    why: "With the elbows nearly locked, the lats do pure shoulder extension — an isolation move that builds the mind-muscle connection and keeps tension on the lats without the biceps taking over.",
    watchOut: "Bending the elbows into a triceps pushdown. Keep a fixed, soft elbow and move only at the shoulder.",
  },
  "barbell-row": {
    why: "A heavy horizontal pull — hinged over the bar, you row to the torso to build the mid-back, lats and rear delts, and the braced position trains the whole back isometrically.",
    watchOut: "Standing up with the weight and jerking the bar. Hold a stable hinge (~45° torso), row to the lower ribs with the elbows, and don't let the lower back round.",
  },
  "pendlay-row": {
    why: "Each rep starts from a dead stop on the floor with a flat back, so you build explosive pulling power and strict mid-back strength with no momentum.",
    watchOut: "Rounding the back to reach the floor or heaving up. Reset a flat-back position each rep, pull explosively to the lower chest, then control the bar back down.",
  },
  "yates-row": {
    why: "A more upright, underhand row that biases the lower lats and lets you handle heavier loads with a little body english, building back thickness.",
    watchOut: "Using so much momentum the back does nothing. Keep a controlled torso angle and pull with the elbows to the hips.",
  },
  "t-bar-row": {
    why: "The fixed bar path and neutral grip let you row heavy through the mid-back and lats with a strong squeeze and less balance demand than a free barbell.",
    watchOut: "Standing too upright and bouncing the weight off the floor. Stay hinged, pull to the chest, and control the negative.",
  },
  "chest-supported-t-bar-row": {
    why: "The chest pad removes the lower back and momentum, so the mid-back, lats and rear delts do all the work — one of the cleanest ways to overload back rowing.",
    watchOut: "Shrugging or jerking off the pad. Keep the chest down, pull with the elbows, and squeeze the shoulder blades together.",
  },
  "seated-cable-row": {
    why: "Constant cable tension lets you row to the torso through a full range and squeeze the mid-back hard at the contraction — a staple for back thickness.",
    watchOut: "Rocking back and forth with the lower back. Keep the torso fairly still, pull to the belly with the elbows, and let the shoulder blades retract rather than heaving.",
  },
  "close-grip-seated-cable-row": {
    why: "The close V-grip increases the range and brings in the lower lats and biceps with a strong squeeze.",
    watchOut: "Leaning back to move the weight. Keep an upright torso and drive the elbows back past the ribs.",
  },
  "wide-grip-cable-row": {
    why: "A wide bar shifts the row toward the upper back and rear delts, balancing thickness with the upper-back detail rows often miss.",
    watchOut: "Letting the elbows drop and turning it into a lat row. Keep the elbows high and pull to the upper belly, squeezing the upper back.",
  },
  "single-arm-cable-row": {
    why: "One arm at a time gives a long range with constant tension and lets you even out left-to-right, rotating slightly for a bigger lat stretch and contraction.",
    watchOut: "Over-rotating with the lower back. Allow a small controlled rotation but pull with the lat, keeping the hips square.",
  },
  "dumbbell-row": {
    why: "Braced on a bench, rowing one dumbbell lets the lat work through a long range with a deep stretch and strong contraction, fixing imbalances along the way.",
    watchOut: "Twisting the torso open to swing the weight up. Keep the back flat and square, pull the dumbbell to the hip with the elbow, and lower to a full stretch.",
  },
  "kroc-row": {
    why: "A high-rep, heavier dumbbell row with controlled body english — it builds the lats, traps and a serious grip through high effort and volume.",
    watchOut: "Turning it into a full-body heave with a rounded back. Keep the spine neutral, allow only slight momentum, and still pull with the back.",
  },
  "chest-supported-dumbbell-row": {
    why: "Lying chest-down on an incline removes the lower back and cheating, isolating the mid-back, lats and rear delts for clean rowing volume.",
    watchOut: "Shrugging up instead of rowing back. Keep the chest on the pad and drive the elbows toward the hips, squeezing the blades.",
  },
  "incline-dumbbell-row": {
    why: "Chest supported on an incline bench, this rows the lats and upper back through a long range with no momentum — a strict thickness builder.",
    watchOut: "Jerking the weight or rowing too high toward the shoulders. Pull to the lower ribs with control and a full stretch at the bottom.",
  },
  "machine-row": {
    why: "A guided row path means no balance demand, so you can push the mid-back and lats close to failure safely and chase a strong squeeze.",
    watchOut: "Using the seat or momentum to move the stack. Set the chest pad, pull with the elbows, and control the return.",
  },
  "hammer-strength-row": {
    why: "Plate-loaded independent handles follow a natural rowing arc and let each side work alone, giving a heavy, stable mid-back and lat stimulus with a strong contraction.",
    watchOut: "Letting the dominant side dominate. Row both arms evenly through a full range and squeeze at the back.",
  },
  "seal-row": {
    why: "Lying face-down on a raised bench, the seal row removes every bit of momentum and lower-back involvement, so the mid-back and lats get pure, strict tension.",
    watchOut: "Bouncing the bar at the bottom or shrugging. Pull to the bench edge with the elbows and control the full stretch.",
  },
  "inverted-row": {
    why: "A bodyweight horizontal pull — adjusting your body angle scales the difficulty while you row the chest to the bar, building the mid-back, lats and rear delts.",
    watchOut: "Sagging the hips or shortening the range. Keep a straight line from head to heels and pull the chest all the way to the bar.",
  },
  "trx-row": {
    why: "Suspension straps let you row at any angle with added grip and core demand — a scalable horizontal pull for the back and rear delts anywhere.",
    watchOut: "Letting the hips drop. Keep the body rigid in one line and pull the chest to the hands, squeezing the shoulder blades.",
  },
  "meadows-row": {
    why: "A landmine row with a staggered stance and overhand grip that hits the lats and upper back from a unique angle, with a big stretch at the bottom.",
    watchOut: "Rotating the torso open or rounding. Stay braced over the bar, pull with the elbow, and control the stretch.",
  },
  "landmine-row": {
    why: "Rowing a landmine-anchored bar gives a fixed arc and a strong mid-back and lat contraction, comfortable on the lower back.",
    watchOut: "Standing too upright and shrugging. Hinge over the bar and pull with the elbows to the torso.",
  },
  "smith-machine-row": {
    why: "The fixed bar path lets you row heavy through the back without balancing — useful for controlled overload of the mid-back and lats.",
    watchOut: "The locked path means your hinge must match it. Set your stance so the bar rows to your torso, and don't round the back.",
  },
  "reverse-grip-barbell-row": {
    why: "The underhand grip opens the shoulders and biases the lower lats and biceps, letting you pull to the hips with a strong contraction.",
    watchOut: "Standing up and curling the weight. Hold the hinge and pull with the back to the lower belly, not just the arms.",
  },
  "reverse-pec-deck-back": {
    why: "Reversing the pec deck isolates the rear delts and upper back in horizontal abduction with constant tension — key for posture and shoulder balance.",
    watchOut: "Using momentum and squeezing with bent arms. Keep a soft fixed elbow and move from the shoulder, squeezing the rear delts.",
  },
  "face-pull-back": {
    why: "Pulling a rope to the face with high elbows trains the rear delts, traps and rotator cuff — a corrective that balances all the pressing and builds upper-back detail.",
    watchOut: "Pulling too low or shrugging. Keep the elbows high, pull the rope toward the eyes, and externally rotate at the end.",
  },
  "band-face-pull-back": {
    why: "A band version of the face pull for the rear delts and upper back, with rising tension toward the squeeze — easy posture work anywhere.",
    watchOut: "Letting the band collapse the elbows down. Keep the elbows high and pull to the face, squeezing the upper back.",
  },
  "back-extension": {
    why: "Hinging over a bench and extending trains the spinal erectors, glutes and hamstrings — it strengthens the lower back and posterior chain for everything else you lift.",
    watchOut: "Hyperextending and cranking the lower back at the top. Extend only to a straight line, squeeze the glutes, and don't throw the head back.",
  },
  "weighted-back-extension": {
    why: "Adding load (plate or band) progresses the back extension into a stronger erector and posterior-chain builder once bodyweight reps are easy.",
    watchOut: "Rounding then snapping up, or over-extending. Keep the spine neutral, move from the hips, and stop at a straight line.",
  },
  "reverse-hyperextension-back": {
    why: "Swinging the legs up behind you loads the glutes, hamstrings and lower-back erectors while gently decompressing the spine — a back-friendly posterior-chain builder.",
    watchOut: "Swinging with momentum and hyperextending. Control the legs up to hip height with the glutes, not a kick, and don't over-arch.",
  },
  "good-morning-back": {
    why: "A loaded hip hinge with the bar on the back — it builds the hamstrings, glutes and spinal erectors and teaches a strong braced hinge.",
    watchOut: "Rounding the back or locking the knees hard. Soft knees, push the hips back with a flat braced spine, and only go as deep as your hamstrings allow.",
  },
  "superman": {
    why: "Lifting the arms and legs off the floor trains the spinal erectors and glutes isometrically — a no-equipment way to strengthen the lower back.",
    watchOut: "Yanking the head back and over-arching the neck. Lift smoothly to a gentle extension, keep the neck neutral, and hold without straining.",
  },
  "bird-dog-back": {
    why: "Extending opposite arm and leg while bracing trains the deep spinal stabilisers and glutes to resist rotation — core and lower-back control that protects heavier lifts.",
    watchOut: "Letting the hips rotate or the lower back sag. Keep the hips level and the spine neutral, moving slowly and reaching long.",
  },
  "scapular-pull-up": {
    why: "A small hang-and-shrug-down move that trains scapular control and the lower traps — it builds the shoulder-blade strength that makes full pull-ups stronger and healthier.",
    watchOut: "Bending the elbows into a half pull-up. Keep the arms straight and move only the shoulder blades, pulling them down and together.",
  },
  "hanging-scapular-retraction": {
    why: "Retracting and depressing the shoulder blades from a dead hang strengthens the scapular stabilisers and lower traps, improving pulling mechanics and shoulder health.",
    watchOut: "Turning it into an arm pull. Keep the elbows straight and drive only the shoulder blades down and back.",
  },
  "cable-pullover": {
    why: "With the arms in an overhead arc, the lats do shoulder extension under constant cable tension through a big stretch — an isolation move for lat size and the serratus.",
    watchOut: "Bending the elbows and bringing in the triceps. Keep a fixed soft elbow and pull the bar down in an arc with the lats.",
  },
  "dumbbell-pullover": {
    why: "Lowering a dumbbell behind the head loads the lats (and chest) through a deep overhead stretch, building the upper torso and rib-cage expansion.",
    watchOut: "Over-stretching the shoulders or arching the lower back off the bench. Keep the ribs down, a soft fixed elbow, and lower only to a comfortable stretch.",
  },

  // ==================== SHOULDERS ====================
  "barbell-overhead-press": {
    why: "The standing overhead press is the heaviest vertical push — it loads the front and side delts and triceps while the core and upper back brace, building pressing strength and shoulder size from the ground up.",
    watchOut: "Over-arching the lower back to lean under the bar. Squeeze the glutes, keep the ribs down, and press up and slightly back so the bar finishes over the mid-foot.",
  },
  "seated-barbell-overhead-press": {
    why: "Pressing seated removes the legs and lower back, isolating the delts and triceps so you can overload the shoulders with stricter form.",
    watchOut: "Arching off the backrest to cheat the weight up. Keep the back against the pad, ribs down, and press straight overhead.",
  },
  "dumbbell-shoulder-press": {
    why: "Dumbbells let each arm press through a longer, more natural range and even out side-to-side, building the front and side delts with a deep stretch at the bottom.",
    watchOut: "Clashing the dumbbells at the top or dropping into a painful stretch. Press up without banging the bells together and lower to ear height under control.",
  },
  "seated-dumbbell-shoulder-press": {
    why: "Seated and supported, this strict dumbbell press isolates the delts and triceps for heavier, cleaner overhead work.",
    watchOut: "Arching the lower back off the pad. Keep the back supported, ribs down, and press through a full controlled range.",
  },
  "arnold-press": {
    why: "Rotating from palms-in to palms-out adds a front-delt stretch and a longer range, hitting the front and side delts a little more than a straight press.",
    watchOut: "Rushing the rotation or going too heavy. Rotate smoothly through the press and control the lower to keep the shoulders healthy.",
  },
  "machine-shoulder-press": {
    why: "A fixed press path removes balancing, so you can push the delts close to failure safely — handy when learning and for high-effort sets.",
    watchOut: "A seat set too low or high that changes the angle. Adjust so the handles start at shoulder height and press straight up without shrugging.",
  },
  "hammer-strength-shoulder-press": {
    why: "Plate-loaded independent handles follow a natural pressing arc and let each side work alone, giving a stable, heavy delt stimulus.",
    watchOut: "Letting the stronger side take over. Press both arms evenly through a full range.",
  },
  "smith-machine-shoulder-press": {
    why: "The fixed vertical bar path lets you press heavy overhead without balancing — useful for controlled delt overload.",
    watchOut: "The locked path can crowd the shoulders. Set the seat so the bar matches your pressing groove and avoid pressing it out in front of the face.",
  },
  "push-press": {
    why: "A small dip and drive of the legs helps launch the bar overhead, letting you overload the top of the press and handle more weight than a strict press.",
    watchOut: "Turning it into a full squat-and-heave or pressing the bar forward. Use a short, sharp dip and finish with the bar over the mid-foot.",
  },
  "single-arm-dumbbell-press": {
    why: "Pressing one arm overhead loads the delt through a full range while the core resists tipping sideways — shoulder size plus anti-lateral-flexion core work.",
    watchOut: "Leaning away from the weight. Brace the core, keep the torso upright, and press straight overhead.",
  },
  "landmine-press-shoulders": {
    why: "The landmine's arcing path is shoulder-friendly and biases the front delt and upper chest, with the core bracing against the angle.",
    watchOut: "Arching the lower back or twisting. Keep the ribs down and press up and slightly in along the bar's arc.",
  },
  "single-arm-landmine-press": {
    why: "Pressing the landmine one arm at a time adds a long, joint-friendly range for the front delt plus strong anti-rotation core demand.",
    watchOut: "Rotating the torso to help. Stay square and braced, pressing along the bar's arc.",
  },
  "dumbbell-lateral-raise": {
    why: "Raising the arms out to the sides isolates the side (medial) delts in pure abduction — the key move for shoulder width.",
    watchOut: "Swinging the weights up and shrugging the traps. Use lighter dumbbells, lead with the elbows to shoulder height, and keep the traps down.",
  },
  "seated-lateral-raise": {
    why: "Sitting removes momentum, forcing the side delts to do strict abduction for a cleaner width stimulus.",
    watchOut: "Heaving or leaning. Keep the torso still and raise the elbows out to the sides under control.",
  },
  "leaning-lateral-raise": {
    why: "Leaning away from a support increases the range and keeps tension on the side delt at the bottom, where standing raises go light.",
    watchOut: "Using the lean to swing. Keep the movement strict, leading with the elbow through a long controlled arc.",
  },
  "cable-lateral-raise": {
    why: "The cable keeps constant tension on the side delt through the whole range, including the bottom where dumbbells unload — great for continuous delt tension.",
    watchOut: "Yanking with the traps or torso. Keep the working arm leading with the elbow and the body still.",
  },
  "single-arm-cable-lateral-raise": {
    why: "One arm on the cable gives constant tension and a full range for the side delt, letting you fix imbalances and feel the muscle work.",
    watchOut: "Leaning or shrugging to lift. Keep the torso upright and raise with the side delt, traps relaxed.",
  },
  "machine-lateral-raise": {
    why: "The machine guides pure abduction with constant tension and no balancing, so you can isolate the side delts and push close to failure.",
    watchOut: "Using momentum against the pads or shrugging. Set the seat so the pivot lines up with the shoulder and raise the elbows smoothly.",
  },
  "y-raise": {
    why: "Raising the arms up and out into a Y trains the side and rear delts and lower traps, building the upper back and shoulder health.",
    watchOut: "Shrugging or over-arching. Keep the traps down, thumbs up, and raise to the Y under control.",
  },
  "incline-lateral-raise": {
    why: "Lying on an incline shifts the lateral raise's tension to the bottom of the range, loading the side delt where it's usually easiest — a strong stretch-biased width move.",
    watchOut: "Swinging off the pad. Keep the chest on the bench and raise strictly with the side delt.",
  },
  "front-raise": {
    why: "Lifting the weight to the front isolates the front (anterior) delt in flexion — useful detail work, though the front delt also gets plenty from pressing.",
    watchOut: "Swinging and using the lower back. Raise to about shoulder height with control and lower slowly; don't go higher than needed.",
  },
  "alternating-front-raise": {
    why: "Raising one arm at a time lets you focus on each front delt and keep the movement strict with less full-body momentum.",
    watchOut: "Rocking the torso to swing each rep. Keep the body still and raise with control.",
  },
  "barbell-front-raise": {
    why: "A barbell front raise lets both front delts work together and load a bit heavier through flexion.",
    watchOut: "Leaning back and heaving. Keep the core braced and raise to shoulder height under control.",
  },
  "plate-front-raise": {
    why: "Holding a plate keeps both hands engaged and the front delts working through flexion — a simple, gym-anywhere front-delt move.",
    watchOut: "Swinging the plate up with the back. Raise to shoulder height with control, not momentum.",
  },
  "cable-front-raise": {
    why: "The cable keeps tension on the front delt through the whole range, including the bottom, for a continuous flexion stimulus.",
    watchOut: "Using the body to swing. Keep the torso still and raise with the front delt.",
  },
  "single-arm-cable-front-raise": {
    why: "One arm on the cable gives constant tension and a strict range for the front delt, with the core resisting rotation.",
    watchOut: "Twisting to help the arm. Stay square and raise with control.",
  },
  "rear-delt-fly": {
    why: "Flying the arms out and back isolates the rear delts in horizontal abduction — crucial for shoulder balance and posture against all the pressing.",
    watchOut: "Using the lower back to swing or squeezing with bent arms. Keep a soft fixed elbow, lead with the elbows, and squeeze the rear delts.",
  },
  "bent-over-reverse-fly": {
    why: "Hinged over, raising the dumbbells out and back loads the rear delts and upper back through abduction with a good range.",
    watchOut: "Standing up and heaving. Hold the hinge, keep a fixed elbow, and lift with the rear delts, not momentum.",
  },
  "incline-rear-delt-fly": {
    why: "Chest supported on an incline removes the lower back and cheating, isolating the rear delts for strict abduction.",
    watchOut: "Shrugging or swinging off the pad. Keep the chest down and lift with the rear delts to the sides.",
  },
  "cable-rear-delt-fly": {
    why: "Cables keep constant tension on the rear delts through the cross-body fly, including the contracted position, for continuous rear-delt work.",
    watchOut: "Bending the arms and rowing. Keep a fixed elbow and pull the arms out and back with the rear delts.",
  },
  "reverse-pec-deck-shoulders": {
    why: "Reversing the pec deck isolates the rear delts in horizontal abduction with constant machine tension and no balancing — clean rear-delt volume.",
    watchOut: "Using momentum and bending the arms. Keep a soft fixed elbow and squeeze the rear delts back.",
  },
  "face-pull-shoulders": {
    why: "A rope face pull trains the rear delts, traps and rotator cuff — the go-to corrective that balances pressing and keeps the shoulders healthy.",
    watchOut: "Pulling too low or shrugging. Keep the elbows high, pull toward the eyes, and externally rotate at the end.",
  },
  "band-face-pull-shoulders": {
    why: "A band face pull for the rear delts and external rotators with rising tension — easy daily shoulder-health work.",
    watchOut: "Collapsing the elbows down. Keep the elbows high and pull to the face, squeezing the upper back.",
  },
  "upright-row": {
    why: "Pulling the bar up the front of the body trains the side delts and traps together — a compact width-and-trap builder.",
    watchOut: "Pulling too high with a narrow grip, which can pinch the shoulder. Use a wider grip, pull to about chest height, and keep the elbows level with the hands.",
  },
  "dumbbell-upright-row": {
    why: "Dumbbells let each side row up with a more shoulder-friendly path, hitting the side delts and traps.",
    watchOut: "Yanking too high or too narrow. Keep the elbows leading and stop around chest height to spare the shoulder.",
  },
  "cable-upright-row": {
    why: "The cable keeps tension constant through the upright row, training the side delts and traps with a smooth pull.",
    watchOut: "Pulling too high or shrugging hard. Lead with the elbows to chest height and control the lower.",
  },
  "high-pull": {
    why: "An explosive upright-row variant, the high pull builds the traps, side delts and pulling power with a fast hip-and-shrug drive.",
    watchOut: "Turning it into a sloppy swing. Drive with the hips, keep the elbows high, and control the bar down.",
  },
  "behind-the-neck-press": {
    why: "Pressing from behind the neck biases the side delts and demands good shoulder mobility — an advanced overhead variation.",
    watchOut: "It stresses the shoulder in a vulnerable position. Only use it with good mobility, a moderate load, and a controlled range to the base of the neck — never force it.",
  },
  "bradford-press": {
    why: "Pressing in a continuous arc front-to-back keeps constant tension on the delts through a long range — a controlled delt-endurance and detail move.",
    watchOut: "Going heavy or banging the bar behind the neck. Use light weight and a smooth, controlled arc just over the head.",
  },
  "cuban-press": {
    why: "Combining an upright row, external rotation and press, the Cuban press strengthens the rotator cuff and rear/side delts together — excellent shoulder-health work.",
    watchOut: "Rushing the rotation with too much weight. Use light dumbbells and move slowly through each phase.",
  },
  "external-rotation": {
    why: "Rotating the forearm outward against resistance strengthens the rotator cuff (mainly infraspinatus and teres minor) — small but vital for shoulder stability and health.",
    watchOut: "Using the whole arm or going heavy. Keep the elbow pinned to the side, move only the forearm, and use light resistance.",
  },
  "internal-rotation": {
    why: "Rotating the forearm inward strengthens the subscapularis and the front of the rotator cuff, balancing the shoulder's stabilisers.",
    watchOut: "Letting the elbow drift or going too heavy. Keep the elbow at the side and rotate slowly with light resistance.",
  },
  "scaption-raise": {
    why: "Raising the arms in the scapular plane (about 30° forward) trains the side delts and supraspinatus in their healthiest line of pull — width work that's kind to the shoulder.",
    watchOut: "Shrugging or going too high. Raise to shoulder height with thumbs up, leading with the elbows, traps down.",
  },
  "handstand-push-up": {
    why: "An inverted bodyweight press, the handstand push-up loads the delts and triceps hard with your full bodyweight overhead — an advanced strength feat.",
    watchOut: "Crashing onto the head or over-arching the back. Build up against a wall, lower under control, keep the core tight, and bail safely if needed.",
  },
  "pike-push-up": {
    why: "Hips piked high, this push-up shifts the load onto the shoulders and triceps — a scalable step toward the handstand push-up with no equipment.",
    watchOut: "Letting the hips drop so it becomes a regular push-up. Keep the hips high and lower the head toward the floor between the hands.",
  },
  "battle-rope-alternating-waves": {
    why: "Whipping the ropes in alternating waves trains the shoulders, arms and core for conditioning and endurance with a big metabolic demand.",
    watchOut: "Going only with the arms and gassing out. Drive from a braced athletic stance with a little hip and knee bend, core tight.",
  },
  "battle-rope-double-waves": {
    why: "Slamming both ropes together adds a full-body explosive conditioning stimulus for the shoulders, back and core.",
    watchOut: "Rounding the back on each slam. Hinge slightly, brace the core, and drive both arms together from a stable base.",
  },

  // ==================== LEGS ====================
  "back-squat": {
    why: "The back squat is the cornerstone lower-body lift — it loads the quads, glutes and adductors through a deep knee and hip bend while the whole trunk braces, building leg size and total-body strength.",
    watchOut: "Knees caving in, heels lifting, or the chest dropping forward. Brace the core, push the knees out over the toes, keep the weight mid-foot, and squat to at least parallel with control.",
  },
  "front-squat": {
    why: "Holding the bar on the front delts keeps the torso upright, shifting more work onto the quads and demanding a strong braced core — a great quad and posture builder.",
    watchOut: "Elbows dropping, which dumps the bar forward. Keep the elbows high and chest up, and sink straight down with the heels planted.",
  },
  "high-bar-squat": {
    why: "A high bar placement and upright torso bias the quads through a deep, knee-dominant squat.",
    watchOut: "Letting the chest fall or heels rise as you go deep. Keep the torso tall, knees tracking out, and weight on the mid-foot.",
  },
  "low-bar-squat": {
    why: "A lower bar position and more forward lean recruit more hip and posterior chain, letting you squat heavier — a favourite for strength.",
    watchOut: "Turning it into a good morning by letting the hips shoot up. Keep the bar over the mid-foot and drive hips and chest up together.",
  },
  "goblet-squat": {
    why: "Holding a single weight at the chest teaches a clean upright squat and loads the quads and glutes — ideal for beginners and for grooving the pattern.",
    watchOut: "Rounding forward or letting the knees cave. Keep the chest up, elbows inside the knees, and push the knees out as you sink.",
  },
  "zercher-squat": {
    why: "Cradling the bar in the elbows forces an upright torso and a braced core, hitting the quads, glutes and upper back hard.",
    watchOut: "Rounding the upper back under the bar. Keep the chest up and core tight, and use a pad if the bar digs in.",
  },
  "box-squat-legs": {
    why: "Squatting to a box teaches consistent depth and a strong hip drive off the bottom, building the posterior chain and control.",
    watchOut: "Crashing onto the box or rocking back. Sit back under control, stay tight on the box, and drive up without bouncing.",
  },
  "paused-squat": {
    why: "A pause at the bottom kills the stretch reflex, building strength and control out of the hardest position of the squat.",
    watchOut: "Relaxing or letting the chest cave during the pause. Stay braced and tight through the hold, then drive up.",
  },
  "smith-machine-squat": {
    why: "The fixed bar path removes balancing so you can load the quads and glutes with less stabilising demand — useful for controlled overload.",
    watchOut: "The locked path can stress the knees if your feet are wrong. Set the feet slightly forward and find a position that lets you squat without knee or back strain.",
  },
  "hack-squat": {
    why: "The hack squat machine braces your back and guides the path, letting you load the quads through a deep knee bend safely and close to failure.",
    watchOut: "Letting the knees cave or the heels lift. Keep the whole foot down, push the knees out, and control the depth.",
  },
  "leg-press": {
    why: "The leg press loads the quads, glutes and adductors heavily with the back supported, so you can push close to failure without balancing or loading the spine.",
    watchOut: "Letting the lower back round off the pad at the bottom (butt wink) or locking the knees hard. Stop the depth before the hips tuck, and don't slam the knees straight.",
  },
  "single-leg-press": {
    why: "One leg at a time loads each quad and glute through a full range and fixes side-to-side imbalances with the back supported.",
    watchOut: "Letting the knee cave or the hips shift. Keep the knee tracking over the foot and the pelvis steady.",
  },
  "bulgarian-split-squat": {
    why: "Rear foot elevated, this single-leg squat loads the front-leg quad and glute through a deep range with a big stretch — one of the best builders for legs and balance.",
    watchOut: "Knee caving or the front heel lifting. Keep the front foot planted, knee tracking over the toes, and torso steady; lean slightly forward to bias the glute.",
  },
  "split-squat": {
    why: "A static split stance loads the front-leg quad and glute through a deep lunge with more stability than walking lunges.",
    watchOut: "Letting the front knee cave or the torso collapse. Keep the front heel down, knee over the foot, and trunk upright.",
  },
  "walking-lunge": {
    why: "Stepping forward into lunges loads the quads and glutes one leg at a time with a balance and coordination demand — great for leg size and athleticism.",
    watchOut: "Letting the front knee cave or taking too short a step. Take a controlled stride, knee tracking over the foot, and stay tall.",
  },
  "forward-lunge": {
    why: "Lunging forward loads the front-leg quad and glute through a deep range; the deceleration also builds control.",
    watchOut: "Knee caving or slamming forward over the toes. Step under control, keep the knee tracking the foot, and push back up through the front heel.",
  },
  "reverse-lunge-legs": {
    why: "Stepping back into a lunge keeps the shin more vertical, which is easier on the knees while still loading the quad and glute.",
    watchOut: "Letting the torso fall forward or the front knee cave. Keep the chest up and drive up through the front heel.",
  },
  "lateral-lunge": {
    why: "Stepping sideways loads the quads, glutes and adductors and trains the legs in the frontal plane, which most lifts miss.",
    watchOut: "Letting the bending knee cave inward. Push the hips back, keep the knee over the foot, and keep the other leg straight.",
  },
  "curtsy-lunge-legs": {
    why: "Crossing one leg behind biases the glute medius and outer hip alongside the quad, adding frontal-plane control.",
    watchOut: "Letting the knee collapse in or twisting the hips. Keep the front knee tracking and lower under control.",
  },
  "step-up": {
    why: "Stepping onto a box loads the quad and glute of the working leg through a full range with a strong balance demand.",
    watchOut: "Pushing off the trailing foot to cheat. Drive up through the top leg's heel and control the lower; don't bounce off the bottom foot.",
  },
  "weighted-step-up": {
    why: "Adding load progresses the step-up into a serious single-leg quad and glute builder once bodyweight reps are easy.",
    watchOut: "Using the bottom leg to push or losing balance. Keep the work in the top leg and control each rep.",
  },
  "pistol-squat": {
    why: "A full single-leg squat to the floor, the pistol demands huge quad and glute strength, mobility and balance — an advanced bodyweight feat.",
    watchOut: "Collapsing at the bottom or the knee caving. Lower under control, keep the heel down and knee tracking, and build up with assistance first.",
  },
  "assisted-pistol-squat": {
    why: "Holding a support lets you train the pistol's deep single-leg range with good control before you can do it freestanding.",
    watchOut: "Pulling yourself up with the support arm. Use it only for balance and drive up with the working leg.",
  },
  "sissy-squat": {
    why: "Leaning back and bending only the knees gives the quads a deep, stretched contraction with the hips locked out — strong quad isolation.",
    watchOut: "Over-stressing the knees if rushed. Move slowly, hold a support, and keep the range within what your knees tolerate.",
  },
  "wall-sit": {
    why: "Holding a seated position against a wall builds quad endurance and isometric strength with no equipment.",
    watchOut: "Letting the thighs rise above parallel or the knees drift past the toes. Keep the thighs parallel, shins vertical, and back flat on the wall.",
  },
  "leg-extension": {
    why: "The leg extension isolates the quads in pure knee extension with constant machine tension — clean quad volume and a strong squeeze at the top.",
    watchOut: "Swinging the weight or jerking at the top. Set the pad at the ankle, extend smoothly, and control the lower; ease the load if the knees complain.",
  },
  "single-leg-extension": {
    why: "One leg at a time isolates each quad in knee extension and fixes side-to-side imbalances.",
    watchOut: "Using momentum. Extend smoothly and control the negative on each leg.",
  },
  "nordic-hamstring-curl": {
    why: "Lowering the torso under control with the ankles anchored loads the hamstrings eccentrically — one of the most effective moves for hamstring strength and injury resilience.",
    watchOut: "Dropping fast instead of resisting. Lower as slowly as you can and push back up; regress with a band or a shorter range if you can't control it.",
  },
  "lying-leg-curl": {
    why: "The lying curl isolates the hamstrings in knee flexion with constant machine tension, building the back of the thigh.",
    watchOut: "Lifting the hips off the pad or using momentum. Keep the hips down and curl with control through a full range.",
  },
  "seated-leg-curl": {
    why: "The seated position puts the hamstrings on a slightly longer stretch, which is great for building them in the lengthened position.",
    watchOut: "Letting the hips rise or the weight swing. Keep the thighs pinned and curl smoothly under the pad.",
  },
  "standing-leg-curl": {
    why: "Curling one leg at a time standing isolates each hamstring and lets you fix imbalances with a strong contraction.",
    watchOut: "Swinging the leg or arching the back. Keep the torso still and curl with control.",
  },
  "single-leg-curl": {
    why: "Working one hamstring at a time evens out left-to-right strength and isolates knee flexion.",
    watchOut: "Using the hips or momentum. Curl smoothly and control the negative on each side.",
  },
  "romanian-deadlift-legs": {
    why: "Pushing the hips back with nearly straight legs loads the hamstrings and glutes through a deep stretch — a top hamstring and posterior-chain builder.",
    watchOut: "Rounding the back or bending the knees too much. Soft knees, hips back, flat back, and lower to your hamstring's stretch limit.",
  },
  "stiff-leg-deadlift-legs": {
    why: "With straighter legs and a bigger stretch than the RDL, this loads the hamstrings hard in the lengthened position.",
    watchOut: "Rounding the lower back to reach lower. Keep the spine neutral and only descend as far as your hamstrings allow.",
  },
  "good-morning-legs": {
    why: "A bar-on-back hip hinge that loads the hamstrings, glutes and erectors and teaches a strong braced hinge.",
    watchOut: "Rounding the back or locking the knees. Soft knees, hips back, flat braced spine, controlled depth.",
  },
  "glute-ham-raise": {
    why: "The GHR trains the hamstrings at both the hip and knee through a big range, building serious posterior-chain strength.",
    watchOut: "Falling fast or using momentum. Lower under control and curl back up; regress the range if you can't control it.",
  },
  "cable-pull-through-legs": {
    why: "Hinging and driving the hips against a cable from between the legs trains the glutes and hamstrings with constant tension — a hinge that's easy to learn and easy on the back.",
    watchOut: "Squatting or using the arms to lift. Keep the arms straight, hinge at the hips, and finish by squeezing the glutes, not leaning back.",
  },
  "cossack-squat-legs": {
    why: "Shifting deep to one side loads that quad, glute and adductor through a big range and builds frontal-plane hip mobility.",
    watchOut: "Letting the bent knee cave or the heel lift. Keep the foot down and knee tracking, and control the depth.",
  },
  "jefferson-squat": {
    why: "Straddling the bar gives an unusual, balanced loading of the quads, glutes and adductors with an anti-rotation demand.",
    watchOut: "Twisting unevenly. Set a balanced stance, keep the spine neutral, and stand up evenly.",
  },
  "trap-bar-deadlift-legs": {
    why: "The trap bar's neutral handles and centred load make the deadlift more quad-driven and back-friendly — a great way to train the legs and posterior chain heavy.",
    watchOut: "Rounding the back or letting the hips shoot up. Brace, push the floor away, and stand up with hips and shoulders together.",
  },
  "jump-squat": {
    why: "Exploding out of a squat into a jump trains lower-body power and the fast-twitch fibres, carrying over to athleticism and strength.",
    watchOut: "Landing stiff or with caving knees. Land soft through the whole foot with the knees tracking out, and reset between reps.",
  },
  "box-jump": {
    why: "Jumping onto a box trains explosive hip and leg power with a safe, soft landing.",
    watchOut: "Chasing height and crashing the landing. Land softly with bent knees, step down rather than jump down, and pick a safe height.",
  },
  "broad-jump": {
    why: "A maximal horizontal jump builds explosive hip and leg power and teaches force production and absorption.",
    watchOut: "Landing stiff-legged. Swing the arms, drive the hips, and land soft with bent knees and a braced core.",
  },
  "skater-jump": {
    why: "Bounding side to side trains single-leg power, balance and the glute medius in the frontal plane.",
    watchOut: "Letting the landing knee cave. Land soft on one leg with the knee tracking, and absorb before pushing off again.",
  },
  "walking-step-lunge": {
    why: "A continuous walking lunge builds the quads and glutes one leg at a time with an ongoing balance and conditioning demand.",
    watchOut: "Short, rushed steps and caving knees. Take controlled strides, knee over the foot, torso tall.",
  },
  "belt-squat": {
    why: "Hanging the load from a hip belt loads the quads and glutes hard with zero spinal compression — great for high-volume leg work or training around a cranky back.",
    watchOut: "Letting the knees cave or cutting depth. Push the knees out, keep the whole foot down, and squat to a full controlled depth.",
  },
  "single-leg-squat-to-box": {
    why: "Squatting to a box on one leg builds single-leg quad and glute strength and control with a safe depth target.",
    watchOut: "Plopping onto the box or the knee caving. Lower under control, tap the box, and stand up through the heel.",
  },
  "frog-squat": {
    why: "A deep, toes-out squat with a forward lean targets the quads and adductors through a big range and trains deep-squat mobility.",
    watchOut: "Rounding the lower back at the bottom. Keep the spine long and only sink as deep as you can stay braced.",
  },
  "heels-elevated-squat": {
    why: "Raising the heels lets the knees travel further forward, putting more emphasis on the quads through a deeper, more upright squat.",
    watchOut: "Letting the knees cave even with the heels up. Keep the knees tracking out and the torso tall.",
  },
  "reverse-hack-squat": {
    why: "Facing into the hack machine shifts emphasis toward the glutes and hamstrings through a deep hip range — the mirror of the quad-focused hack squat.",
    watchOut: "Rounding the back or caving the knees. Keep the back on the pad, knees out, and control the depth.",
  },
  "v-squat": {
    why: "The V-squat machine guides a quad-dominant squat with back support, letting you load the quads and glutes deep and safely to failure.",
    watchOut: "Heels lifting or knees caving. Keep the feet planted, knees out, and control the range.",
  },
  "pendulum-squat": {
    why: "The pendulum's arcing path keeps constant tension on the quads through a deep, smooth squat with the back supported — superb quad isolation and overload.",
    watchOut: "Cutting depth or letting the knees cave. Use the full smooth range with the knees tracking out.",
  },
  "spanish-squat": {
    why: "A band behind the knees lets you squat near-vertically and load the quads (especially around the knee) — a knee-friendly quad burner and rehab favourite.",
    watchOut: "Letting the hips travel back too far. Keep the shins fairly vertical, sit straight down against the band, and keep tension on the quads.",
  },
  "terminal-knee-extension": {
    why: "Straightening the knee against a band trains the quad (especially the VMO) at full extension — a simple knee-health and quad-activation move.",
    watchOut: "Locking out hard or using the hip. Extend smoothly to straight and control back, keeping the band tension on the knee.",
  },

  // ==================== GLUTES ====================
  "barbell-hip-thrust": {
    why: "Driving the hips up against a barbell loads the glutes in their strongest position (full hip extension) with a hard squeeze at the top — the premier glute-building move.",
    watchOut: "Over-arching the lower back or pushing through the toes at the top. Tuck the ribs, drive through the heels, and finish with a glute squeeze, not a back arch.",
  },
  "dumbbell-hip-thrust": {
    why: "A dumbbell across the hips loads the glutes through full hip extension — the same strong squeeze as the barbell version with a lighter, easier setup.",
    watchOut: "Arching the back to finish. Keep the ribs down, drive through the heels, and squeeze the glutes at the top.",
  },
  "single-leg-hip-thrust": {
    why: "One leg at a time loads each glute through full extension and fixes side-to-side imbalances.",
    watchOut: "Letting the hips tilt or the back arch. Keep the pelvis level, drive through the heel, and squeeze the working glute.",
  },
  "banded-hip-thrust": {
    why: "A band around the knees adds abduction tension, so the glute medius works alongside the max during the thrust.",
    watchOut: "Letting the knees cave against the band. Press the knees out throughout and finish with a glute squeeze.",
  },
  "glute-bridge": {
    why: "Bridging the hips up from the floor activates and strengthens the glutes through hip extension — a beginner-friendly, no-equipment glute move.",
    watchOut: "Pushing through the toes or arching the back. Drive through the heels, tuck the ribs, and squeeze the glutes at the top.",
  },
  "weighted-glute-bridge": {
    why: "Adding load to the floor bridge progresses glute strength once bodyweight reps are easy.",
    watchOut: "Arching the lower back to lift. Keep the ribs down, drive through the heels, and finish with a glute squeeze.",
  },
  "single-leg-glute-bridge": {
    why: "One leg at a time loads each glute from the floor and evens out imbalances.",
    watchOut: "Letting the hips drop or tilt. Keep the pelvis level and drive through the heel.",
  },
  "frog-pump": {
    why: "Soles together with knees out biases the glutes through a short, high-rep squeeze — a great glute burnout and activation move.",
    watchOut: "Using the lower back. Keep the ribs down and pump from the glutes through a small controlled range.",
  },
  "barbell-glute-bridge": {
    why: "A barbell across the hips on the floor loads the glutes through hip extension — like a hip thrust but easier to set up, with a shorter range.",
    watchOut: "Arching the back instead of extending the hips. Tuck the ribs, drive through the heels, and squeeze.",
  },
  "cable-glute-kickback": {
    why: "Extending the leg back against a cable isolates the glute with constant tension and a strong squeeze at the top.",
    watchOut: "Arching the back to swing the leg higher. Keep the torso still, hinge slightly, and extend the hip with the glute, not the lower back.",
  },
  "single-leg-cable-kickback": {
    why: "One leg on the cable isolates each glute in hip extension with constant tension and fixes imbalances.",
    watchOut: "Twisting the hips to lift higher. Keep the pelvis square and drive the heel back with the glute.",
  },
  "machine-glute-kickback": {
    why: "The kickback machine guides hip extension with constant tension and back support, isolating the glute cleanly to failure.",
    watchOut: "Arching the back or using momentum. Keep the torso braced and push back with the glute.",
  },
  "donkey-kick": {
    why: "Kicking the bent leg up on all fours isolates the glute through hip extension — a simple bodyweight activation and burnout move.",
    watchOut: "Arching the lower back to lift higher. Keep the spine neutral and a 90° knee, lifting with the glute to hip height.",
  },
  "quadruped-hip-extension": {
    why: "Extending the leg back from all fours isolates the glute in hip extension through a controlled range.",
    watchOut: "Over-arching the back. Keep the core braced and extend the hip with the glute, not the spine.",
  },
  "fire-hydrant": {
    why: "Lifting the bent knee out to the side on all fours trains the glute medius and outer hip in abduction.",
    watchOut: "Rotating the torso to lift higher. Keep the hips square and lift from the outer glute.",
  },
  "banded-fire-hydrant": {
    why: "A band adds abduction resistance to the fire hydrant, loading the glute medius harder.",
    watchOut: "Twisting to beat the band. Keep the hips level and press the knee out against the band.",
  },
  "banded-lateral-walk": {
    why: "Stepping sideways against a band loads the glute medius in abduction — key for hip stability and knee tracking.",
    watchOut: "Letting the knees cave or the band pull the feet together. Keep tension on the band, knees out, and stay in a half-squat.",
  },
  "monster-walk": {
    why: "Walking forward and back against a band trains the glutes and hip stabilisers in multiple directions for hip control.",
    watchOut: "Standing up tall and losing band tension. Stay in a half-squat, knees out, and keep the band taut.",
  },
  "standing-hip-abduction": {
    why: "Lifting the leg out to the side trains the glute medius in abduction, building hip width and stability.",
    watchOut: "Leaning the torso to lift higher. Stand tall, keep the hips level, and lift from the outer glute.",
  },
  "cable-hip-abduction": {
    why: "Abducting the leg against a cable adds constant tension to the glute medius for hip stability and shape.",
    watchOut: "Swinging the leg with momentum. Keep the torso upright and move from the hip with control.",
  },
  "machine-hip-abduction": {
    why: "The abductor machine loads the glute medius and minimus in pure abduction with constant tension — clean outer-glute volume.",
    watchOut: "Using the whole body to force the pads apart. Keep the torso still and push out with the glutes through a full range.",
  },
  "side-lying-hip-abduction": {
    why: "Lifting the top leg while lying on your side isolates the glute medius in abduction — a no-equipment hip-stability staple.",
    watchOut: "Rolling the hips back to cheat. Stack the hips, keep the leg slightly behind, and lift from the outer glute.",
  },
  "clamshell": {
    why: "Opening the top knee while lying on your side targets the glute medius and external rotators — foundational hip-stability work.",
    watchOut: "Rolling the hips backward. Keep the hips stacked and open only the knee from the glute.",
  },
  "banded-clamshell": {
    why: "A band adds resistance to the clamshell, loading the glute medius and rotators harder.",
    watchOut: "Twisting the pelvis to beat the band. Keep the hips stacked and open the knee against the band.",
  },
  "bulgarian-split-squat-glutes": {
    why: "With a forward torso lean and a longer step, the rear-foot-elevated split squat biases the front glute through a deep stretch — a top single-leg glute builder.",
    watchOut: "Knee caving or staying too upright. Lean forward slightly, keep the front foot planted, and drive up through the heel with the glute.",
  },
  "reverse-lunge-glutes": {
    why: "A longer step back and a torso lean bias the glute of the front leg through a deep hip range.",
    watchOut: "Letting the front knee cave. Keep the knee tracking, lean slightly forward, and drive up through the heel.",
  },
  "walking-lunge-glutes": {
    why: "Longer strides with a slight forward lean shift the walking lunge's emphasis onto the glutes.",
    watchOut: "Short steps that hit more quad, or caving knees. Take a long controlled stride and drive through the front heel.",
  },
  "step-up-glutes": {
    why: "A higher box and a slight forward lean bias the glute of the stepping leg through a bigger hip range.",
    watchOut: "Pushing off the bottom foot. Use a higher step, lean slightly forward, and drive up through the top heel with the glute.",
  },
  "single-leg-romanian-deadlift": {
    why: "Hinging on one leg loads that glute and hamstring through a deep stretch while challenging balance — great for glute strength and hip stability.",
    watchOut: "Rounding the back or twisting the hips open. Keep the hips square and spine neutral, hinging from the hip and reaching the weight down.",
  },
  "romanian-deadlift-glutes": {
    why: "Pushing the hips back through a deep stretch loads the glutes and hamstrings — a foundational glute and posterior-chain builder.",
    watchOut: "Rounding the back. Soft knees, hips back, flat back, and drive the hips forward to squeeze the glutes at the top.",
  },
  "stiff-leg-deadlift-glutes": {
    why: "A bigger stretch with straighter legs loads the glutes and hamstrings hard in the lengthened position.",
    watchOut: "Rounding the lower back to reach lower. Keep the spine neutral and only go as deep as your hamstrings allow.",
  },
  "sumo-deadlift-glutes": {
    why: "The wide stance and upright torso bias the glutes and adductors as you drive the hips through to lockout.",
    watchOut: "Knees caving or hips rising first. Push the knees out, keep the chest up, and finish by squeezing the glutes.",
  },
  "trap-bar-deadlift-glutes": {
    why: "The centred load lets you hinge and drive the hips through to a strong glute lockout with a back-friendly setup.",
    watchOut: "Squatting it instead of hinging, or over-arching at the top. Push the hips back to start and finish with a glute squeeze, ribs down.",
  },
  "cable-pull-through-glutes": {
    why: "Driving the hips forward against a cable trains the glutes with constant tension and a strong squeeze — a glute-focused hinge that's easy on the back.",
    watchOut: "Using the arms or leaning back. Keep the arms straight, hinge at the hips, and finish with the glutes, not the lower back.",
  },
  "kettlebell-swing": {
    why: "A ballistic hip hinge, the swing builds explosive glute and hamstring power and conditioning as the hips snap the bell up.",
    watchOut: "Squatting and lifting with the arms, or over-arching at the top. Hinge and snap the hips, let the arms float, and finish tall with the glutes — ribs down.",
  },
  "good-morning-glutes": {
    why: "A loaded hinge that loads the glutes and hamstrings and teaches a strong braced hip extension.",
    watchOut: "Rounding the back or locking the knees. Soft knees, hips back, flat spine, and squeeze the glutes to stand.",
  },
  "back-extension-glutes": {
    why: "Rounding the upper back slightly and turning the toes out biases the glutes on the back extension, training hip extension with a strong squeeze.",
    watchOut: "Hyperextending the lower back. Extend to a straight line and squeeze the glutes rather than cranking the spine.",
  },
  "reverse-hyperextension-glutes": {
    why: "Swinging the legs up loads the glutes (and hamstrings) through hip extension while decompressing the spine — glute work that's easy on the back.",
    watchOut: "Swinging with momentum and hyperextending. Lift to hip height with the glutes, not a kick, and don't over-arch.",
  },
  "curtsy-lunge-glutes": {
    why: "Crossing the leg behind biases the glute medius and outer glute alongside the max, adding frontal-plane glute work.",
    watchOut: "Letting the knee cave or twisting. Keep the front knee tracking and drive up through the heel.",
  },
  "cossack-squat-glutes": {
    why: "Shifting deep to one side loads that glute and adductor through a big range and builds hip mobility.",
    watchOut: "Heel lifting or knee caving. Keep the foot down and knee tracking, and control the depth.",
  },
  "deficit-reverse-lunge": {
    why: "Stepping back off a raised platform increases the range, loading the front glute through a deeper stretch.",
    watchOut: "Losing balance or letting the knee cave. Control the longer range, keep the knee tracking, and drive through the front heel.",
  },
  "smith-machine-hip-thrust": {
    why: "The fixed bar makes loading the hip thrust easy and stable, so you can overload the glutes through full extension without balancing.",
    watchOut: "Arching the back at the top. Tuck the ribs, drive through the heels, and finish with a glute squeeze.",
  },
  "b-stance-hip-thrust": {
    why: "Staggering the feet shifts most of the load onto one glute while the other stabilises — a way to overload each glute beyond a single-leg thrust.",
    watchOut: "Pushing through the supporting leg. Keep the weight on the working heel and drive that glute, pelvis level.",
  },
  "b-stance-romanian-deadlift": {
    why: "A staggered stance biases one glute and hamstring through the hinge while the other assists — more single-leg overload with better balance.",
    watchOut: "Rounding the back or twisting. Keep the hips square, hinge from the working hip, and keep the spine neutral.",
  },
  "frog-bridge": {
    why: "Soles together with the knees out during a bridge biases the glutes through hip extension and external rotation for a strong squeeze.",
    watchOut: "Arching the lower back. Keep the ribs down and lift from the glutes through a controlled range.",
  },
  "bench-glute-kickback": {
    why: "Kicking the leg back from a bench-supported position isolates the glute in hip extension with a strong squeeze.",
    watchOut: "Arching the back to lift higher. Keep the spine neutral and extend the hip with the glute.",
  },
  "standing-band-kickback": {
    why: "Extending the leg back against a band isolates the glute with rising tension toward the squeeze — easy anywhere.",
    watchOut: "Leaning forward and arching to swing the leg. Keep the torso fairly upright and push back with the glute.",
  },
  "hip-airplane": {
    why: "Balancing on one leg and rotating the pelvis trains the glutes and deep hip rotators for control and stability — excellent single-leg hip work.",
    watchOut: "Losing balance or moving from the lower back. Move slowly from the hip, keep the spine neutral, and use a support if needed.",
  },
  "single-leg-box-squat-glutes": {
    why: "Sitting back to a box on one leg with a slight lean biases the glute through a controlled deep range.",
    watchOut: "Plopping onto the box or the knee caving. Sit back under control, tap the box, and drive up through the heel with the glute.",
  },

  // ==================== CALVES ====================
  "standing-calf-raise-machine": {
    why: "With the knees straight, standing calf raises hit the gastrocnemius (the larger, visible calf muscle) through plantarflexion under load — the staple for calf size.",
    watchOut: "Bouncing through a short range. Use a full range — a deep stretch at the bottom and a hard squeeze at the top — with a controlled tempo.",
  },
  "seated-calf-raise-machine": {
    why: "Bending the knees takes the gastrocnemius out and targets the soleus underneath, which drives lower-leg thickness and endurance.",
    watchOut: "Half-reps and bouncing. Let the heels drop into a full stretch and press all the way up onto the toes.",
  },
  "leg-press-calf-raise": {
    why: "Pressing onto the toes on the leg press loads the calves (mostly gastrocnemius) heavily with the back supported.",
    watchOut: "Letting the knees do the work or using a tiny range. Keep the knees mostly fixed and move through a full ankle range — deep stretch to full squeeze.",
  },
  "smith-machine-standing-calf-raise": {
    why: "The fixed bar lets you load standing calf raises heavily and safely for the gastrocnemius without balancing.",
    watchOut: "Short bouncy reps. Use a block for a deep stretch and press all the way to the top under control.",
  },
  "dumbbell-standing-calf-raise": {
    why: "Holding dumbbells lets you train the standing calf raise (gastrocnemius) anywhere with a full stretch and squeeze.",
    watchOut: "Cutting the range. Stand on a block if you can, drop into a stretch, and rise fully onto the toes.",
  },
  "single-leg-calf-raise": {
    why: "One leg at a time doubles the load on each calf and fixes side-to-side imbalances through a full range.",
    watchOut: "Pulling yourself up with a wall or rail. Use support only for balance and drive through the calf with a full stretch and squeeze.",
  },
  "donkey-calf-raise": {
    why: "Hinged at the hips with the load on the back, the donkey raise puts the gastrocnemius on a strong stretch through a big range — a classic calf builder.",
    watchOut: "Bouncing or shortening the range. Keep the knees straight and move through a full deep stretch to a high squeeze.",
  },
  "bent-knee-calf-raise": {
    why: "Bending the knees shifts the work to the soleus, the endurance-oriented muscle under the gastrocnemius.",
    watchOut: "Letting the knees bob to cheat. Hold the knee angle steady and move only at the ankle through a full range.",
  },
  "seated-dumbbell-calf-raise": {
    why: "A dumbbell on the knees with the knee bent targets the soleus — a simple seated calf option anywhere.",
    watchOut: "Tiny bouncy reps. Drop the heels for a full stretch and press up onto the toes under control.",
  },
  "barbell-seated-calf-raise": {
    why: "A barbell across the bent knees loads the soleus through plantarflexion for lower-leg thickness.",
    watchOut: "Short range and bouncing. Use a block, get a deep stretch, and squeeze fully at the top.",
  },
  "cable-standing-calf-raise": {
    why: "A cable keeps constant tension on the gastrocnemius through the standing raise, including the stretched bottom position.",
    watchOut: "Rushing the reps. Control the full range and pause briefly at the top squeeze.",
  },
  "machine-hack-squat-calf-raise": {
    why: "Using the hack squat platform for calf raises lets you load the gastrocnemius heavily with the back braced.",
    watchOut: "Letting the knees flex to assist. Keep the legs nearly straight and move through a full ankle range.",
  },
  "reverse-calf-raise": {
    why: "Lifting the toes toward the shin trains the tibialis anterior at the front of the lower leg — it balances the calves and helps shin and ankle health.",
    watchOut: "Using momentum or a tiny range. Lift the toes high and lower under control through a full range.",
  },
  "seated-tibialis-raise": {
    why: "Seated, raising the toes against resistance isolates the tibialis anterior for shin strength and ankle balance.",
    watchOut: "Swinging the feet. Move slowly through a full range and feel the front of the shin work.",
  },
  "banded-calf-raise": {
    why: "A band adds rising tension to the calf raise, loading the gastrocnemius toward the top squeeze — easy anywhere.",
    watchOut: "Short reps. Keep band tension throughout, get a full stretch, and squeeze hard at the top.",
  },
  "banded-tibialis-raise": {
    why: "A band loads the tibialis anterior as you pull the toes up — simple shin-strength and ankle-health work.",
    watchOut: "Rushing or shortening the range. Pull the toes up fully against the band and lower slowly.",
  },
  "pogo-jumps": {
    why: "Small, stiff, repeated hops train the calves and Achilles for reactive, elastic strength and ankle stiffness — useful for running and jumping.",
    watchOut: "Soft slow landings (which miss the point) or crashing down. Stay tall, keep the ankles springy, and bounce off the balls of the feet.",
  },
  "jump-rope": {
    why: "Skipping trains the calves and the whole lower leg for endurance and elastic stiffness while delivering solid conditioning.",
    watchOut: "Landing flat and heavy. Stay light on the balls of the feet with soft knees and a quick, low bounce.",
  },
  "seated-calf-raise-single-leg": {
    why: "One leg seated isolates each soleus through a full range and evens out imbalances.",
    watchOut: "Bouncing or a short range. Drop into a stretch and press up fully on each leg.",
  },
  "standing-smith-machine-calf-raise": {
    why: "With the toes elevated and the bar fixed, this loads the gastrocnemius through an extra-deep stretch safely.",
    watchOut: "Cutting the stretch short. Let the heels sink for a full stretch and press all the way to the top.",
  },
  "isometric-calf-hold": {
    why: "Holding the top of a calf raise builds tendon stiffness and calf endurance through time under tension.",
    watchOut: "Letting the heels sag during the hold. Stay up high on the toes and keep the calves fully contracted.",
  },
  "loaded-stretch-calf-raise": {
    why: "Pausing in the stretched bottom position under load emphasises the calf in its lengthened range, which is a strong driver of growth.",
    watchOut: "Bouncing out of the stretch. Hold the bottom stretch briefly under control before pressing up.",
  },
  "eccentric-calf-raise": {
    why: "Emphasising a slow lower loads the calf and Achilles eccentrically, building strength and tendon resilience (and useful for Achilles rehab).",
    watchOut: "Dropping fast. Lower over 3–5 seconds with control through a full range.",
  },
  "hopping-calf-raise": {
    why: "Adding a small hop trains the calves' reactive, springy strength for jumping and running.",
    watchOut: "Heavy, flat landings. Stay light on the balls of the feet and keep the bounce quick and controlled.",
  },
  "incline-calf-raise": {
    why: "Standing on an incline increases the stretch at the bottom, loading the gastrocnemius harder in its lengthened range.",
    watchOut: "Short reps. Use the deeper stretch fully and press all the way to the top squeeze.",
  },
  "single-leg-leg-press-calf-raise": {
    why: "One foot on the leg press doubles the load on each calf through a full range with the back supported.",
    watchOut: "Letting the knee bend to assist. Keep the leg nearly straight and move through a full ankle range.",
  },
  "smith-machine-seated-calf-raise": {
    why: "The fixed bar across the bent knees loads the soleus heavily and safely without balancing.",
    watchOut: "Short bouncy reps. Get a full stretch at the bottom and a full squeeze at the top.",
  },
  "plate-loaded-standing-calf-raise": {
    why: "A plate-loaded standing machine loads the gastrocnemius heavily through plantarflexion for calf size.",
    watchOut: "Bouncing through a short range. Use a deep stretch and a high squeeze with a controlled tempo.",
  },

  // ==================== ARMS — BICEPS ====================
  "barbell-curl": {
    why: "The barbell curl lets both biceps work together under heavier load through elbow flexion — the classic biceps mass builder.",
    watchOut: "Swinging the weight up with the back and shoulders. Keep the elbows pinned at the sides, the torso still, and curl with the biceps through a full range.",
  },
  "ez-bar-curl": {
    why: "The angled EZ-bar grip eases wrist strain while still letting both biceps curl heavy.",
    watchOut: "Heaving with the body or short reps. Keep the elbows fixed and curl through a full range, controlling the lower.",
  },
  "standing-dumbbell-curl": {
    why: "Dumbbells let each biceps work independently and fully supinate the wrist, maximising the contraction.",
    watchOut: "Swinging and using momentum. Keep the elbows at the sides, supinate as you curl, and lower under control.",
  },
  "alternating-dumbbell-curl": {
    why: "Curling one arm at a time lets you focus on each biceps and keep stricter form with less momentum.",
    watchOut: "Rocking the torso to swing each rep. Keep the body still and curl with control.",
  },
  "seated-dumbbell-curl": {
    why: "Sitting removes leg drive and momentum, forcing a stricter biceps curl.",
    watchOut: "Leaning back to heave. Keep the back upright, elbows fixed, and curl strictly.",
  },
  "incline-dumbbell-curl": {
    why: "Lying back on an incline puts the arms behind the body, stretching the long head of the biceps for a strong stimulus in the lengthened position.",
    watchOut: "Swinging the weights up. Keep the back on the pad, let the arms hang for the stretch, and curl without flaring the elbows forward.",
  },
  "concentration-curl": {
    why: "Bracing the elbow against the thigh isolates the biceps completely for a strict, peak-focused contraction.",
    watchOut: "Using the shoulder or body to lift. Keep the elbow planted and curl with the biceps alone.",
  },
  "preacher-curl": {
    why: "The preacher pad fixes the upper arm and removes momentum, isolating the biceps with a strong stretch at the bottom.",
    watchOut: "Bouncing out of the bottom stretch or not fully extending. Lower under control to near-straight and curl strictly.",
  },
  "ez-bar-preacher-curl": {
    why: "The EZ-bar preacher isolates the biceps on the pad with a wrist-friendly grip and a strong bottom stretch.",
    watchOut: "Snapping out of the stretch. Control the lower and curl with the biceps, elbows on the pad.",
  },
  "dumbbell-preacher-curl": {
    why: "One dumbbell on the preacher pad isolates each biceps with a deep stretch and lets you fix imbalances.",
    watchOut: "Bouncing at the bottom. Control the stretch and curl strictly on each arm.",
  },
  "machine-preacher-curl": {
    why: "The machine guides the preacher curl with constant tension and no balancing, isolating the biceps to failure.",
    watchOut: "Using momentum against the pad. Keep the upper arms planted and curl smoothly through a full range.",
  },
  "cable-curl": {
    why: "The cable keeps constant tension on the biceps through the whole curl, including positions where free weights go light.",
    watchOut: "Swinging or letting the elbows drift. Keep the elbows fixed and curl with steady tension.",
  },
  "standing-cable-curl": {
    why: "A standing cable curl loads the biceps with constant tension and a strong contraction throughout.",
    watchOut: "Leaning back to heave. Keep the torso still and curl with the biceps.",
  },
  "single-arm-cable-curl": {
    why: "One arm on the cable gives constant tension and lets you focus on each biceps and fix imbalances.",
    watchOut: "Twisting the body to assist. Keep the torso square and curl with the working arm.",
  },
  "bayesian-cable-curl": {
    why: "Facing away with the cable behind you puts the arm behind the torso, stretching the long head of the biceps under constant tension — a strong lengthened-position curl.",
    watchOut: "Letting the shoulder roll forward or the elbow drift up. Keep the upper arm back and curl from the stretch.",
  },
  "high-cable-curl": {
    why: "Curling from a high pulley with the arms out trains the biceps with a strong peak contraction from a different angle.",
    watchOut: "Using the shoulders to pull. Keep the upper arms fixed out to the sides and curl the hands toward the head.",
  },
  "behind-the-back-cable-curl": {
    why: "The cable behind the body keeps the arm back, loading the long head of the biceps in a stretched position with constant tension.",
    watchOut: "Letting the elbow drift forward. Keep the upper arm back and curl from the stretch.",
  },
  "rope-cable-curl": {
    why: "A rope lets the wrists rotate freely, hitting the biceps and brachialis with constant cable tension and a strong squeeze.",
    watchOut: "Swinging the rope. Keep the elbows fixed and curl with control, spreading the rope at the top.",
  },
  "spider-curl": {
    why: "Lying chest-down with the arms hanging removes momentum and keeps tension on the biceps through a strict, peak-focused curl.",
    watchOut: "Swinging the arms. Keep the upper arms vertical and curl strictly with the biceps.",
  },
  "reverse-curl": {
    why: "An overhand grip shifts the work to the brachialis and brachioradialis (forearm), building arm thickness and grip.",
    watchOut: "Using momentum or breaking the wrists. Keep the wrists firm and curl with control through a full range.",
  },
  "barbell-reverse-curl": {
    why: "The barbell reverse curl loads the brachialis and forearms heavier through elbow flexion with a pronated grip.",
    watchOut: "Swinging or letting the wrists drop. Keep the elbows at the sides, wrists firm, and curl with control.",
  },
  "ez-bar-reverse-curl": {
    why: "The EZ-bar eases the wrists while still loading the brachialis and forearms in the reverse curl.",
    watchOut: "Heaving with the body. Keep the elbows fixed and curl strictly.",
  },
  "hammer-curl": {
    why: "The neutral (palms-in) grip emphasises the brachialis and brachioradialis, building arm thickness and pushing the biceps up.",
    watchOut: "Swinging the weights. Keep the elbows at the sides and curl with control, wrists neutral.",
  },
  "alternating-hammer-curl": {
    why: "One arm at a time with a neutral grip lets you focus on each brachialis and keep stricter form.",
    watchOut: "Rocking to swing. Keep the body still and curl each arm with control.",
  },
  "cross-body-hammer-curl": {
    why: "Curling across the body toward the opposite shoulder strongly targets the brachialis.",
    watchOut: "Using the shoulder to swing. Keep the elbow fixed and curl across with control.",
  },
  "seated-hammer-curl": {
    why: "Sitting removes momentum for a stricter neutral-grip curl on the brachialis and biceps.",
    watchOut: "Leaning to heave. Keep the back upright and curl strictly.",
  },
  "incline-hammer-curl": {
    why: "On an incline, the arms hang back for a stretch while the neutral grip targets the brachialis and biceps long head.",
    watchOut: "Swinging off the pad. Keep the back down and curl from the stretch.",
  },
  "rope-hammer-curl": {
    why: "A rope keeps a neutral grip under constant cable tension, hitting the brachialis and biceps with a strong squeeze.",
    watchOut: "Swinging the rope. Keep the elbows fixed and curl with control.",
  },
  "drag-curl": {
    why: "Dragging the bar up the body with the elbows pulling back keeps tension on the biceps and emphasises the peak contraction.",
    watchOut: "Letting the elbows drift forward into a normal curl. Pull the elbows back and drag the bar up the torso.",
  },
  "zottman-curl": {
    why: "Curling up supinated and lowering pronated trains the biceps on the way up and the forearms/brachialis on the way down — a complete arm move.",
    watchOut: "Rushing the rotation. Rotate at the top and lower slowly with the pronated grip.",
  },
  "scott-curl": {
    why: "A preacher-style curl on the Scott bench isolates the biceps with the upper arm fixed and a strong stretch.",
    watchOut: "Bouncing out of the bottom. Control the lower and curl strictly.",
  },
  "machine-curl": {
    why: "The curl machine guides elbow flexion with constant tension and no balancing, isolating the biceps to failure.",
    watchOut: "Using momentum against the pad. Keep the upper arms planted and curl smoothly.",
  },
  "single-arm-machine-curl": {
    why: "One arm on the machine isolates each biceps with constant tension and fixes imbalances.",
    watchOut: "Twisting to assist. Keep the body still and curl with the working arm.",
  },
  "standing-resistance-band-curl": {
    why: "A band curl loads the biceps with rising tension toward the top squeeze — easy anywhere.",
    watchOut: "Letting the band go slack or swinging. Keep tension throughout and curl with control.",
  },
  "seated-resistance-band-curl": {
    why: "Seated, a band curl isolates the biceps with rising tension and no momentum.",
    watchOut: "Heaving with the body. Keep the elbows fixed and curl strictly against the band.",
  },
  "trx-biceps-curl": {
    why: "Suspension curls load the biceps with bodyweight, scalable by body angle, with an added stability demand.",
    watchOut: "Letting the elbows drop or the hips sag. Keep the upper arms high and the body rigid, curling the body up.",
  },
  "ring-curl": {
    why: "Ring curls load the biceps with bodyweight and free rotation, scalable by angle, with a stability challenge.",
    watchOut: "Sagging the hips or dropping the elbows. Keep the body straight and the upper arms high.",
  },
  "chin-up-biceps": {
    why: "An underhand chin-up loads the biceps heavily alongside the lats — bodyweight makes it a serious biceps builder.",
    watchOut: "Half-reps or swinging. Use a full hang-to-chin range and control the lower.",
  },
  "close-grip-chin-up": {
    why: "A narrow underhand grip increases the biceps' involvement in the chin-up for a strong arm stimulus.",
    watchOut: "Kipping or shortening the range. Pull with control from a full hang and lower slowly.",
  },
  "cable-preacher-curl": {
    why: "A cable preacher curl isolates the biceps on the pad with constant tension and a strong stretch.",
    watchOut: "Bouncing out of the bottom. Control the lower and curl strictly on the pad.",
  },
  "dumbbell-drag-curl": {
    why: "Dragging the dumbbells up the body with the elbows back keeps tension on the biceps and emphasises the squeeze.",
    watchOut: "Letting the elbows come forward. Pull the elbows back and drag the weights up the torso.",
  },
  "isometric-curl-hold": {
    why: "Holding the mid-curl position builds biceps strength and endurance through time under tension.",
    watchOut: "Letting the elbows drift or the weight sag. Hold a strong 90° position with the biceps fully engaged.",
  },

  // ==================== ARMS — TRICEPS ====================
  "close-grip-bench-triceps": {
    why: "A narrow grip on the bench press makes the triceps the prime mover while still loading them with heavy, pressable weight — a top triceps mass builder.",
    watchOut: "Flaring the elbows or going too narrow on the wrists. Keep the hands around shoulder-width, elbows tucked, and lower to the lower chest.",
  },
  "barbell-skull-crusher": {
    why: "Lowering a barbell to the forehead isolates the triceps through elbow extension with a strong stretch on the long head.",
    watchOut: "Flaring the elbows and using the shoulders. Keep the upper arms still and elbows in, lowering to the forehead or just behind, and extend with the triceps.",
  },
  "ez-bar-skull-crusher": {
    why: "The EZ-bar eases the wrists in the skull crusher while still loading the triceps through a strong stretch.",
    watchOut: "Letting the elbows flare or drift. Keep the upper arms fixed and extend with the triceps.",
  },
  "incline-skull-crusher-triceps": {
    why: "On an incline, the skull crusher increases the stretch on the long head of the triceps for a stronger lengthened-position stimulus.",
    watchOut: "Flaring the elbows. Keep the upper arms fixed at the incline and extend with control.",
  },
  "dumbbell-skull-crusher": {
    why: "Dumbbells let the wrists stay neutral and each triceps work through a full range with a strong stretch.",
    watchOut: "Flaring the elbows or clashing the weights. Keep the upper arms still and lower to the head/ears under control.",
  },
  "single-arm-dumbbell-skull-crusher": {
    why: "One arm at a time isolates each triceps through a full stretch and fixes imbalances.",
    watchOut: "Letting the elbow drift. Keep the upper arm fixed and extend with the triceps.",
  },
  "overhead-dumbbell-triceps-extension": {
    why: "Pressing a dumbbell from behind the head loads the long head of the triceps in a deep stretch — key for triceps size.",
    watchOut: "Flaring the elbows or arching the back. Keep the elbows pointing forward and ribs down, lowering to a deep stretch behind the head.",
  },
  "single-arm-overhead-dumbbell-extension": {
    why: "One arm overhead isolates each triceps long head through a deep stretch and fixes imbalances.",
    watchOut: "Letting the elbow flare out. Keep the elbow pointing up and forward, and extend with control.",
  },
  "seated-overhead-dumbbell-extension": {
    why: "Seated and supported, the overhead extension isolates the triceps long head in a stretched position with stricter form.",
    watchOut: "Arching the back to press. Keep the back supported, ribs down, and extend overhead.",
  },
  "cable-triceps-pushdown": {
    why: "The pushdown loads the triceps with constant cable tension and a strong squeeze at the bottom — a staple for triceps detail and volume.",
    watchOut: "Leaning over and using the shoulders or body. Keep the elbows pinned at the sides and extend with the triceps only.",
  },
  "rope-pushdown": {
    why: "A rope lets the hands spread at the bottom for a stronger triceps contraction under constant tension.",
    watchOut: "Flaring the elbows or swinging. Keep the elbows fixed and spread the rope at the bottom.",
  },
  "reverse-grip-pushdown": {
    why: "An underhand grip biases the medial head of the triceps with constant cable tension.",
    watchOut: "Letting the wrist break or the elbows drift. Keep the wrists firm and elbows pinned, extending fully.",
  },
  "single-arm-cable-pushdown": {
    why: "One arm isolates each triceps with constant tension and fixes imbalances.",
    watchOut: "Twisting the body to help. Keep the elbow fixed and extend with the working arm.",
  },
  "cross-body-cable-extension": {
    why: "Extending across the body trains the triceps from a different angle with constant cable tension.",
    watchOut: "Using the shoulder or body to swing. Keep the upper arm fixed and extend with the triceps.",
  },
  "overhead-cable-triceps-extension": {
    why: "Facing away with the cable overhead loads the long head of the triceps in a deep stretch under constant tension — excellent for triceps size.",
    watchOut: "Arching the back or flaring the elbows. Keep the ribs down and elbows in, extending from a deep overhead stretch.",
  },
  "single-arm-overhead-cable-extension": {
    why: "One arm overhead on the cable isolates each triceps long head in a stretch with constant tension.",
    watchOut: "Flaring the elbow. Keep the upper arm fixed overhead and extend with control.",
  },
  "bayesian-triceps-extension": {
    why: "An overhead cable extension facing away, stretching the long head deeply with constant tension throughout.",
    watchOut: "Letting the elbow drop or the back arch. Keep the upper arm fixed and extend from the stretch.",
  },
  "cable-kickback-triceps": {
    why: "Extending the arm back against a cable keeps constant tension on the triceps through a strong contraction.",
    watchOut: "Swinging or dropping the elbow. Keep the upper arm parallel and fixed, and extend with the triceps.",
  },
  "dumbbell-triceps-kickback": {
    why: "Extending a dumbbell back isolates the triceps with a strong peak contraction at full extension.",
    watchOut: "Swinging the weight or dropping the elbow. Keep the upper arm parallel and still, and extend with the triceps.",
  },
  "bench-dip": {
    why: "Dipping with the hands on a bench loads the triceps through elbow extension with bodyweight — a simple, scalable triceps move.",
    watchOut: "Dropping too low and stressing the shoulders. Keep the hips close to the bench and lower only to about 90° at the elbows.",
  },
  "weighted-bench-dip": {
    why: "Adding a plate on the lap progresses the bench dip into a heavier triceps builder.",
    watchOut: "Going too deep under load. Keep the range to about 90° and the shoulders out of a painful stretch.",
  },
  "parallel-bar-dip": {
    why: "An upright torso on parallel bars makes the dip a heavy triceps builder through a full bodyweight range.",
    watchOut: "Dropping too deep or shrugging. Stay fairly upright, lower to about 90°, and keep the shoulders down.",
  },
  "weighted-dip": {
    why: "Adding weight to the upright dip takes the triceps into a heavy strength-and-size range.",
    watchOut: "Letting depth or the shoulders go under load. Keep an upright torso, controlled depth, and shoulders down.",
  },
  "assisted-dip": {
    why: "Machine or band assistance lets you train the triceps dip with full range before you can do bodyweight reps.",
    watchOut: "Bouncing out of the bottom. Use the assist to control a full range and reduce it as you get stronger.",
  },
  "diamond-push-up-triceps": {
    why: "Hands together under the chest shifts the push-up onto the triceps — a bodyweight triceps builder.",
    watchOut: "Flaring the elbows or sagging the hips. Keep the elbows tucked and the body in a straight line.",
  },
  "close-grip-push-up": {
    why: "A narrow hand position emphasises the triceps in the push-up while the chest assists.",
    watchOut: "Hips sagging or elbows flaring. Keep the elbows close to the body and the torso braced.",
  },
  "bodyweight-triceps-extension": {
    why: "Lowering the body by bending the elbows on a high bar or rings loads the triceps with bodyweight through extension — like a standing skull crusher.",
    watchOut: "Letting the elbows flare or the hips sag. Keep the upper arms fixed and the body straight.",
  },
  "trx-triceps-extension": {
    why: "Suspension extensions load the triceps with bodyweight through a strong stretch, scalable by body angle.",
    watchOut: "Dropping the elbows or sagging. Keep the upper arms high and the body rigid, extending with the triceps.",
  },
  "ring-triceps-extension": {
    why: "Ring extensions load the triceps with bodyweight and free rotation through a deep stretch, scalable by angle.",
    watchOut: "Letting the hips sag or elbows flare. Keep the body straight and upper arms fixed.",
  },
  "machine-triceps-extension": {
    why: "The machine guides triceps extension with constant tension and no balancing, isolating them to failure.",
    watchOut: "Using momentum against the pad. Keep the upper arms fixed and extend smoothly through a full range.",
  },
  "seated-machine-dip": {
    why: "The dip machine guides elbow extension with back support, letting you load the triceps heavily and safely.",
    watchOut: "Shrugging or using a tiny range. Keep the shoulders down and press through a full range with the triceps.",
  },
  "hammer-strength-dip-machine": {
    why: "Plate-loaded dip handles let you load the triceps through a guided press with a strong contraction and stable form.",
    watchOut: "Letting the stronger side dominate or shrugging. Press evenly with the shoulders down.",
  },
  "smith-machine-close-grip-bench-press": {
    why: "A narrow grip on the fixed Smith bar loads the triceps heavily through a pressable range without balancing.",
    watchOut: "Flaring the elbows or a too-narrow grip. Keep the elbows tucked and the grip about shoulder-width, lowering to the lower chest.",
  },
  "smith-machine-jm-press": {
    why: "A hybrid of a close-grip press and a skull crusher on the Smith machine, the JM press overloads the triceps in a strong, pressable position.",
    watchOut: "Going too heavy with poor elbow position. Keep the elbows tracking and lower the bar toward the upper chest/chin in the JM groove.",
  },
  "jm-press": {
    why: "Part close-grip press, part skull crusher, the JM press lets the triceps move heavy weight through a triceps-dominant groove.",
    watchOut: "Flaring the elbows or losing the groove. Keep the elbows in and lower toward the upper chest/chin under control.",
  },
  "floor-skull-crusher": {
    why: "Pressing from the floor limits the range and is easier on the shoulders while still loading the triceps through extension.",
    watchOut: "Bouncing the elbows off the floor. Touch lightly and extend with the triceps, upper arms fixed.",
  },
  "decline-skull-crusher": {
    why: "On a decline, the skull crusher keeps constant tension on the triceps and changes the resistance angle for a strong stretch.",
    watchOut: "Flaring the elbows. Keep the upper arms fixed and lower with control.",
  },
  "resistance-band-pushdown-triceps": {
    why: "A band pushdown loads the triceps with rising tension toward the bottom squeeze — easy anywhere.",
    watchOut: "Letting the elbows drift or the band go slack. Keep the elbows pinned and extend fully against the band.",
  },
  "resistance-band-overhead-extension": {
    why: "A band overhead extension loads the triceps long head in a stretch with rising tension — travel-friendly long-head work.",
    watchOut: "Arching the back or flaring the elbows. Keep the ribs down and elbows in, extending from the stretch.",
  },
  "band-kickback-triceps": {
    why: "A band kickback keeps tension on the triceps through to a strong peak contraction — simple anywhere.",
    watchOut: "Swinging or dropping the elbow. Keep the upper arm parallel and fixed, extending with the triceps.",
  },
  "tate-press": {
    why: "Pressing dumbbells with the elbows flared and lowering them to the chest targets the triceps (especially the medial head) in a unique groove.",
    watchOut: "Letting the shoulders take over. Keep the upper arms still and squeeze the triceps to extend.",
  },
  "decline-close-grip-bench-press": {
    why: "A decline narrows the press onto the triceps and lower chest, letting you load the triceps heavy through a pressable range.",
    watchOut: "Flaring the elbows. Keep them tucked and lower to the lower chest under control.",
  },
  "incline-close-grip-bench-press": {
    why: "An incline close-grip press loads the triceps with some upper-chest involvement through a pressable range.",
    watchOut: "Elbows flaring or grip too narrow. Keep the elbows in and the grip about shoulder-width.",
  },
  "single-arm-cable-kickback-triceps": {
    why: "One arm on the cable keeps constant tension through the triceps kickback and fixes imbalances.",
    watchOut: "Swinging or dropping the elbow. Keep the upper arm fixed and extend with the working triceps.",
  },
  "isometric-pushdown-hold": {
    why: "Holding the bottom of a pushdown builds triceps strength and endurance through time under tension at full extension.",
    watchOut: "Letting the elbows drift or the bar creep up. Hold full extension with the triceps fully contracted.",
  },

  // ==================== CORE ====================
  "crunch": {
    why: "The crunch flexes the spine against gravity, directly training the rectus abdominis (the 'six-pack') through its main job of trunk flexion.",
    watchOut: "Yanking the neck with the hands or jerking up. Curl the ribs toward the hips with the abs, keep the neck relaxed, and lower under control.",
  },
  "sit-up": {
    why: "The full sit-up adds hip flexion to the crunch, working the rectus abdominis through a longer range (with the hip flexors assisting).",
    watchOut: "Pulling on the neck or heaving up with momentum. Curl up smoothly, keep the neck neutral, and lower with control.",
  },
  "weighted-sit-up": {
    why: "Holding a weight progresses the sit-up into a stronger ab builder once bodyweight reps are easy.",
    watchOut: "Using momentum to throw the weight up. Keep the movement controlled and curl with the abs.",
  },
  "decline-sit-up": {
    why: "The decline increases the range and the resistance against gravity, loading the rectus abdominis harder.",
    watchOut: "Anchoring the feet and yanking up with the hip flexors. Curl the trunk with the abs and control the descent.",
  },
  "decline-crunch": {
    why: "On a decline, the crunch loads the upper abs harder through a longer range against gravity.",
    watchOut: "Pulling the neck or using momentum. Curl the ribs to the hips with the abs and lower slowly.",
  },
  "reverse-crunch": {
    why: "Curling the hips and knees toward the chest trains the lower portion of the rectus abdominis through posterior pelvic tilt.",
    watchOut: "Swinging the legs with momentum. Curl the hips up with the abs (not just lifting the legs) and lower under control.",
  },
  "hanging-knee-raise": {
    why: "Hanging and raising the knees trains the lower abs and hip flexors while the grip and shoulders work to hold position.",
    watchOut: "Swinging the body to kip the knees up. Stay still, curl the pelvis under with the abs, and lower slowly.",
  },
  "hanging-leg-raise": {
    why: "Raising straight legs while hanging is a harder lower-ab move, training the rectus abdominis through a big range against a long lever.",
    watchOut: "Swinging and using momentum, or just lifting the legs. Curl the pelvis under with the abs and control the descent.",
  },
  "toes-to-bar": {
    why: "Bringing the toes to the bar is an advanced hanging move that trains the whole rectus abdominis and hip flexors through a huge range.",
    watchOut: "Kipping wildly. Use as little swing as possible, curl with the abs, and lower under control.",
  },
  "captains-chair-knee-raise": {
    why: "Supported on the captain's chair, knee raises isolate the lower abs and hip flexors without grip or swing.",
    watchOut: "Swinging the knees up. Curl the pelvis under with the abs and lower slowly.",
  },
  "captains-chair-leg-raise": {
    why: "Straight-leg raises on the captain's chair load the lower abs harder through a longer lever, without grip demand.",
    watchOut: "Using momentum or arching the back. Curl the pelvis under with the abs and control the lower.",
  },
  "lying-leg-raise": {
    why: "Lying leg raises train the lower abs and hip flexors as you lift and lower the legs against gravity.",
    watchOut: "Letting the lower back arch off the floor. Press the lower back down and lower the legs only as far as you can keep it flat.",
  },
  "flutter-kicks": {
    why: "Small alternating leg kicks keep the lower abs under constant tension for endurance.",
    watchOut: "Arching the lower back. Press the lower back into the floor and keep the kicks small and controlled.",
  },
  "scissor-kicks": {
    why: "Crossing the legs over and under keeps the lower abs and hip flexors under continuous tension.",
    watchOut: "Letting the back arch. Keep the lower back pressed down and the movement controlled.",
  },
  "dead-bug": {
    why: "Extending opposite arm and leg while bracing trains the deep core to keep the spine stable against movement — foundational anti-extension control.",
    watchOut: "Letting the lower back arch off the floor. Keep the back pressed down and move the limbs slowly, only as far as you can stay braced.",
  },
  "bicycle-crunch": {
    why: "Alternating elbow-to-opposite-knee combines flexion and rotation, training the rectus abdominis and obliques together.",
    watchOut: "Yanking the neck and racing through reps. Rotate with the obliques, keep the neck relaxed, and move with control.",
  },
  "oblique-crunch": {
    why: "Crunching toward one side targets the obliques through side flexion and rotation.",
    watchOut: "Pulling the neck. Curl toward the hip with the obliques and lower under control.",
  },
  "cable-crunch": {
    why: "Crunching against a cable lets you load the rectus abdominis with progressive resistance and constant tension — like a weighted crunch you can add weight to.",
    watchOut: "Pulling with the arms or hinging at the hips. Keep the hips fixed and curl the ribs toward the pelvis with the abs.",
  },
  "kneeling-cable-crunch": {
    why: "Kneeling, the cable crunch loads the upper abs heavily through spinal flexion with constant tension.",
    watchOut: "Sitting back with the hips or pulling with the arms. Keep the hips still and crunch with the abs, ribs to pelvis.",
  },
  "standing-cable-crunch": {
    why: "A standing cable crunch loads the abs through flexion with constant tension while standing.",
    watchOut: "Bending at the hips instead of the spine. Keep the hips fixed and curl the ribs down with the abs.",
  },
  "ab-wheel-rollout": {
    why: "Rolling out and resisting the return is a hard anti-extension move — the entire core works to keep the spine from over-extending under a long lever.",
    watchOut: "Letting the lower back sag as you roll out. Brace hard, keep the ribs down, and only roll out as far as you can keep a flat back.",
  },
  "kneeling-ab-rollout": {
    why: "From the knees, the rollout trains the core's anti-extension strength at a manageable level before the full standing version.",
    watchOut: "Letting the hips pike or the back sag. Keep a braced, slightly rounded spine and control the roll-out and return.",
  },
  "barbell-rollout": {
    why: "Rolling a loaded barbell out and back trains the whole core to resist extension, with the option to add weight for progression.",
    watchOut: "Sagging the lower back at full reach. Brace, keep the ribs down, and shorten the range if the back can't stay flat.",
  },
  "stability-ball-rollout": {
    why: "Rolling the forearms out on a ball trains anti-extension core strength with a stability challenge, scalable by reach.",
    watchOut: "Letting the hips drop or back arch. Keep the core braced and roll out only as far as you can hold a flat back.",
  },
  "plank": {
    why: "Holding a rigid plank trains the entire core to resist the spine sagging (anti-extension), building the bracing strength that protects every lift.",
    watchOut: "Hips sagging or piking up, and holding the breath. Keep a straight line from head to heels, squeeze the glutes and abs, and breathe.",
  },
  "forearm-plank": {
    why: "On the forearms, the plank trains anti-extension core stability through an isometric hold.",
    watchOut: "Letting the hips sag or the shoulders creep up. Keep a straight line, brace the abs, and keep the neck neutral.",
  },
  "side-plank": {
    why: "Holding a side plank trains the obliques and lateral core to resist the hips dropping (anti-lateral-flexion) — key for spinal stability.",
    watchOut: "Letting the hips sag toward the floor. Stack the shoulders and hips, lift the hips into a straight line, and hold.",
  },
  "side-plank-hip-dips": {
    why: "Adding hip dips to the side plank trains the obliques dynamically through side flexion.",
    watchOut: "Letting the hips rotate. Keep the body in one plane and dip and lift with the obliques under control.",
  },
  "plank-shoulder-tap": {
    why: "Tapping the opposite shoulder in a plank adds an anti-rotation demand — the core resists the body twisting as weight shifts to one arm.",
    watchOut: "Letting the hips rock side to side. Keep the hips square and still, and tap slowly.",
  },
  "plank-leg-lift": {
    why: "Lifting one leg in a plank adds an anti-extension and anti-rotation challenge as the base of support shrinks.",
    watchOut: "Arching the back or rotating the hips. Keep the hips level and the core braced as you lift each leg.",
  },
  "mountain-climber": {
    why: "Driving the knees in from a plank trains the core and hip flexors dynamically while raising the heart rate — core plus conditioning.",
    watchOut: "Letting the hips pike up or the back sag. Keep the shoulders over the hands and the hips low, driving the knees with control.",
  },
  "slow-mountain-climber": {
    why: "Slowing the mountain climber emphasises core control and the anti-extension hold over conditioning.",
    watchOut: "Hips rising or rotating. Keep a strong plank and draw the knee in slowly with the abs.",
  },
  "weighted-plank": {
    why: "Adding a plate to the plank progresses the anti-extension hold once a bodyweight plank is easy.",
    watchOut: "Sagging or piking under the load. Keep a straight braced line and breathe through the hold.",
  },
  "rkc-plank": {
    why: "A high-tension plank with everything squeezed maximally makes a short hold extremely hard, training full-body bracing.",
    watchOut: "Holding the breath or losing tension. Squeeze the glutes, quads and abs hard, keep the line straight, and keep breathing.",
  },
  "swiss-ball-crunch": {
    why: "Crunching on a ball lets the spine extend further at the bottom, increasing the range for the rectus abdominis.",
    watchOut: "Yanking the neck or rolling the ball. Keep the ball still and curl the ribs to the hips with the abs.",
  },
  "swiss-ball-jackknife": {
    why: "Pulling the ball in with the feet from a plank trains the lower abs and hip flexors with a stability challenge.",
    watchOut: "Letting the hips sag as you reach out. Keep the core braced and roll the ball in with the abs, hips level.",
  },
  "swiss-ball-rollout": {
    why: "Rolling out on the ball trains anti-extension core strength with an added balance demand.",
    watchOut: "Sagging the lower back. Brace, keep the ribs down, and control the range.",
  },
  "russian-twist": {
    why: "Rotating the torso side to side trains the obliques through rotation.",
    watchOut: "Moving only the arms or rounding hard. Rotate from the trunk with the obliques, keep the chest up, and control each side.",
  },
  "weighted-russian-twist": {
    why: "Holding a weight progresses the Russian twist's rotational oblique work.",
    watchOut: "Swinging the weight with the arms. Rotate from the trunk and control the weight side to side.",
  },
  "cable-woodchop": {
    why: "Chopping a cable across the body trains the obliques and core through rotation under constant tension — a strong, functional rotational move.",
    watchOut: "Bending the arms and pulling. Keep the arms fairly straight and rotate from the trunk, pivoting the back foot.",
  },
  "high-to-low-woodchop": {
    why: "Chopping from high to low trains rotation with a downward emphasis on the obliques and core under constant tension.",
    watchOut: "Using the arms instead of the trunk. Rotate from the core and let the hips and feet pivot.",
  },
  "low-to-high-woodchop": {
    why: "Chopping from low to high trains rotation with an upward emphasis on the obliques and core.",
    watchOut: "Yanking with the arms or over-arching. Rotate from the trunk and keep the core braced.",
  },
  "medicine-ball-slam": {
    why: "Slamming a ball overhead to the floor trains explosive core flexion and full-body power with a conditioning hit.",
    watchOut: "Rounding the back harshly into the slam. Brace, hinge slightly, and slam with the whole body under control.",
  },
  "medicine-ball-throw": {
    why: "Throwing a ball rotationally or overhead trains explosive core power and force transfer through the trunk.",
    watchOut: "Losing the brace or over-rotating the spine. Drive from the hips and core and follow through under control.",
  },
  "anti-rotation-press": {
    why: "Pressing a cable straight out while resisting its sideways pull trains the core to resist rotation (the Pallof press) — pure anti-rotation stability.",
    watchOut: "Letting the torso twist toward the cable. Stay square, brace the core, and press straight out and back slowly.",
  },
  "banded-pallof-press": {
    why: "A band version of the Pallof press trains anti-rotation core stability with rising tension — easy anywhere.",
    watchOut: "Twisting toward the band. Keep the hips and shoulders square and press straight out, resisting the pull.",
  },
  "hollow-body-hold": {
    why: "Holding a hollow position with the limbs extended trains the whole anterior core to stay rigid — the foundation of gymnastics core strength and a strong brace.",
    watchOut: "Letting the lower back lift off the floor. Press the back down, tilt the pelvis under, and lower the limbs only as far as the back stays flat.",
  },
  "hollow-body-rock": {
    why: "Rocking in the hollow position adds dynamic tension, training the core to hold the brace through movement.",
    watchOut: "Breaking the hollow shape to rock. Keep the back pressed down and rock from the shoulders, holding the position.",
  },
  "dragon-flag": {
    why: "Lowering the whole body as a rigid lever from the shoulders is an advanced anti-extension feat that trains the entire core powerfully.",
    watchOut: "Letting the body bend or the back arch. Keep the body straight and rigid, lower slowly, and regress the range until you can control it.",
  },
  "windshield-wipers": {
    why: "Rotating the legs side to side while hanging or lying trains the obliques and rotational core through a big range under a long lever.",
    watchOut: "Swinging with momentum. Control the legs side to side with the obliques and keep the shoulders anchored.",
  },
  "l-sit": {
    why: "Holding the legs out straight while supported trains the lower abs and hip flexors isometrically with serious total-core tension.",
    watchOut: "Letting the hips sag or the back round. Press the shoulders down, brace hard, and hold the legs as straight as you can.",
  },
  "tuck-l-sit": {
    why: "The tucked L-sit builds toward the full L-sit, training the lower abs and hip flexors at a manageable level.",
    watchOut: "Sagging the shoulders. Press down through the hands, brace, and hold the tuck tight.",
  },
  "ab-crunch-machine": {
    why: "The crunch machine loads spinal flexion with constant resistance and back support, isolating the abs to failure with easy progression.",
    watchOut: "Pulling with the arms or using momentum. Curl the trunk with the abs and control the return.",
  },
  "seated-knee-tuck": {
    why: "Tucking the knees toward the chest from a seated position trains the lower abs and hip flexors through flexion.",
    watchOut: "Leaning back and swinging the legs. Curl the knees in with the abs and control the extension.",
  },
  "toe-touch-crunch": {
    why: "Reaching for the toes with the legs raised crunches the upper abs through a focused range.",
    watchOut: "Yanking the neck and reaching with the arms only. Curl the shoulder blades off the floor with the abs.",
  },
  "crunch-hold": {
    why: "Holding the top of a crunch builds ab strength and endurance through time under tension.",
    watchOut: "Letting the shoulders drift down or holding the breath. Keep the abs fully contracted and breathe through the hold.",
  },
  "isometric-side-bend-hold": {
    why: "Holding a loaded lateral position builds oblique and lateral-core endurance isometrically.",
    watchOut: "Slumping into the bend. Stay tall and braced, holding the obliques engaged.",
  },
  "bird-dog": {
    why: "Extending opposite arm and leg while bracing trains the core to resist rotation and the spine to stay stable — key low-back and core control.",
    watchOut: "Letting the hips rotate or the back sag. Keep the hips level and spine neutral, reaching long and moving slowly.",
  },
  "suitcase-carry": {
    why: "Carrying a weight in one hand forces the core to resist side-bending (anti-lateral-flexion) while you walk — strong oblique and grip work.",
    watchOut: "Leaning toward or away from the weight. Stand tall, keep the shoulders level, and walk braced and even.",
  },
  "farmer-carry": {
    why: "Walking with heavy weight in both hands builds total-body bracing, grip, traps and core stability under load.",
    watchOut: "Shrugging, rounding, or rushing. Stand tall, brace the core, keep the shoulders back, and take controlled steps.",
  },
  "overhead-carry": {
    why: "Carrying weight overhead forces the core and shoulders to stabilise against the load while you walk — strong anti-extension and overhead stability.",
    watchOut: "Arching the lower back to hold the weight up. Keep the ribs down, core braced, and the weight stacked over the shoulder.",
  },
  "dead-hang": {
    why: "Hanging from a bar builds grip and forearm endurance and decompresses the shoulders and spine — a simple way to improve hanging strength for pulls.",
    watchOut: "Hanging fully passive and shrugged. Keep the shoulders slightly active (not a dead shrug) and build the hold time gradually.",
  },
  "scapular-dead-hang": {
    why: "Adding gentle scapular engagement to the hang trains shoulder-blade control and the grip — healthy prep for pull-ups.",
    watchOut: "Fully relaxing into a dead shrug or over-pulling. Keep the shoulders gently set and the grip firm.",
  },
};
