/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Exercise } from "./types";

export const defaultExercises: Exercise[] = [
  // ==================== CHEST ====================
  {
    id: "barbell-bench-press",
    name: "Barbell Bench Press",
    category: "Chest",
    equipment: "Barbell",
    correctForm: "Lie on bench with eyes under bar. Plant feet firmly. Retract shoulder blades and maintain a slight arch. Grip slightly wider than shoulder width. Lower bar to mid-chest with control. Press upward until arms are extended without losing upper-back tightness."
  },
  {
    id: "close-grip-bench-press",
    name: "Close-Grip Bench Press",
    category: "Chest",
    equipment: "Barbell",
    correctForm: "Use a grip just inside shoulder width. Keep elbows closer to the torso during descent. Lower bar to lower chest or sternum. Press upward while maintaining wrist alignment and core stability."
  },
  {
    id: "wide-grip-bench-press",
    name: "Wide-Grip Bench Press",
    category: "Chest",
    equipment: "Barbell",
    correctForm: "Grip wider than shoulder width. Keep shoulders retracted. Lower bar under control to chest. Press explosively while maintaining stable shoulder positioning."
  },
  {
    id: "incline-barbell-bench-press",
    name: "Incline Barbell Bench Press",
    category: "Chest",
    equipment: "Barbell",
    correctForm: "Set bench angle between 30–45 degrees. Keep chest high and shoulders packed. Lower bar to upper chest. Press upward without shrugging shoulders."
  },
  {
    id: "decline-barbell-bench-press",
    name: "Decline Barbell Bench Press",
    category: "Chest",
    equipment: "Barbell",
    correctForm: "Secure legs under pads. Lower bar to lower chest while maintaining shoulder stability. Press upward through full range of motion."
  },
  {
    id: "dumbbell-bench-press",
    name: "Dumbbell Bench Press",
    category: "Chest",
    equipment: "Dumbbell",
    correctForm: "Start with dumbbells at chest level. Keep feet planted and shoulder blades retracted. Lower dumbbells until elbows are slightly below bench level. Press upward while keeping wrists neutral."
  },
  {
    id: "incline-dumbbell-press",
    name: "Incline Dumbbell Press",
    category: "Chest",
    equipment: "Dumbbell",
    correctForm: "Set bench to 30–45 degrees. Lower dumbbells to upper chest with elbows slightly tucked. Press upward while maintaining chest elevation."
  },
  {
    id: "decline-dumbbell-press",
    name: "Decline Dumbbell Press",
    category: "Chest",
    equipment: "Dumbbell",
    correctForm: "Secure body on bench. Lower dumbbells under control toward lower chest. Press upward while maintaining stable shoulders."
  },
  {
    id: "dumbbell-flyes",
    name: "Dumbbell Flyes",
    category: "Chest",
    equipment: "Dumbbell",
    correctForm: "Maintain a slight bend in elbows. Open arms wide until chest stretch is felt. Bring dumbbells together in an arc motion above chest. Avoid turning movement into a press."
  },
  {
    id: "incline-dumbbell-flyes",
    name: "Incline Dumbbell Flyes",
    category: "Chest",
    equipment: "Dumbbell",
    correctForm: "Keep slight elbow bend throughout. Lower arms wide until chest is stretched. Bring weights together over upper chest using controlled motion."
  },
  {
    id: "decline-dumbbell-flyes",
    name: "Decline Dumbbell Flyes",
    category: "Chest",
    equipment: "Dumbbell",
    correctForm: "Perform fly motion while maintaining shoulder stability. Focus on chest contraction rather than weight moved."
  },
  {
    id: "chest-press-machine",
    name: "Chest Press Machine",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Adjust seat so handles align with mid-chest. Press handles forward until arms are nearly straight. Return under control without letting weight stack slam."
  },
  {
    id: "incline-chest-press-machine",
    name: "Incline Chest Press Machine",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Adjust seat height appropriately. Press upward and forward through a natural path. Keep shoulders depressed and chest elevated."
  },
  {
    id: "hammer-strength-chest-press",
    name: "Hammer Strength Chest Press",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Set seat so handles align with chest. Press evenly with both arms. Control eccentric phase and avoid shoulder protraction."
  },
  {
    id: "pec-deck",
    name: "Pec Deck",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Adjust seat so elbows align with chest height. Maintain slight elbow bend. Bring pads together in a hugging motion. Slowly return to stretched position."
  },
  {
    id: "cable-chest-fly",
    name: "Cable Chest Fly",
    category: "Chest",
    equipment: "Cables",
    correctForm: "Set pulleys around shoulder height. Step forward into split stance. Bring handles together in front of chest while maintaining slight elbow bend. Return slowly."
  },
  {
    id: "low-to-high-cable-fly",
    name: "Low-To-High Cable Fly",
    category: "Chest",
    equipment: "Cables",
    correctForm: "Start with handles near hips. Raise arms upward and inward toward upper chest. Squeeze pecs at top position."
  },
  {
    id: "high-to-low-cable-fly",
    name: "High-To-Low Cable Fly",
    category: "Chest",
    equipment: "Cables",
    correctForm: "Pull handles downward and inward toward lower chest. Maintain chest-up posture and controlled movement."
  },
  {
    id: "single-arm-cable-fly",
    name: "Single-Arm Cable Fly",
    category: "Chest",
    equipment: "Cables",
    correctForm: "Stand sideways to cable. Pull handle across body while resisting torso rotation. Return slowly."
  },
  {
    id: "cable-chest-press",
    name: "Cable Chest Press",
    category: "Chest",
    equipment: "Cables",
    correctForm: "Set handles at chest level. Press forward similarly to a bench press. Keep core braced and shoulders stable."
  },
  {
    id: "push-up",
    name: "Push-Up",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Place hands slightly wider than shoulders. Maintain straight line from head to heels. Lower chest toward floor. Push back up while keeping core tight."
  },
  {
    id: "incline-push-up",
    name: "Incline Push-Up",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Hands on elevated surface. Keep body rigid throughout movement. Lower chest toward support and press back up."
  },
  {
    id: "decline-push-up",
    name: "Decline Push-Up",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Elevate feet and place hands on floor. Lower chest under control. Press upward while maintaining neutral spine."
  },
  {
    id: "diamond-push-up",
    name: "Diamond Push-Up",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Place hands close together beneath chest. Keep elbows close to body. Lower under control and press upward."
  },
  {
    id: "weighted-push-up",
    name: "Weighted Push-Up",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Perform standard push-up with added resistance. Maintain full-body tension throughout."
  },
  {
    id: "dips-chest-focus",
    name: "Dips (Chest Focus)",
    category: "Chest",
    equipment: "Bodyweight",
    correctForm: "Lean torso forward. Allow elbows to flare slightly. Descend until chest stretch is achieved. Press back to starting position."
  },
  {
    id: "assisted-chest-dip",
    name: "Assisted Chest Dip",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Use chest-focused forward lean. Descend under control and press upward while maintaining chest tension."
  },
  {
    id: "smith-machine-bench-press",
    name: "Smith Machine Bench Press",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Set bench under bar path. Lower bar to chest with control. Press upward while maintaining stable shoulder position."
  },
  {
    id: "smith-machine-incline-press",
    name: "Smith Machine Incline Press",
    category: "Chest",
    equipment: "Machine",
    correctForm: "Align bench to bar path. Lower to upper chest. Press upward while keeping chest elevated."
  },
  {
    id: "landmine-press",
    name: "Landmine Press",
    category: "Chest",
    equipment: "Other",
    correctForm: "Hold end of barbell at chest height. Press upward and forward in an arc. Maintain tight core and neutral spine."
  },
  {
    id: "svend-press",
    name: "Svend Press",
    category: "Chest",
    equipment: "Other",
    correctForm: "Press plate firmly between hands. Extend arms forward while maintaining chest contraction. Return slowly."
  },
  {
    id: "plate-press",
    name: "Plate Press",
    category: "Chest",
    equipment: "Other",
    correctForm: "Hold plate against chest. Press forward until arms extend. Maintain inward pressure throughout movement."
  },
  {
    id: "floor-press",
    name: "Floor Press",
    category: "Chest",
    equipment: "Barbell",
    correctForm: "Lie on floor. Lower weight until upper arms contact floor. Press upward while maintaining shoulder stability."
  },
  {
    id: "resistance-band-chest-press",
    name: "Resistance Band Chest Press",
    category: "Chest",
    equipment: "Other",
    correctForm: "Press hands forward while maintaining tension on bands. Return under control."
  },
  {
    id: "resistance-band-fly",
    name: "Resistance Band Fly",
    category: "Chest",
    equipment: "Other",
    correctForm: "Perform fly motion with slight elbow bend. Squeeze chest at peak contraction and return slowly."
  },

  // ==================== BACK ====================
  {
    id: "conventional-deadlift",
    name: "Conventional Deadlift",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Stand with feet hip-width apart and bar over mid-foot. Hinge at hips and bend knees to grip bar. Brace core, keep spine neutral, and pull bar close to body. Stand tall by extending hips and knees together. Lower under control."
  },
  {
    id: "rack-pull",
    name: "Rack Pull",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Set bar on pins just below or above knee level. Brace core and maintain neutral spine. Pull bar upward by driving hips forward. Lower with control."
  },
  {
    id: "romanian-deadlift-back",
    name: "Romanian Deadlift",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Stand tall with slight knee bend. Hinge hips backward while maintaining neutral spine. Lower until hamstrings are stretched. Drive hips forward to return upright."
  },
  {
    id: "sumo-deadlift-back",
    name: "Sumo Deadlift",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Wide stance with toes turned out. Grip bar inside knees. Keep chest up and spine neutral. Push floor away and extend hips to stand tall."
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Use overhand grip slightly wider than shoulders. Hang with straight arms. Pull chest toward bar by driving elbows down. Lower under control to full extension."
  },
  {
    id: "weighted-pull-up",
    name: "Weighted Pull-Up",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Perform standard pull-up with added resistance. Maintain strict form and full range of motion."
  },
  {
    id: "assisted-pull-up",
    name: "Assisted Pull-Up",
    category: "Back",
    equipment: "Machine",
    correctForm: "Use assistance to complete full repetitions. Focus on pulling elbows toward ribs and controlling descent."
  },
  {
    id: "chin-up",
    name: "Chin-Up",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Use underhand grip around shoulder width. Pull chest toward bar while keeping core tight. Lower fully under control."
  },
  {
    id: "neutral-grip-pull-up",
    name: "Neutral-Grip Pull-Up",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Use parallel handles. Pull elbows down and back. Lower slowly to full arm extension."
  },
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    category: "Back",
    equipment: "Machine",
    correctForm: "Adjust thigh pads securely. Pull bar toward upper chest while driving elbows downward. Avoid leaning excessively. Return under control."
  },
  {
    id: "wide-grip-lat-pulldown",
    name: "Wide-Grip Lat Pulldown",
    category: "Back",
    equipment: "Machine",
    correctForm: "Grip wider than shoulders. Pull bar to upper chest while maintaining upright torso. Slowly return."
  },
  {
    id: "close-grip-lat-pulldown",
    name: "Close-Grip Lat Pulldown",
    category: "Back",
    equipment: "Machine",
    correctForm: "Keep chest up. Pull handle toward upper abdomen while squeezing lats. Control eccentric phase."
  },
  {
    id: "single-arm-lat-pulldown",
    name: "Single-Arm Lat Pulldown",
    category: "Back",
    equipment: "Machine",
    correctForm: "Pull elbow toward hip while minimizing torso movement. Fully stretch at top."
  },
  {
    id: "straight-arm-pulldown",
    name: "Straight-Arm Pulldown",
    category: "Back",
    equipment: "Cables",
    correctForm: "Keep arms nearly straight. Pull bar from shoulder height toward thighs using lat contraction. Return slowly."
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Hinge forward with neutral spine. Pull bar toward lower ribs or upper abdomen. Lower under control without rounding back."
  },
  {
    id: "pendlay-row",
    name: "Pendlay Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Start each rep from floor. Keep torso nearly parallel to floor. Pull explosively toward lower chest. Reset between repetitions."
  },
  {
    id: "yates-row",
    name: "Yates Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Use underhand grip and slightly more upright torso. Pull bar toward lower abdomen. Control descent."
  },
  {
    id: "t-bar-row",
    name: "T-Bar Row",
    category: "Back",
    equipment: "Machine",
    correctForm: "Maintain hip hinge and neutral spine. Pull handle toward torso. Squeeze shoulder blades together before lowering."
  },
  {
    id: "chest-supported-t-bar-row",
    name: "Chest-Supported T-Bar Row",
    category: "Back",
    equipment: "Machine",
    correctForm: "Keep chest against pad throughout movement. Pull elbows back and squeeze upper back. Lower slowly."
  },
  {
    id: "seated-cable-row",
    name: "Seated Cable Row",
    category: "Back",
    equipment: "Cables",
    correctForm: "Sit upright with slight knee bend. Pull handle toward torso while retracting shoulder blades. Extend arms under control."
  },
  {
    id: "close-grip-seated-cable-row",
    name: "Close-Grip Seated Cable Row",
    category: "Back",
    equipment: "Cables",
    correctForm: "Pull handle toward lower ribs. Keep chest lifted and avoid excessive leaning."
  },
  {
    id: "wide-grip-cable-row",
    name: "Wide-Grip Cable Row",
    category: "Back",
    equipment: "Cables",
    correctForm: "Pull elbows outward and backward. Emphasize upper-back contraction. Return under control."
  },
  {
    id: "single-arm-cable-row",
    name: "Single-Arm Cable Row",
    category: "Back",
    equipment: "Cables",
    correctForm: "Pull elbow close to body. Rotate minimally. Fully extend arm before next repetition."
  },
  {
    id: "dumbbell-row",
    name: "Dumbbell Row",
    category: "Back",
    equipment: "Dumbbell",
    correctForm: "Support one hand and knee on bench. Pull dumbbell toward hip. Squeeze lat at top and lower slowly."
  },
  {
    id: "kroc-row",
    name: "Kroc Row",
    category: "Back",
    equipment: "Dumbbell",
    correctForm: "Perform high-rep dumbbell rows with controlled body English. Maintain neutral spine throughout."
  },
  {
    id: "chest-supported-dumbbell-row",
    name: "Chest-Supported Dumbbell Row",
    category: "Back",
    equipment: "Dumbbell",
    correctForm: "Lie face down on incline bench. Pull dumbbells toward lower ribs. Lower under control."
  },
  {
    id: "incline-dumbbell-row",
    name: "Incline Dumbbell Row",
    category: "Back",
    equipment: "Dumbbell",
    correctForm: "Keep chest against bench and pull elbows backward. Avoid shrugging shoulders."
  },
  {
    id: "machine-row",
    name: "Machine Row",
    category: "Back",
    equipment: "Machine",
    correctForm: "Adjust seat appropriately. Pull handles toward torso while retracting shoulder blades. Return slowly."
  },
  {
    id: "hammer-strength-row",
    name: "Hammer Strength Row",
    category: "Back",
    equipment: "Machine",
    correctForm: "Pull handles evenly toward body. Pause briefly at peak contraction. Lower under control."
  },
  {
    id: "seal-row",
    name: "Seal Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Lie prone on bench. Pull bar toward underside of bench. Avoid using momentum."
  },
  {
    id: "inverted-row",
    name: "Inverted Row",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Hang underneath support with body straight. Pull chest toward handles or bar. Lower with control."
  },
  {
    id: "trx-row",
    name: "TRX Row",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Lean back with body straight. Pull chest toward handles. Control return phase."
  },
  {
    id: "meadows-row",
    name: "Meadows Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Stand perpendicular to landmine. Pull bar toward hip while maintaining hip hinge. Lower slowly."
  },
  {
    id: "landmine-row",
    name: "Landmine Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Hinge forward and pull attachment toward torso. Keep chest up and core braced."
  },
  {
    id: "smith-machine-row",
    name: "Smith Machine Row",
    category: "Back",
    equipment: "Machine",
    correctForm: "Position body in bent-over row stance. Pull bar toward torso and lower with control."
  },
  {
    id: "reverse-grip-barbell-row",
    name: "Reverse-Grip Barbell Row",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Use underhand grip. Pull bar toward lower abdomen. Maintain neutral spine throughout."
  },
  {
    id: "reverse-pec-deck-back",
    name: "Reverse Pec Deck",
    category: "Back",
    equipment: "Machine",
    correctForm: "Sit facing machine. Pull handles outward until arms align with torso. Squeeze rear delts and upper back."
  },
  {
    id: "face-pull-back",
    name: "Face Pull",
    category: "Back",
    equipment: "Cables",
    correctForm: "Set pulley around face height. Pull rope toward forehead while externally rotating shoulders. Control return."
  },
  {
    id: "band-face-pull-back",
    name: "Band Face Pull",
    category: "Back",
    equipment: "Other",
    correctForm: "Pull band toward face with elbows high. Squeeze rear shoulders and upper back."
  },
  {
    id: "back-extension",
    name: "Back Extension",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Position hips on pad. Lower torso by hinging at hips. Extend until body forms straight line. Avoid hyperextension."
  },
  {
    id: "weighted-back-extension",
    name: "Weighted Back Extension",
    category: "Back",
    equipment: "Weight plate",
    correctForm: "Hold weight against chest while performing controlled back extensions."
  },
  {
    id: "reverse-hyperextension-back",
    name: "Reverse Hyperextension",
    category: "Back",
    equipment: "Machine",
    correctForm: "Lift legs using glutes and lower back while maintaining controlled motion. Avoid swinging."
  },
  {
    id: "good-morning-back",
    name: "Good Morning",
    category: "Back",
    equipment: "Barbell",
    correctForm: "Place bar on upper back. Hinge hips backward while maintaining neutral spine. Return by driving hips forward."
  },
  {
    id: "superman",
    name: "Superman",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Lie face down. Raise arms and legs simultaneously. Hold briefly and lower under control."
  },
  {
    id: "bird-dog-back",
    name: "Bird Dog",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Extend opposite arm and leg while maintaining neutral spine. Pause, then return and alternate sides."
  },
  {
    id: "scapular-pull-up",
    name: "Scapular Pull-Up",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Hang from bar and depress shoulder blades without bending elbows. Return to relaxed hang under control."
  },
  {
    id: "hanging-scapular-retraction",
    name: "Hanging Scapular Retraction",
    category: "Back",
    equipment: "Bodyweight",
    correctForm: "Perform shoulder blade retraction and depression while maintaining straight arms."
  },
  {
    id: "cable-pullover",
    name: "Cable Pullover",
    category: "Back",
    equipment: "Cables",
    correctForm: "Keep slight bend in elbows. Pull attachment from overhead to thighs using lat engagement. Return slowly."
  },
  {
    id: "dumbbell-pullover",
    name: "Dumbbell Pullover",
    category: "Back",
    equipment: "Dumbbell",
    correctForm: "Lie across or along bench. Lower dumbbell behind head with slight elbow bend. Pull back over chest using lats and chest."
  },

  // ==================== SHOULDERS ====================
  {
    id: "barbell-overhead-press",
    name: "Barbell Overhead Press",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Stand with feet shoulder-width apart. Grip bar slightly wider than shoulders. Brace core and glutes. Press bar overhead in a straight path until arms are fully extended. Lower under control to upper chest."
  },
  {
    id: "seated-barbell-overhead-press",
    name: "Seated Barbell Overhead Press",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Sit upright with feet planted. Press bar overhead while maintaining a neutral spine. Lower to upper chest with control."
  },
  {
    id: "dumbbell-shoulder-press",
    name: "Dumbbell Shoulder Press",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Start with dumbbells at shoulder height. Press overhead until arms are extended. Lower under control while maintaining wrist alignment."
  },
  {
    id: "seated-dumbbell-shoulder-press",
    name: "Seated Dumbbell Shoulder Press",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Keep back firmly against bench. Press dumbbells upward without arching lower back. Lower slowly."
  },
  {
    id: "arnold-press",
    name: "Arnold Press",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Start with palms facing body. Rotate wrists outward while pressing overhead. Reverse motion during descent."
  },
  {
    id: "machine-shoulder-press",
    name: "Machine Shoulder Press",
    category: "Shoulders",
    equipment: "Machine",
    correctForm: "Adjust seat so handles start at shoulder level. Press upward smoothly. Return under control without slamming weight stack."
  },
  {
    id: "hammer-strength-shoulder-press",
    name: "Hammer Strength Shoulder Press",
    category: "Shoulders",
    equipment: "Machine",
    correctForm: "Maintain contact with back pad. Press handles overhead through full range of motion. Lower slowly."
  },
  {
    id: "smith-machine-shoulder-press",
    name: "Smith Machine Shoulder Press",
    category: "Shoulders",
    equipment: "Machine",
    correctForm: "Position bar at shoulder level. Press upward while keeping head neutral. Lower under control."
  },
  {
    id: "push-press",
    name: "Push Press",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Start with slight knee dip. Drive through legs and transfer momentum to press bar overhead. Finish with arms locked out."
  },
  {
    id: "single-arm-dumbbell-press",
    name: "Single-Arm Dumbbell Press",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Press one arm overhead while resisting torso lean. Lower with control and repeat on opposite side."
  },
  {
    id: "landmine-press-shoulders",
    name: "Landmine Press",
    category: "Shoulders",
    equipment: "Other",
    correctForm: "Hold end of bar at shoulder height. Press upward and forward in an arc. Maintain tight core throughout."
  },
  {
    id: "single-arm-landmine-press",
    name: "Single-Arm Landmine Press",
    category: "Shoulders",
    equipment: "Other",
    correctForm: "Press bar upward with one arm. Avoid rotating torso. Lower under control."
  },
  {
    id: "dumbbell-lateral-raise",
    name: "Dumbbell Lateral Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Stand tall with slight bend in elbows. Raise arms to shoulder height. Lead with elbows and lower slowly."
  },
  {
    id: "seated-lateral-raise",
    name: "Seated Lateral Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Sit upright and raise dumbbells laterally to shoulder level. Avoid swinging."
  },
  {
    id: "leaning-lateral-raise",
    name: "Leaning Lateral Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Hold stable support and lean slightly away. Raise dumbbell laterally through full range. Lower slowly."
  },
  {
    id: "cable-lateral-raise",
    name: "Cable Lateral Raise",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Set pulley low. Raise arm laterally until shoulder height. Control eccentric phase."
  },
  {
    id: "single-arm-cable-lateral-raise",
    name: "Single-Arm Cable Lateral Raise",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Perform lateral raise one side at a time. Keep torso stable throughout."
  },
  {
    id: "machine-lateral-raise",
    name: "Machine Lateral Raise",
    category: "Shoulders",
    equipment: "Machine",
    correctForm: "Adjust seat so arms align with machine pivots. Raise arms to shoulder level and lower slowly."
  },
  {
    id: "y-raise",
    name: "Y-Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Lie face down on incline bench. Raise arms overhead in a Y shape. Pause briefly before lowering."
  },
  {
    id: "incline-lateral-raise",
    name: "Incline Lateral Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Lie sideways on incline bench. Raise dumbbell laterally with controlled tempo."
  },
  {
    id: "front-raise",
    name: "Front Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Raise dumbbells in front of body to shoulder height. Lower under control without swinging."
  },
  {
    id: "alternating-front-raise",
    name: "Alternating Front Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Raise one arm at a time while maintaining upright posture."
  },
  {
    id: "barbell-front-raise",
    name: "Barbell Front Raise",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Grip bar at shoulder width. Raise to shoulder height and lower slowly."
  },
  {
    id: "plate-front-raise",
    name: "Plate Front Raise",
    category: "Shoulders",
    equipment: "Other",
    correctForm: "Hold plate with both hands. Raise to shoulder level while keeping torso stable."
  },
  {
    id: "cable-front-raise",
    name: "Cable Front Raise",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Raise cable attachment in front of body to shoulder height. Lower with control."
  },
  {
    id: "single-arm-cable-front-raise",
    name: "Single-Arm Cable Front Raise",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Raise one arm forward while resisting trunk rotation."
  },
  {
    id: "rear-delt-fly",
    name: "Rear Delt Fly",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Hinge at hips. Raise arms out to sides with slight elbow bend. Squeeze rear delts at top."
  },
  {
    id: "bent-over-reverse-fly",
    name: "Bent-Over Reverse Fly",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Maintain flat back and bent-over position. Lift arms outward and backward. Lower slowly."
  },
  {
    id: "incline-rear-delt-fly",
    name: "Incline Rear Delt Fly",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Lie face down on incline bench. Raise dumbbells laterally. Focus on rear shoulder contraction."
  },
  {
    id: "cable-rear-delt-fly",
    name: "Cable Rear Delt Fly",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Cross handles and pull outward in reverse fly motion. Control return phase."
  },
  {
    id: "reverse-pec-deck-shoulders",
    name: "Reverse Pec Deck",
    category: "Shoulders",
    equipment: "Machine",
    correctForm: "Sit facing machine. Pull handles outward until arms align with torso. Pause briefly and return slowly."
  },
  {
    id: "face-pull-shoulders",
    name: "Face Pull",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Set pulley at face level. Pull rope toward forehead while externally rotating shoulders. Return under control."
  },
  {
    id: "band-face-pull-shoulders",
    name: "Band Face Pull",
    category: "Shoulders",
    equipment: "Other",
    correctForm: "Pull band toward face with elbows high. Squeeze rear delts and upper back."
  },
  {
    id: "upright-row",
    name: "Upright Row",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Grip slightly narrower than shoulders. Pull weight vertically to upper chest. Keep elbows above wrists."
  },
  {
    id: "dumbbell-upright-row",
    name: "Dumbbell Upright Row",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Pull dumbbells upward close to body. Stop around chest height. Lower slowly."
  },
  {
    id: "cable-upright-row",
    name: "Cable Upright Row",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Pull attachment upward while maintaining neutral wrists. Lower under control."
  },
  {
    id: "high-pull",
    name: "High Pull",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Start with explosive hip drive. Pull bar upward using shoulders and traps. Catch under control or lower directly."
  },
  {
    id: "behind-the-neck-press",
    name: "Behind-the-Neck Press",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Press bar from upper traps to overhead position. Maintain shoulder mobility and controlled movement throughout."
  },
  {
    id: "bradford-press",
    name: "Bradford Press",
    category: "Shoulders",
    equipment: "Barbell",
    correctForm: "Alternate pressing bar from front to behind head without locking out fully. Maintain tension throughout set."
  },
  {
    id: "cuban-press",
    name: "Cuban Press",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Perform upright row, externally rotate shoulders, then press overhead. Reverse movement under control."
  },
  {
    id: "external-rotation",
    name: "External Rotation",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Keep elbow fixed near torso. Rotate forearm outward while maintaining shoulder stability."
  },
  {
    id: "internal-rotation",
    name: "Internal Rotation",
    category: "Shoulders",
    equipment: "Cables",
    correctForm: "Rotate forearm inward against resistance. Maintain controlled movement."
  },
  {
    id: "scaption-raise",
    name: "Scaption Raise",
    category: "Shoulders",
    equipment: "Dumbbell",
    correctForm: "Raise arms in the scapular plane (about 30° forward of side raise). Lift to shoulder height and lower slowly."
  },
  {
    id: "handstand-push-up",
    name: "Handstand Push-Up",
    category: "Shoulders",
    equipment: "Bodyweight",
    correctForm: "Start inverted. Lower head toward floor under control. Press back to lockout while maintaining body alignment."
  },
  {
    id: "pike-push-up",
    name: "Pike Push-Up",
    category: "Shoulders",
    equipment: "Bodyweight",
    correctForm: "Form inverted V position. Lower head toward floor and press upward through shoulders."
  },
  {
    id: "battle-rope-alternating-waves",
    name: "Battle Rope Alternating Waves",
    category: "Shoulders",
    equipment: "Other",
    correctForm: "Create alternating waves using shoulder-driven movement while maintaining stable posture."
  },
  {
    id: "battle-rope-double-waves",
    name: "Battle Rope Double Waves",
    category: "Shoulders",
    equipment: "Other",
    correctForm: "Raise and lower both arms simultaneously to create waves while keeping core engaged."
  },

  // ==================== LEGS ====================
  {
    id: "back-squat",
    name: "Back Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Position bar across upper traps. Stand with feet shoulder-width apart and toes slightly out. Brace core, sit hips back and down, and descend until hips are at least parallel to knees. Drive through mid-foot to stand."
  },
  {
    id: "front-squat",
    name: "Front Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Rest bar across front delts with elbows high. Keep torso upright throughout descent. Lower until thighs are parallel or below, then drive upward."
  },
  {
    id: "high-bar-squat",
    name: "High-Bar Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Place bar high on traps. Maintain upright torso and deep knee bend. Push through whole foot to return to standing."
  },
  {
    id: "low-bar-squat",
    name: "Low-Bar Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Place bar lower across rear delts. Use greater hip hinge while maintaining neutral spine. Drive hips forward to stand."
  },
  {
    id: "goblet-squat",
    name: "Goblet Squat",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Hold weight at chest. Keep elbows close to body. Descend with chest up and knees tracking over toes. Stand by driving through feet."
  },
  {
    id: "zercher-squat",
    name: "Zercher Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Hold bar in elbow creases. Keep torso upright and core braced. Squat to depth and return to standing."
  },
  {
    id: "box-squat-legs",
    name: "Box Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Squat back until lightly touching box. Maintain tension without collapsing. Drive upward explosively."
  },
  {
    id: "paused-squat",
    name: "Paused Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Pause briefly at bottom position before standing. Maintain core tension throughout pause."
  },
  {
    id: "smith-machine-squat",
    name: "Smith Machine Squat",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Position feet slightly forward of bar path. Squat to comfortable depth while maintaining neutral spine. Press upward through heels."
  },
  {
    id: "hack-squat",
    name: "Hack Squat",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Place feet shoulder-width on platform. Lower until knees reach comfortable depth. Push platform away without locking knees aggressively."
  },
  {
    id: "leg-press",
    name: "Leg Press",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Place feet shoulder-width apart. Lower platform until knees reach approximately 90 degrees or slightly deeper. Press upward without lifting hips from seat."
  },
  {
    id: "single-leg-press",
    name: "Single-Leg Press",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Perform press using one leg while keeping pelvis stable. Lower under control and press evenly."
  },
  {
    id: "bulgarian-split-squat",
    name: "Bulgarian Split Squat",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Place rear foot on bench. Lower rear knee toward floor while maintaining upright torso. Push through front foot to stand."
  },
  {
    id: "split-squat",
    name: "Split Squat",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Assume staggered stance. Lower until both knees are bent around 90 degrees. Push through front foot to return."
  },
  {
    id: "walking-lunge",
    name: "Walking Lunge",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Step forward and lower rear knee toward floor. Push through lead foot and continue walking."
  },
  {
    id: "forward-lunge",
    name: "Forward Lunge",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Step forward into lunge position. Maintain upright posture and return to start."
  },
  {
    id: "reverse-lunge-legs",
    name: "Reverse Lunge",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Step backward and lower under control. Push through front foot to return."
  },
  {
    id: "lateral-lunge",
    name: "Lateral Lunge",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Step sideways and sit into working hip. Keep opposite leg straight. Push back to starting position."
  },
  {
    id: "curtsy-lunge-legs",
    name: "Curtsy Lunge",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Step one leg diagonally behind the other. Lower hips while maintaining balance. Return to standing."
  },
  {
    id: "step-up",
    name: "Step-Up",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Place one foot on platform. Drive through elevated foot until standing fully on box. Lower under control."
  },
  {
    id: "weighted-step-up",
    name: "Weighted Step-Up",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Perform step-up while holding resistance. Maintain knee alignment throughout movement."
  },
  {
    id: "pistol-squat",
    name: "Pistol Squat",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Balance on one leg. Lower with control while extending opposite leg forward. Stand without losing balance."
  },
  {
    id: "assisted-pistol-squat",
    name: "Assisted Pistol Squat",
    category: "Legs",
    equipment: "Other",
    correctForm: "Use assistance to maintain balance while performing single-leg squat."
  },
  {
    id: "sissy-squat",
    name: "Sissy Squat",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Allow knees to travel forward while torso leans backward. Maintain tension through quadriceps throughout movement."
  },
  {
    id: "wall-sit",
    name: "Wall Sit",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Slide down wall until knees reach approximately 90 degrees. Hold position while maintaining core engagement."
  },
  {
    id: "leg-extension",
    name: "Leg Extension",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Adjust pad above ankles. Extend knees until legs are straight. Lower slowly under control."
  },
  {
    id: "single-leg-extension",
    name: "Single-Leg Extension",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Perform extension one leg at a time. Maintain full range and controlled tempo."
  },
  {
    id: "nordic-hamstring-curl",
    name: "Nordic Hamstring Curl",
    category: "Legs",
    equipment: "Other",
    correctForm: "Keep body straight from knees to shoulders. Lower slowly toward floor. Use hamstrings to resist descent and assist return."
  },
  {
    id: "lying-leg-curl",
    name: "Lying Leg Curl",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Curl heels toward glutes while keeping hips pressed into pad. Lower under control."
  },
  {
    id: "seated-leg-curl",
    name: "Seated Leg Curl",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Adjust machine so knees align with pivot point. Curl heels downward and backward. Return slowly."
  },
  {
    id: "standing-leg-curl",
    name: "Standing Leg Curl",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Curl working leg toward glutes without arching lower back. Lower slowly."
  },
  {
    id: "single-leg-curl",
    name: "Single-Leg Curl",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Perform hamstring curl one side at a time. Focus on full contraction and controlled lowering."
  },
  {
    id: "romanian-deadlift-legs",
    name: "Romanian Deadlift",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Maintain slight knee bend. Push hips backward while keeping spine neutral. Lower until hamstrings stretch, then drive hips forward."
  },
  {
    id: "stiff-leg-deadlift-legs",
    name: "Stiff-Leg Deadlift",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Keep legs nearly straight. Hinge deeply at hips while maintaining a flat back. Return by extending hips."
  },
  {
    id: "good-morning-legs",
    name: "Good Morning",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Place bar on upper back. Hinge forward at hips while maintaining neutral spine. Return upright by contracting hamstrings and glutes."
  },
  {
    id: "glute-ham-raise",
    name: "Glute-Ham Raise",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Start with knees on pad and feet secured. Lower torso under control and pull body back using hamstrings."
  },
  {
    id: "cable-pull-through-legs",
    name: "Cable Pull-Through",
    category: "Legs",
    equipment: "Cables",
    correctForm: "Face away from machine. Hinge hips backward and then extend forcefully. Keep spine neutral."
  },
  {
    id: "cossack-squat-legs",
    name: "Cossack Squat",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Wide stance. Shift weight to one side while keeping opposite leg extended. Push back to center."
  },
  {
    id: "jefferson-squat",
    name: "Jefferson Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Straddle bar and grip with one hand in front and one behind. Squat while maintaining neutral spine. Stand evenly."
  },
  {
    id: "trap-bar-deadlift-legs",
    name: "Trap Bar Deadlift",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Load trap bar and stand inside frame. Maintain neutral spine. Push through floor and extend hips and knees together."
  },
  {
    id: "jump-squat",
    name: "Jump Squat",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Squat to partial depth and explode upward. Land softly and immediately regain balance."
  },
  {
    id: "box-jump",
    name: "Box Jump",
    category: "Legs",
    equipment: "Other",
    correctForm: "Jump onto box using powerful hip and knee extension. Land softly with knees slightly bent."
  },
  {
    id: "broad-jump",
    name: "Broad Jump",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Swing arms and jump forward explosively. Land softly and absorb force through hips and knees."
  },
  {
    id: "skater-jump",
    name: "Skater Jump",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Jump laterally from one foot to the other. Stabilize each landing before repeating."
  },
  {
    id: "walking-step-lunge",
    name: "Walking Step Lunge",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Perform continuous forward lunges while maintaining upright posture and stable knee tracking."
  },
  {
    id: "belt-squat",
    name: "Belt Squat",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Attach belt around hips. Squat through full range while keeping torso relatively upright."
  },
  {
    id: "single-leg-squat-to-box",
    name: "Single-Leg Squat to Box",
    category: "Legs",
    equipment: "Bodyweight",
    correctForm: "Lower onto box using one leg. Lightly touch and stand back up under control."
  },
  {
    id: "frog-squat",
    name: "Frog Squat",
    category: "Legs",
    equipment: "Dumbbell",
    correctForm: "Hold weight between legs. Use wide stance and deep squat position. Maintain upright chest throughout movement."
  },
  {
    id: "heels-elevated-squat",
    name: "Heels-Elevated Squat",
    category: "Legs",
    equipment: "Barbell",
    correctForm: "Elevate heels to emphasize knee travel and quadriceps involvement. Keep torso upright."
  },
  {
    id: "reverse-hack-squat",
    name: "Reverse Hack Squat",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Face machine pad and squat while maintaining neutral spine. Drive through feet to stand."
  },
  {
    id: "v-squat",
    name: "V-Squat",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Position feet comfortably on platform. Descend under control and press upward through full range."
  },
  {
    id: "pendulum-squat",
    name: "Pendulum Squat",
    category: "Legs",
    equipment: "Machine",
    correctForm: "Maintain full foot contact. Lower deeply while staying braced. Drive upward through mid-foot."
  },
  {
    id: "spanish-squat",
    name: "Spanish Squat",
    category: "Legs",
    equipment: "Other",
    correctForm: "Lean backward into strap support. Squat while keeping torso upright and emphasizing quadriceps."
  },
  {
    id: "terminal-knee-extension",
    name: "Terminal Knee Extension",
    category: "Legs",
    equipment: "Cables",
    correctForm: "Anchor band behind knee. Slightly bend knee then extend fully against resistance."
  },

  // ==================== GLUTES ====================
  {
    id: "barbell-hip-thrust",
    name: "Barbell Hip Thrust",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Rest upper back on bench with bar across hips. Plant feet shoulder-width apart. Drive hips upward until torso is parallel to floor. Squeeze glutes at top and lower under control."
  },
  {
    id: "dumbbell-hip-thrust",
    name: "Dumbbell Hip Thrust",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Place dumbbell across hips. Perform hip thrust while maintaining neutral spine and strong glute contraction."
  },
  {
    id: "single-leg-hip-thrust",
    name: "Single-Leg Hip Thrust",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Keep one foot planted and opposite leg elevated. Drive hips upward through working leg. Lower slowly."
  },
  {
    id: "banded-hip-thrust",
    name: "Banded Hip Thrust",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Place band around knees. Push knees outward throughout the movement while performing hip thrusts."
  },
  {
    id: "glute-bridge",
    name: "Glute Bridge",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Lie on floor with knees bent. Drive hips upward by squeezing glutes. Pause at top and lower slowly."
  },
  {
    id: "weighted-glute-bridge",
    name: "Weighted Glute Bridge",
    category: "Glutes",
    equipment: "Weight plate",
    correctForm: "Perform glute bridge with added resistance while maintaining full hip extension."
  },
  {
    id: "single-leg-glute-bridge",
    name: "Single-Leg Glute Bridge",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Extend one leg and drive hips upward using the planted foot. Maintain pelvis level throughout."
  },
  {
    id: "frog-pump",
    name: "Frog Pump",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Soles of feet together and knees apart. Drive hips upward and squeeze glutes forcefully at top. Lower slowly."
  },
  {
    id: "barbell-glute-bridge",
    name: "Barbell Glute Bridge",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Perform bridge from floor with barbell across hips. Fully extend hips and lower under control."
  },
  {
    id: "cable-glute-kickback",
    name: "Cable Glute Kickback",
    category: "Glutes",
    equipment: "Cables",
    correctForm: "Attach strap to ankle. Extend leg backward using glute contraction without arching lower back."
  },
  {
    id: "single-leg-cable-kickback",
    name: "Single-Leg Cable Kickback",
    category: "Glutes",
    equipment: "Cables",
    correctForm: "Perform kickbacks one side at a time with controlled tempo and full hip extension."
  },
  {
    id: "machine-glute-kickback",
    name: "Machine Glute Kickback",
    category: "Glutes",
    equipment: "Machine",
    correctForm: "Brace torso against pad. Extend leg backward and upward while maintaining pelvic stability."
  },
  {
    id: "donkey-kick",
    name: "Donkey Kick",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Start on hands and knees. Drive heel upward toward ceiling while keeping knee bent. Lower under control."
  },
  {
    id: "quadruped-hip-extension",
    name: "Quadruped Hip Extension",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Extend hip behind body while maintaining neutral spine and stable pelvis."
  },
  {
    id: "fire-hydrant",
    name: "Fire Hydrant",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Raise knee outward to side while keeping hips square to floor. Lower slowly."
  },
  {
    id: "banded-fire-hydrant",
    name: "Banded Fire Hydrant",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Perform fire hydrants against band resistance while maintaining trunk stability."
  },
  {
    id: "banded-lateral-walk",
    name: "Banded Lateral Walk",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Stay in partial squat position. Step sideways while maintaining band tension and neutral knee alignment."
  },
  {
    id: "monster-walk",
    name: "Monster Walk",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Walk forward and backward while maintaining athletic stance and constant band tension."
  },
  {
    id: "standing-hip-abduction",
    name: "Standing Hip Abduction",
    category: "Glutes",
    equipment: "Cables",
    correctForm: "Raise leg laterally away from body. Pause briefly and return under control."
  },
  {
    id: "cable-hip-abduction",
    name: "Cable Hip Abduction",
    category: "Glutes",
    equipment: "Cables",
    correctForm: "Perform controlled outward leg movement while keeping torso upright."
  },
  {
    id: "machine-hip-abduction",
    name: "Machine Hip Abduction",
    category: "Glutes",
    equipment: "Machine",
    correctForm: "Sit upright and push pads outward using glutes. Return slowly."
  },
  {
    id: "side-lying-hip-abduction",
    name: "Side-Lying Hip Abduction",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Lie on side and raise top leg upward. Pause at top before lowering."
  },
  {
    id: "clamshell",
    name: "Clamshell",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Lie on side with knees bent. Open knees while keeping feet together. Lower slowly."
  },
  {
    id: "banded-clamshell",
    name: "Banded Clamshell",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Perform clamshells against band resistance. Maintain stable pelvis throughout."
  },
  {
    id: "bulgarian-split-squat-glutes",
    name: "Bulgarian Split Squat (Glute Focus)",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Use longer stride and slight forward torso lean. Drive through front heel to emphasize glutes."
  },
  {
    id: "reverse-lunge-glutes",
    name: "Reverse Lunge (Glute Focus)",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Take a longer backward step and maintain slight torso lean. Push through front heel to return."
  },
  {
    id: "walking-lunge-glutes",
    name: "Walking Lunge (Glute Focus)",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Use long strides and focus on hip extension from the front leg."
  },
  {
    id: "step-up-glutes",
    name: "Step-Up (Glute Focus)",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Use a higher platform. Drive through heel of working leg and fully extend hip at top."
  },
  {
    id: "single-leg-romanian-deadlift",
    name: "Single-Leg Romanian Deadlift",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Balance on one leg. Hinge at hips while maintaining neutral spine. Return by driving hips forward."
  },
  {
    id: "romanian-deadlift-glutes",
    name: "Romanian Deadlift",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Push hips backward while keeping spine neutral. Return to standing by forcefully extending hips."
  },
  {
    id: "stiff-leg-deadlift-glutes",
    name: "Stiff-Leg Deadlift",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Minimize knee bend and emphasize hip hinge. Drive hips forward to complete each rep."
  },
  {
    id: "sumo-deadlift-glutes",
    name: "Sumo Deadlift",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Wide stance with toes turned out. Push knees outward and extend hips forcefully to stand."
  },
  {
    id: "trap-bar-deadlift-glutes",
    name: "Trap Bar Deadlift",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Stand inside trap bar and drive through feet while extending hips and knees together."
  },
  {
    id: "cable-pull-through-glutes",
    name: "Cable Pull-Through",
    category: "Glutes",
    equipment: "Cables",
    correctForm: "Face away from machine and hinge hips backward. Drive hips forward while squeezing glutes."
  },
  {
    id: "kettlebell-swing",
    name: "Kettlebell Swing",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Hinge at hips and explosively extend hips to swing kettlebell to chest height. Avoid squatting the movement."
  },
  {
    id: "good-morning-glutes",
    name: "Good Morning",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Place bar on upper back. Hinge forward at hips while maintaining neutral spine. Return by extending hips."
  },
  {
    id: "back-extension-glutes",
    name: "Back Extension (Glute Focus)",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Round upper back slightly and focus on driving hips into pad. Squeeze glutes at top."
  },
  {
    id: "reverse-hyperextension-glutes",
    name: "Reverse Hyperextension",
    category: "Glutes",
    equipment: "Machine",
    correctForm: "Raise legs behind body using glute contraction. Lower under control without swinging."
  },
  {
    id: "curtsy-lunge-glutes",
    name: "Curtsy Lunge",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Cross one leg behind the other and lower hips. Push through front heel to stand."
  },
  {
    id: "cossack-squat-glutes",
    name: "Cossack Squat",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Shift weight to one side while keeping opposite leg extended. Push back to center."
  },
  {
    id: "deficit-reverse-lunge",
    name: "Deficit Reverse Lunge",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Stand on elevated surface and step backward. Descend deeply and drive through front heel."
  },
  {
    id: "smith-machine-hip-thrust",
    name: "Smith Machine Hip Thrust",
    category: "Glutes",
    equipment: "Machine",
    correctForm: "Position bench beneath bar. Drive hips upward and squeeze glutes at lockout."
  },
  {
    id: "b-stance-hip-thrust",
    name: "B-Stance Hip Thrust",
    category: "Glutes",
    equipment: "Barbell",
    correctForm: "Use staggered stance with one leg assisting minimally. Drive primarily through front foot."
  },
  {
    id: "b-stance-romanian-deadlift",
    name: "B-Stance Romanian Deadlift",
    category: "Glutes",
    equipment: "Dumbbell",
    correctForm: "Use staggered stance and perform hip hinge emphasizing lead leg."
  },
  {
    id: "frog-bridge",
    name: "Frog Bridge",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Perform glute bridge with soles of feet together and knees apart."
  },
  {
    id: "bench-glute-kickback",
    name: "Bench Glute Kickback",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Support torso on bench and extend leg upward using glute contraction."
  },
  {
    id: "standing-band-kickback",
    name: "Standing Band Kickback",
    category: "Glutes",
    equipment: "Other",
    correctForm: "Anchor band and extend leg backward while maintaining upright posture."
  },
  {
    id: "hip-airplane",
    name: "Hip Airplane",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Balance on one leg and rotate hips open and closed while maintaining control and stability."
  },
  {
    id: "single-leg-box-squat-glutes",
    name: "Single-Leg Box Squat",
    category: "Glutes",
    equipment: "Bodyweight",
    correctForm: "Squat to box using one leg while maintaining knee alignment and hip control."
  },

  // ==================== CALVES ====================
  {
    id: "standing-calf-raise-machine",
    name: "Standing Calf Raise Machine",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Position shoulders under pads and stand on platform with heels hanging off edge. Lower heels fully to stretch calves, then rise onto toes as high as possible. Pause at top and lower slowly."
  },
  {
    id: "seated-calf-raise-machine",
    name: "Seated Calf Raise Machine",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Sit with pads resting on thighs just above knees. Lower heels to stretch calves, then raise heels as high as possible. Control both phases."
  },
  {
    id: "leg-press-calf-raise",
    name: "Leg Press Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Place feet low on platform with only balls of feet in contact. Push through toes to extend ankles. Lower heels deeply for full stretch."
  },
  {
    id: "smith-machine-standing-calf-raise",
    name: "Smith Machine Standing Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Position bar on upper back. Stand on elevated surface with heels off edge. Raise onto toes and lower through full range."
  },
  {
    id: "dumbbell-standing-calf-raise",
    name: "Dumbbell Standing Calf Raise",
    category: "Calves",
    equipment: "Dumbbell",
    correctForm: "Hold dumbbells at sides. Stand on elevated surface and raise heels as high as possible. Lower slowly into deep stretch."
  },
  {
    id: "single-leg-calf-raise",
    name: "Single-Leg Calf Raise",
    category: "Calves",
    equipment: "Dumbbell",
    correctForm: "Perform calf raise on one foot using step or floor. Control descent for full stretch. Pause at top contraction."
  },
  {
    id: "donkey-calf-raise",
    name: "Donkey Calf Raise",
    category: "Calves",
    equipment: "Bodyweight",
    correctForm: "Hinge at hips with torso bent forward. Raise heels as high as possible while keeping knees slightly bent. Lower under control."
  },
  {
    id: "bent-knee-calf-raise",
    name: "Bent-Knee Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Keep knees slightly bent throughout movement to emphasize soleus muscle. Raise and lower heels slowly."
  },
  {
    id: "seated-dumbbell-calf-raise",
    name: "Seated Dumbbell Calf Raise",
    category: "Calves",
    equipment: "Dumbbell",
    correctForm: "Sit with dumbbells placed on thighs. Raise heels off floor and lower under control."
  },
  {
    id: "barbell-seated-calf-raise",
    name: "Barbell Seated Calf Raise",
    category: "Calves",
    equipment: "Barbell",
    correctForm: "Sit with barbell across thighs. Raise heels as high as possible and lower slowly."
  },
  {
    id: "cable-standing-calf-raise",
    name: "Cable Standing Calf Raise",
    category: "Calves",
    equipment: "Cables",
    correctForm: "Stand on platform and use cable resistance to perform calf raises with full ankle extension."
  },
  {
    id: "machine-hack-squat-calf-raise",
    name: "Machine Hack Squat Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Press through toes while maintaining leg extension. Focus on ankle movement only."
  },
  {
    id: "reverse-calf-raise",
    name: "Reverse Calf Raise (Tibialis Raise)",
    category: "Calves",
    equipment: "Bodyweight",
    correctForm: "Stand on heels and lift toes upward. Control movement to strengthen tibialis anterior."
  },
  {
    id: "seated-tibialis-raise",
    name: "Seated Tibialis Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Keep heels on ground and lift toes upward against resistance."
  },
  {
    id: "banded-calf-raise",
    name: "Banded Calf Raise",
    category: "Calves",
    equipment: "Other",
    correctForm: "Stand on band and perform plantar flexion against resistance. Maintain full range of motion."
  },
  {
    id: "banded-tibialis-raise",
    name: "Banded Tibialis Raise",
    category: "Calves",
    equipment: "Other",
    correctForm: "Anchor band and pull toes toward shin against resistance. Move slowly and controlled."
  },
  {
    id: "pogo-jumps",
    name: "Pogo Jumps",
    category: "Calves",
    equipment: "Bodyweight",
    correctForm: "Jump lightly using ankles only with minimal knee bend. Maintain quick, rhythmic contacts with ground."
  },
  {
    id: "jump-rope",
    name: "Jump Rope",
    category: "Calves",
    equipment: "Other",
    correctForm: "Jump using forefoot contact. Keep jumps small and fast while maintaining rhythm."
  },
  {
    id: "seated-calf-raise-single-leg",
    name: "Seated Calf Raise (Single-Leg)",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Perform seated calf raise one leg at a time with full stretch and contraction."
  },
  {
    id: "standing-smith-machine-calf-raise",
    name: "Standing Smith Machine Calf Raise (Toes Elevated)",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Perform calf raise with heels dropped below platform level for deeper stretch."
  },
  {
    id: "isometric-calf-hold",
    name: "Isometric Calf Hold",
    category: "Calves",
    equipment: "Bodyweight",
    correctForm: "Hold peak calf raise position (on toes) for a set duration without movement."
  },
  {
    id: "loaded-stretch-calf-raise",
    name: "Loaded Stretch Calf Raise",
    category: "Calves",
    equipment: "Dumbbell",
    correctForm: "Emphasize deep stretch at bottom position before each controlled raise."
  },
  {
    id: "eccentric-calf-raise",
    name: "Eccentric Calf Raise",
    category: "Calves",
    equipment: "Bodyweight",
    correctForm: "Rise with both feet, lower slowly on one foot to increase eccentric load."
  },
  {
    id: "hopping-calf-raise",
    name: "Hopping Calf Raise",
    category: "Calves",
    equipment: "Bodyweight",
    correctForm: "Perform repeated small explosive calf raises without full heel contact."
  },
  {
    id: "incline-calf-raise",
    name: "Incline Calf Raise",
    category: "Calves",
    equipment: "Other",
    correctForm: "Perform calf raises on incline platform to increase range of motion and stretch."
  },
  {
    id: "single-leg-leg-press-calf-raise",
    name: "Single-Leg Leg Press Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Use one leg and press through toes while controlling ankle range."
  },
  {
    id: "smith-machine-seated-calf-raise",
    name: "Smith Machine Seated Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Sit with barbell across thighs and perform controlled calf raises."
  },
  {
    id: "plate-loaded-standing-calf-raise",
    name: "Plate Loaded Standing Calf Raise",
    category: "Calves",
    equipment: "Machine",
    correctForm: "Use loaded platform and perform full range calf raises with controlled tempo."
  },

  // ==================== BICEPS (ARMS) ====================
  {
    id: "barbell-curl",
    name: "Barbell Curl",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Stand tall with feet shoulder-width apart. Grip bar with palms facing forward. Keep elbows close to torso. Curl bar toward shoulders without swinging. Lower under control."
  },
  {
    id: "ez-bar-curl",
    name: "EZ-Bar Curl",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Use a comfortable angled grip. Keep upper arms stationary and curl bar upward. Squeeze biceps at the top and lower slowly."
  },
  {
    id: "standing-dumbbell-curl",
    name: "Standing Dumbbell Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Hold dumbbells at sides with palms forward. Curl weights toward shoulders while keeping elbows fixed. Lower under control."
  },
  {
    id: "alternating-dumbbell-curl",
    name: "Alternating Dumbbell Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Curl one arm at a time while maintaining stable posture. Fully lower before alternating sides."
  },
  {
    id: "seated-dumbbell-curl",
    name: "Seated Dumbbell Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Sit upright with arms hanging naturally. Curl dumbbells without leaning backward. Lower slowly."
  },
  {
    id: "incline-dumbbell-curl",
    name: "Incline Dumbbell Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Set bench to 45–60 degrees. Let arms hang behind torso. Curl while keeping elbows pointed downward. Lower to full stretch."
  },
  {
    id: "concentration-curl",
    name: "Concentration Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Sit with elbow braced against inner thigh. Curl dumbbell toward shoulder while keeping upper arm fixed. Lower slowly."
  },
  {
    id: "preacher-curl",
    name: "Preacher Curl",
    category: "Arms",
    equipment: "EZ-Bar",
    correctForm: "Rest upper arms on pad. Curl weight upward without lifting elbows from pad. Lower under control."
  },
  {
    id: "ez-bar-preacher-curl",
    name: "EZ-Bar Preacher Curl",
    category: "Arms",
    equipment: "EZ-Bar",
    correctForm: "Keep chest against pad. Curl through full range and lower slowly."
  },
  {
    id: "dumbbell-preacher-curl",
    name: "Dumbbell Preacher Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Perform one arm at a time. Fully extend arm and curl smoothly to peak contraction."
  },
  {
    id: "machine-preacher-curl",
    name: "Machine Preacher Curl",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Adjust seat height so arms rest comfortably on pad. Curl handles upward and lower slowly."
  },
  {
    id: "cable-curl",
    name: "Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Stand upright and keep elbows fixed. Curl bar toward shoulders and return under control."
  },
  {
    id: "standing-cable-curl",
    name: "Standing Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Maintain tension throughout the movement. Avoid leaning backward during the curl."
  },
  {
    id: "single-arm-cable-curl",
    name: "Single-Arm Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Curl one arm at a time while resisting torso rotation. Lower fully between reps."
  },
  {
    id: "bayesian-cable-curl",
    name: "Bayesian Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Face away from cable. Allow arm to start slightly behind torso. Curl forward while keeping elbow stable."
  },
  {
    id: "high-cable-curl",
    name: "High Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Set pulleys above shoulder height. Curl both handles toward head while keeping upper arms parallel to floor."
  },
  {
    id: "behind-the-back-cable-curl",
    name: "Behind-the-Back Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Stand facing away from machine with arm behind body. Curl through full range and lower slowly."
  },
  {
    id: "rope-cable-curl",
    name: "Rope Cable Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Curl rope upward and separate ends at the top. Squeeze biceps before lowering."
  },
  {
    id: "spider-curl",
    name: "Spider Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Lie chest-down on incline bench. Allow arms to hang straight down. Curl weight upward and lower slowly."
  },
  {
    id: "reverse-curl",
    name: "Reverse Curl",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Use overhand grip. Curl weight upward while keeping wrists neutral. Lower under control."
  },
  {
    id: "barbell-reverse-curl",
    name: "Barbell Reverse Curl",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Grip bar overhand at shoulder width. Curl upward and lower without swinging."
  },
  {
    id: "ez-bar-reverse-curl",
    name: "EZ-Bar Reverse Curl",
    category: "Arms",
    equipment: "EZ-Bar",
    correctForm: "Use pronated grip on angled sections. Curl through full range while keeping elbows fixed."
  },
  {
    id: "hammer-curl",
    name: "Hammer Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Hold dumbbells with neutral grip. Curl toward shoulders while keeping palms facing inward. Lower slowly."
  },
  {
    id: "alternating-hammer-curl",
    name: "Alternating Hammer Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Perform hammer curls one arm at a time. Maintain upright posture throughout."
  },
  {
    id: "cross-body-hammer-curl",
    name: "Cross-Body Hammer Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Curl dumbbell across body toward opposite shoulder. Lower under control."
  },
  {
    id: "seated-hammer-curl",
    name: "Seated Hammer Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Sit upright and perform hammer curls without torso movement."
  },
  {
    id: "incline-hammer-curl",
    name: "Incline Hammer Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Allow arms to hang behind body. Curl using neutral grip and lower fully."
  },
  {
    id: "rope-hammer-curl",
    name: "Rope Hammer Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Curl rope upward with neutral grip. Keep elbows close to body and lower slowly."
  },
  {
    id: "drag-curl",
    name: "Drag Curl",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Drag bar upward along torso while pulling elbows backward. Focus on elbow movement rather than shoulder swing."
  },
  {
    id: "zottman-curl",
    name: "Zottman Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Curl with palms up. Rotate palms down at top. Lower under control with overhand grip. Rotate back at bottom."
  },
  {
    id: "scott-curl",
    name: "Scott Curl",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Keep upper arms fixed on pad. Curl smoothly and lower through full range."
  },
  {
    id: "machine-curl",
    name: "Machine Curl",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Adjust seat and arm position correctly. Curl handles upward while keeping shoulders relaxed. Lower slowly."
  },
  {
    id: "single-arm-machine-curl",
    name: "Single-Arm Machine Curl",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Perform one arm at a time. Focus on full extension and contraction."
  },
  {
    id: "standing-resistance-band-curl",
    name: "Standing Resistance Band Curl",
    category: "Arms",
    equipment: "Other",
    correctForm: "Stand on band and grip handles. Curl upward while maintaining tension. Lower slowly."
  },
  {
    id: "seated-resistance-band-curl",
    name: "Seated Resistance Band Curl",
    category: "Arms",
    equipment: "Other",
    correctForm: "Sit securely and anchor band beneath feet. Curl through full range of motion."
  },
  {
    id: "trx-biceps-curl",
    name: "TRX Biceps Curl",
    category: "Arms",
    equipment: "Other",
    correctForm: "Lean backward with arms extended. Curl body toward handles by bending elbows. Extend arms slowly."
  },
  {
    id: "ring-curl",
    name: "Ring Curl",
    category: "Arms",
    equipment: "Other",
    correctForm: "Lean backward and curl body toward rings while maintaining body tension. Lower under control."
  },
  {
    id: "chin-up-biceps",
    name: "Chin-Up (Biceps Emphasis)",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Use underhand grip. Pull chest toward bar while driving elbows downward. Lower fully before next rep."
  },
  {
    id: "close-grip-chin-up",
    name: "Close-Grip Chin-Up",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Use shoulder-width or narrower underhand grip. Maintain strict body position and full range of motion."
  },
  {
    id: "cable-preacher-curl",
    name: "Cable Preacher Curl",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Position preacher bench in front of low pulley. Curl attachment upward while maintaining constant cable tension."
  },
  {
    id: "dumbbell-drag-curl",
    name: "Dumbbell Drag Curl",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Pull elbows backward while sliding dumbbells close to torso. Focus on biceps contraction."
  },
  {
    id: "isometric-curl-hold",
    name: "Isometric Curl Hold",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Hold midpoint of curl under tension for a prescribed duration while maintaining proper posture."
  },

  // ==================== TRICEPS (ARMS) ====================
  {
    id: "close-grip-bench-triceps",
    name: "Close-Grip Bench Press",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Lie on bench with hands just inside shoulder width. Keep elbows close to torso. Lower bar to lower chest or sternum. Press upward while maintaining shoulder stability."
  },
  {
    id: "barbell-skull-crusher",
    name: "Barbell Skull Crusher",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Lie on bench with arms extended. Lower bar toward forehead or behind head by bending elbows. Extend elbows to return to starting position."
  },
  {
    id: "ez-bar-skull-crusher",
    name: "EZ-Bar Skull Crusher",
    category: "Arms",
    equipment: "EZ-Bar",
    correctForm: "Use angled grip for wrist comfort. Keep upper arms mostly stationary. Lower bar under control and extend fully."
  },
  {
    id: "incline-skull-crusher-triceps",
    name: "Incline Skull Crusher",
    category: "Arms",
    equipment: "EZ-Bar",
    correctForm: "Perform skull crusher on an incline to increase stretch. Maintain elbow position throughout movement."
  },
  {
    id: "dumbbell-skull-crusher",
    name: "Dumbbell Skull Crusher",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Lower dumbbells beside head while keeping elbows pointed upward. Extend elbows to return."
  },
  {
    id: "single-arm-dumbbell-skull-crusher",
    name: "Single-Arm Dumbbell Skull Crusher",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Perform one arm at a time. Maintain stable upper arm and full range of motion."
  },
  {
    id: "overhead-dumbbell-triceps-extension",
    name: "Overhead Dumbbell Triceps Extension",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Hold dumbbell overhead with both hands. Lower behind head by bending elbows. Extend arms fully without arching lower back."
  },
  {
    id: "single-arm-overhead-dumbbell-extension",
    name: "Single-Arm Overhead Dumbbell Extension",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Keep elbow pointed upward. Lower weight behind head and extend smoothly."
  },
  {
    id: "seated-overhead-dumbbell-extension",
    name: "Seated Overhead Dumbbell Extension",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Sit upright and maintain core tension. Lower dumbbell behind head and extend elbows fully."
  },
  {
    id: "cable-triceps-pushdown",
    name: "Cable Triceps Pushdown",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Keep elbows tucked to sides. Extend arms until elbows are straight. Return under control without moving shoulders."
  },
  {
    id: "rope-pushdown",
    name: "Rope Pushdown",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Push rope downward and separate ends at bottom. Maintain elbow position throughout."
  },
  {
    id: "reverse-grip-pushdown",
    name: "Reverse-Grip Pushdown",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Use underhand grip. Keep elbows fixed and extend arms fully before returning slowly."
  },
  {
    id: "single-arm-cable-pushdown",
    name: "Single-Arm Cable Pushdown",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Perform one arm at a time. Keep shoulder stable and focus on elbow extension."
  },
  {
    id: "cross-body-cable-extension",
    name: "Cross-Body Cable Extension",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Pull handle diagonally across body while extending elbow. Return slowly."
  },
  {
    id: "overhead-cable-triceps-extension",
    name: "Overhead Cable Triceps Extension",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Face away from machine. Elbows remain near head. Extend arms overhead and return under control."
  },
  {
    id: "single-arm-overhead-cable-extension",
    name: "Single-Arm Overhead Cable Extension",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Extend one arm overhead while keeping elbow stable and close to head."
  },
  {
    id: "bayesian-triceps-extension",
    name: "Bayesian Triceps Extension",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Face away from cable and extend arm while maintaining constant tension through the triceps."
  },
  {
    id: "cable-kickback-triceps",
    name: "Cable Kickback",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Hinge slightly at hips. Keep upper arm parallel to torso and extend elbow fully."
  },
  {
    id: "dumbbell-triceps-kickback",
    name: "Dumbbell Triceps Kickback",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Hinge forward and keep upper arm fixed. Extend elbow until arm is straight. Lower slowly."
  },
  {
    id: "bench-dip",
    name: "Bench Dip",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Place hands on bench behind body. Lower until elbows reach about 90 degrees. Press back to starting position."
  },
  {
    id: "weighted-bench-dip",
    name: "Weighted Bench Dip",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Perform bench dips with added resistance while maintaining controlled depth."
  },
  {
    id: "parallel-bar-dip",
    name: "Parallel Bar Dip",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Maintain more upright torso than chest-focused dips. Lower until upper arms are parallel to floor. Press upward to full elbow extension."
  },
  {
    id: "weighted-dip",
    name: "Weighted Dip",
    category: "Arms",
    equipment: "Other",
    correctForm: "Perform strict dips with added weight. Maintain full range and controlled tempo."
  },
  {
    id: "assisted-dip",
    name: "Assisted Dip",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Use assistance as needed. Focus on elbow extension and stable shoulders."
  },
  {
    id: "diamond-push-up-triceps",
    name: "Diamond Push-Up",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Place hands close together under chest. Lower with elbows tucked and press back up through full range."
  },
  {
    id: "close-grip-push-up",
    name: "Close-Grip Push-Up",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Keep hands slightly narrower than shoulder width. Maintain straight body alignment throughout movement."
  },
  {
    id: "bodyweight-triceps-extension",
    name: "Bodyweight Triceps Extension",
    category: "Arms",
    equipment: "Bodyweight",
    correctForm: "Lean forward and bend elbows to lower head toward hands. Extend elbows to return."
  },
  {
    id: "trx-triceps-extension",
    name: "TRX Triceps Extension",
    category: "Arms",
    equipment: "Other",
    correctForm: "Maintain rigid body position while extending and flexing elbows under control."
  },
  {
    id: "ring-triceps-extension",
    name: "Ring Triceps Extension",
    category: "Arms",
    equipment: "Other",
    correctForm: "Perform bodyweight extension movement while maintaining stable shoulders and core."
  },
  {
    id: "machine-triceps-extension",
    name: "Machine Triceps Extension",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Adjust machine to align elbow joint with pivot. Extend arms fully and lower slowly."
  },
  {
    id: "seated-machine-dip",
    name: "Seated Machine Dip",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Sit upright and press handles downward. Control the return phase."
  },
  {
    id: "hammer-strength-dip-machine",
    name: "Hammer Strength Dip Machine",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Maintain neutral shoulder position. Press handles through full range and lower under control."
  },
  {
    id: "smith-machine-close-grip-bench-press",
    name: "Smith Machine Close-Grip Bench Press",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Use narrow grip and lower bar under control. Press upward while keeping elbows close."
  },
  {
    id: "smith-machine-jm-press",
    name: "Smith Machine JM Press",
    category: "Arms",
    equipment: "Machine",
    correctForm: "Lower bar toward upper chest while allowing slight elbow travel. Press back to start using triceps."
  },
  {
    id: "jm-press",
    name: "JM Press",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Combine elements of skull crushers and close-grip bench press. Lower bar toward upper chest and extend forcefully."
  },
  {
    id: "floor-skull-crusher",
    name: "Floor Skull Crusher",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Lie on floor and perform skull crushers. Floor limits shoulder range and increases stability."
  },
  {
    id: "decline-skull-crusher",
    name: "Decline Skull Crusher",
    category: "Arms",
    equipment: "EZ-Bar",
    correctForm: "Perform extension movement on decline bench to alter resistance profile."
  },
  {
    id: "resistance-band-pushdown-triceps",
    name: "Resistance Band Pushdown",
    category: "Arms",
    equipment: "Other",
    correctForm: "Extend elbows fully against band resistance. Return slowly under control."
  },
  {
    id: "resistance-band-overhead-extension",
    name: "Resistance Band Overhead Extension",
    category: "Arms",
    equipment: "Other",
    correctForm: "Hold band overhead and extend elbows while maintaining stable upper arms."
  },
  {
    id: "band-kickback-triceps",
    name: "Band Kickback",
    category: "Arms",
    equipment: "Other",
    correctForm: "Perform kickback motion with constant band tension. Fully extend elbow each repetition."
  },
  {
    id: "tate-press",
    name: "Tate Press",
    category: "Arms",
    equipment: "Dumbbell",
    correctForm: "Lie on bench with dumbbells over chest. Lower ends of dumbbells toward chest while elbows flare outward. Extend back to start."
  },
  {
    id: "decline-close-grip-bench-press",
    name: "Decline Close-Grip Bench Press",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Secure legs and use narrow grip. Lower bar to lower chest and press upward under control."
  },
  {
    id: "incline-close-grip-bench-press",
    name: "Incline Close-Grip Bench Press",
    category: "Arms",
    equipment: "Barbell",
    correctForm: "Use shoulder-width grip. Lower to upper chest and press upward while keeping elbows relatively tucked."
  },
  {
    id: "single-arm-cable-kickback-triceps",
    name: "Single-Arm Cable Kickback",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Perform strict kickback motion with one arm. Avoid torso rotation."
  },
  {
    id: "isometric-pushdown-hold",
    name: "Isometric Pushdown Hold",
    category: "Arms",
    equipment: "Cables",
    correctForm: "Hold pushdown at full extension for a prescribed duration while maintaining constant triceps tension."
  },

  // ==================== ABS / CORE ====================
  {
    id: "crunch",
    name: "Crunch",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lie on back with knees bent. Curl upper spine off floor by contracting abs. Keep lower back mostly in contact with ground. Lower slowly."
  },
  {
    id: "sit-up",
    name: "Sit-Up",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lie on back with knees bent. Sit fully up by flexing spine and hips. Lower under control without collapsing."
  },
  {
    id: "weighted-sit-up",
    name: "Weighted Sit-Up",
    category: "Core",
    equipment: "Dumbbell",
    correctForm: "Hold weight at chest or overhead. Perform full sit-up while maintaining control through descent."
  },
  {
    id: "decline-sit-up",
    name: "Decline Sit-Up",
    category: "Core",
    equipment: "Other",
    correctForm: "Anchor feet and perform sit-up on decline. Control both upward and downward phases."
  },
  {
    id: "decline-crunch",
    name: "Decline Crunch",
    category: "Core",
    equipment: "Other",
    correctForm: "Perform shortened range crunch focusing on spinal flexion rather than full sit-up."
  },
  {
    id: "reverse-crunch",
    name: "Reverse Crunch",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lie on back. Bring knees toward chest and lift hips off floor by curling pelvis upward. Lower slowly."
  },
  {
    id: "hanging-knee-raise",
    name: "Hanging Knee Raise",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hang with straight arms. Raise knees toward chest while avoiding swinging. Lower under control."
  },
  {
    id: "hanging-leg-raise",
    name: "Hanging Leg Raise",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Raise straight legs upward using core. Control descent without swinging."
  },
  {
    id: "toes-to-bar",
    name: "Toes-to-Bar",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "From hanging position, raise feet to touch bar overhead using core and hip flexors. Lower slowly."
  },
  {
    id: "captains-chair-knee-raise",
    name: "Captain’s Chair Knee Raise",
    category: "Core",
    equipment: "Other",
    correctForm: "Raise knees upward while stabilizing torso against pads. Control lowering phase."
  },
  {
    id: "captains-chair-leg-raise",
    name: "Captain’s Chair Leg Raise",
    category: "Core",
    equipment: "Other",
    correctForm: "Raise straight legs upward while minimizing swing. Lower slowly."
  },
  {
    id: "lying-leg-raise",
    name: "Lying Leg Raise",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lie flat and raise legs to 90 degrees or higher while keeping lower back controlled."
  },
  {
    id: "flutter-kicks",
    name: "Flutter Kicks",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lie on back and alternate small rapid leg kicks while keeping core braced."
  },
  {
    id: "scissor-kicks",
    name: "Scissor Kicks",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Alternate crossing legs over each other while keeping lower back pressed down."
  },
  {
    id: "dead-bug",
    name: "Dead Bug",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lie on back with arms and legs up. Extend opposite arm and leg while keeping core stable."
  },
  {
    id: "bicycle-crunch",
    name: "Bicycle Crunch",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Alternate elbow to opposite knee in controlled twisting motion. Keep core engaged throughout."
  },
  {
    id: "oblique-crunch",
    name: "Oblique Crunch",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lift shoulder toward hip focusing on side abs. Lower under control."
  },
  {
    id: "cable-crunch",
    name: "Cable Crunch",
    category: "Core",
    equipment: "Cables",
    correctForm: "Attach rope overhead. Crunch downward by flexing spine while keeping hips stable."
  },
  {
    id: "kneeling-cable-crunch",
    name: "Kneeling Cable Crunch",
    category: "Core",
    equipment: "Cables",
    correctForm: "From kneeling position, curl torso downward against resistance. Avoid hip movement."
  },
  {
    id: "standing-cable-crunch",
    name: "Standing Cable Crunch",
    category: "Core",
    equipment: "Cables",
    correctForm: "Perform crunch in standing position by flexing spine downward."
  },
  {
    id: "ab-wheel-rollout",
    name: "Ab Wheel Rollout",
    category: "Core",
    equipment: "Other",
    correctForm: "From kneeling position, roll wheel forward while maintaining neutral spine. Pull back using core."
  },
  {
    id: "kneeling-ab-rollout",
    name: "Kneeling Ab Rollout",
    category: "Core",
    equipment: "Other",
    correctForm: "Extend body forward while resisting lower back arch. Return using abdominal contraction."
  },
  {
    id: "barbell-rollout",
    name: "Barbell Rollout",
    category: "Core",
    equipment: "Barbell",
    correctForm: "Roll bar forward while maintaining tight core. Avoid hip sag."
  },
  {
    id: "stability-ball-rollout",
    name: "Stability Ball Rollout",
    category: "Core",
    equipment: "Other",
    correctForm: "Place forearms on ball and roll forward while maintaining plank alignment."
  },
  {
    id: "plank",
    name: "Plank",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hold body in straight line from head to heels. Engage core and glutes. Avoid hip sag."
  },
  {
    id: "forearm-plank",
    name: "Forearm Plank",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Same as plank with forearms on ground. Maintain neutral spine and steady breathing."
  },
  {
    id: "side-plank",
    name: "Side Plank",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hold body sideways on one forearm. Keep hips elevated and body straight."
  },
  {
    id: "side-plank-hip-dips",
    name: "Side Plank Hip Dips",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lower hips toward floor and raise back to neutral side plank position."
  },
  {
    id: "plank-shoulder-tap",
    name: "Plank Shoulder Tap",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "In plank position, alternate tapping shoulders while minimizing hip movement."
  },
  {
    id: "plank-leg-lift",
    name: "Plank Leg Lift",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Raise one leg while holding plank position. Maintain stability throughout."
  },
  {
    id: "mountain-climber",
    name: "Mountain Climber",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "In plank position, alternate driving knees toward chest in controlled motion."
  },
  {
    id: "slow-mountain-climber",
    name: "Slow Mountain Climber",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Perform mountain climber slowly with full core engagement and minimal momentum."
  },
  {
    id: "weighted-plank",
    name: "Weighted Plank",
    category: "Core",
    equipment: "Weight plate",
    correctForm: "Hold plank position with added resistance on back."
  },
  {
    id: "rkc-plank",
    name: "RKC Plank",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Maximum tension plank variation with strong glute and core contraction."
  },
  {
    id: "swiss-ball-crunch",
    name: "Swiss Ball Crunch",
    category: "Core",
    equipment: "Other",
    correctForm: "Sit on ball and roll back. Perform crunch while maintaining balance and control."
  },
  {
    id: "swiss-ball-jackknife",
    name: "Swiss Ball Jackknife",
    category: "Core",
    equipment: "Other",
    correctForm: "From plank position with feet on ball, pull knees toward chest."
  },
  {
    id: "swiss-ball-rollout",
    name: "Swiss Ball Rollout",
    category: "Core",
    equipment: "Other",
    correctForm: "Roll forward on ball while maintaining plank alignment."
  },
  {
    id: "russian-twist",
    name: "Russian Twist",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Sit with torso leaned back. Rotate torso side to side with controlled movement."
  },
  {
    id: "weighted-russian-twist",
    name: "Weighted Russian Twist",
    category: "Core",
    equipment: "Dumbbell",
    correctForm: "Rotate weight side to side while maintaining core tension."
  },
  {
    id: "cable-woodchop",
    name: "Cable Woodchop",
    category: "Core",
    equipment: "Cables",
    correctForm: "Pull cable diagonally across body from high to low."
  },
  {
    id: "high-to-low-woodchop",
    name: "High-to-Low Woodchop",
    category: "Core",
    equipment: "Cables",
    correctForm: "Start high and rotate downward across body."
  },
  {
    id: "low-to-high-woodchop",
    name: "Low-to-High Woodchop",
    category: "Core",
    equipment: "Cables",
    correctForm: "Start low and rotate upward across body."
  },
  {
    id: "medicine-ball-slam",
    name: "Medicine Ball Slam",
    category: "Core",
    equipment: "Other",
    correctForm: "Raise ball overhead and slam into ground using full core engagement."
  },
  {
    id: "medicine-ball-throw",
    name: "Medicine Ball Throw",
    category: "Core",
    equipment: "Other",
    correctForm: "Explosively throw ball using trunk rotation and core power."
  },
  {
    id: "anti-rotation-press",
    name: "Anti-Rotation Press (Pallof Press)",
    category: "Core",
    equipment: "Cables",
    correctForm: "Press handle forward while resisting torso rotation."
  },
  {
    id: "banded-pallof-press",
    name: "Banded Pallof Press",
    category: "Core",
    equipment: "Other",
    correctForm: "Resist rotational pull while holding extended arm position."
  },
  {
    id: "hollow-body-hold",
    name: "Hollow Body Hold",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hold supine position with lower back pressed into floor and limbs extended."
  },
  {
    id: "hollow-body-rock",
    name: "Hollow Body Rock",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Rock body while maintaining hollow position tension."
  },
  {
    id: "dragon-flag",
    name: "Dragon Flag",
    category: "Core",
    equipment: "Other",
    correctForm: "Lower body slowly from vertical position while maintaining rigid torso."
  },
  {
    id: "windshield-wipers",
    name: "Windshield Wipers",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Rotate legs side to side while maintaining core tension."
  },
  {
    id: "l-sit",
    name: "L-Sit",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hold legs extended forward while supporting body with arms."
  },
  {
    id: "tuck-l-sit",
    name: "Tuck L-Sit",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Modified L-sit with knees bent toward chest."
  },
  {
    id: "ab-crunch-machine",
    name: "Ab Crunch Machine",
    category: "Core",
    equipment: "Machine",
    correctForm: "Sit and flex torso against resistance. Return slowly."
  },
  {
    id: "seated-knee-tuck",
    name: "Seated Knee Tuck",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Lean back and pull knees toward chest in controlled motion."
  },
  {
    id: "toe-touch-crunch",
    name: "Toe Touch Crunch",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Raise legs and reach hands toward toes using abdominal contraction."
  },
  {
    id: "crunch-hold",
    name: "Crunch Hold",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hold top crunch position under tension for time."
  },
  {
    id: "isometric-side-bend-hold",
    name: "Isometric Side Bend Hold",
    category: "Core",
    equipment: "Dumbbell",
    correctForm: "Hold bent side position under resistance to engage obliques."
  },
  {
    id: "bird-dog",
    name: "Bird Dog",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Extend opposite arm and leg while maintaining neutral spine and core stability."
  },
  {
    id: "suitcase-carry",
    name: "Suitcase Carry",
    category: "Core",
    equipment: "Dumbbell",
    correctForm: "Walk while holding weight on one side to resist lateral flexion."
  },
  {
    id: "farmer-carry",
    name: "Farmer’s Carry",
    category: "Core",
    equipment: "Dumbbell",
    correctForm: "Walk with weights in both hands while maintaining upright posture."
  },
  {
    id: "overhead-carry",
    name: "Overhead Carry",
    category: "Core",
    equipment: "Barbell",
    correctForm: "Walk while holding weight overhead with stable core and spine."
  },
  {
    id: "dead-hang",
    name: "Dead Hang",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hang passively or actively while maintaining shoulder engagement and core control."
  },
  {
    id: "scapular-dead-hang",
    name: "Scapular Dead Hang",
    category: "Core",
    equipment: "Bodyweight",
    correctForm: "Hang and engage shoulders without bending elbows, maintaining core stability."
  },
  {
    id: "treadmill-steady-state-jog",
    name: "Treadmill Steady-State Jog",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Position yourself centrally on the treadmill belt before initiating movement.\n2. Apply the emergency safety clip to your clothing.\n3. Calibrate the speed and incline to a baseline aerobic threshold (e.g., 1.0% incline to simulate outdoor resistance).",
    formMechanics: "• Maintain an upright posture with the chest elevated and gaze fixed strictly forward.\n• Ensure foot strikes are mid-foot to forefoot, preserving biomechanical efficiency.\n• Synchronise arm action dynamically opposite to the leg stride, minimising lateral rotation.",
    coachTip: "Keep your cadence high and foot-ground contact time minimal to preserve joint integrity.",
    primaryTarget: "Aerobic Capacity",
    secondaryTarget: ["Quadriceps", "Calves", "Core Stabilisers", "Metabolic Rate"],
    metValue: 7.0
  },
  {
    id: "stationary-bike-sprint-intervals",
    name: "Stationary Bike Sprint Intervals",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Adjust the saddle height so the knee maintains a 5-10 degree physiological flexion at the bottom of the pedal stroke.\n2. Secure the fore-and-aft saddle position ensuring the patella aligns with the pedal spindle horizontally.\n3. Modify the handlebar height to naturally support a neutral spine when leaning forward.",
    formMechanics: "• Maintain a braced core throughout maximal sprint phases, mitigating excess thoracic rocking.\n• Drive power downward through the metatarsals whilst actively pulling up during the recovery stroke.\n• Keep elbows slightly flexed to absorb upper body tension and reduce cervical spine stress.",
    coachTip: "Drive through the pedals smoothly but aggressively; do not let your hips bounce out of the saddle.",
    primaryTarget: "Anaerobic Power",
    secondaryTarget: ["Gluteus Maximus", "Quadriceps Femoris", "Hip Flexors"],
    metValue: 12.0
  },
  {
    id: "rowing-machine-steady-state",
    name: "Rowing Machine Low-Rate Steady State",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Secure feet within the foot stretchers, positioning the strap directly over the widest joint of the foot.\n2. Select a drag factor (damper setting) between 3 and 5 to simulate authentic water resistance.\n3. Grip the handle firmly but relax your wrists and fingers to prevent forearm fatigue.",
    formMechanics: "• Initiate the drive phase strictly from the legs, pressing forcefully against the stretchers.\n• Pivot via the hips once the legs approach lockout, followed by a fluid arm pull to the sternum.\n• Release the arms first during recovery, pivot forward, and finally permit the knees to bend.",
    coachTip: "Rowing is a pushing movement, not a pulling movement. Explode with the legs to generate power.",
    primaryTarget: "Cardiovascular Endurance",
    secondaryTarget: ["Latissimus Dorsi", "Rhomboids", "Posterior Chain", "Erector Spinae"],
    metValue: 8.5
  },
  {
    id: "stair-climber-endurance",
    name: "Stair Climber Endurance Protocol",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Position your feet squarely on the centre of the steps, achieving full plantar contact.\n2. Calibrate the stepping rate to maintain a sustained, cyclic rhythm without breaking form.\n3. Lightly rest your hands on the support rails strictly for balance, avoiding weight transfer.",
    formMechanics: "• Keep an upright posture, actively resisting the urge to collapse the torso over the console.\n• Activate the gluteal fibres by pressing firmly through the heel during step ascension.\n• Keep the core stabilisers engaged to prevent excessive lateral hip shifting.",
    coachTip: "Do not bear your mass on the handrails; make your legs carry your entire body weight.",
    primaryTarget: "Aerobic Capacity",
    secondaryTarget: ["Gluteus Medius", "Calves", "Quadriceps", "Core Stabilisers"],
    metValue: 9.0
  },
  {
    id: "elliptical-cross-trainer",
    name: "Elliptical Cross-Trainer Steady State",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Mount the foot pedals and grasp the articulated handles, establishing a stable base.\n2. Program the resistance and cross-ramp inclination to target specific lower limb muscle groups.\n3. Ensure the selected resistance permits a fluid, non-staggered concentric rhythm.",
    formMechanics: "• Maintain constant structural alignment of the knee over the toes during the forward glide.\n• Actively push and pull the dual-action handles to recruit superior muscular fibres in the upper back.\n• Engage the abdominal wall to lock the pelvis in a neutral position throughout the kinetic cycle.",
    coachTip: "Utilise continuous momentum. Avoid letting the machine dictate your pace; you must drive the resistance.",
    primaryTarget: "Global Cardiovascular Stamina",
    secondaryTarget: ["Hamstrings", "Anterior Deltoids", "Pectorals", "Calves"],
    metValue: 6.5
  },
  {
    id: "treadmill-incline-walking",
    name: "Treadmill Incline Walking",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Elevate the treadmill gradient to between 10% and 15% to heavily emphasise the posterior chain.\n2. Adjust the belt speed to a brisk but highly controlled walking cadence (e.g., 3.0–3.5 mph).\n3. Relinquish grip on the handrails to mandate full activation of the spinal stabilisers.",
    formMechanics: "• Strides must be robust and intentional, striking firmly from the heel and rolling to the toe.\n• Emphasise maximal hip extension at the terminal phase of the stride to isolate the glutes.\n• Keep the thoracic spine extended, breathing methodically to optimise oxygen intake.",
    coachTip: "Resist the temptation to hold the display panel; swinging your arms is paramount for metabolic yield.",
    primaryTarget: "Muscular Endurance",
    secondaryTarget: ["Gluteus Maximus", "Soleus", "Gastrocnemius", "Core Stabilisers"],
    metValue: 8.0
  },
  {
    id: "assault-air-bike",
    name: "Assault Air Bike Maximal Sprints",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Configure the saddle height so there is only minimal flexion at the terminal pedal stroke.\n2. Adjust the seat longitudinally so that the arms can achieve optimal extension upon the push levers.\n3. Grasp the handles neutrally, wrapping the thumbs to firmly anchor the upper extremities.",
    formMechanics: "• Drive symbiotically with the upper and lower kinetic chains; push/pull the handles whilst simultaneously pedalling.\n• Maintain a rigidly braced core to optimally transfer mechanical force across the torso matrix.\n• Keep the cervical spine neutral, focusing visual gaze steadily straight ahead.",
    coachTip: "Total body commitment is required. Do not let your arms idle whilst your legs do all the mechanical work.",
    primaryTarget: "Anaerobic Power / V02 Max",
    secondaryTarget: ["Triceps Brachii", "Latissimus Dorsi", "Quadriceps", "Metabolic Rate"],
    metValue: 14.0
  },
  {
    id: "skierg-powerful-pulls",
    name: "Ergometer (SkiErg) Powerful Pulls",
    category: "Cardio",
    equipment: "Machine",
    setupInstructions: "1. Stand directly facing the ergometer, positioning feet shoulder-width apart to form a stable support base.\n2. Grasp the handles securely, elevating your hands slightly above head height with a micro-bend in the elbows.\n3. Ensure you are distanced correctly from the chassis so the cables clear your body seamlessly on the downward trajectory.",
    formMechanics: "• Hinge aggressively at the hips, utilising body mass and abdominal flexion to propel the handles downwards.\n• Drive the handles down past the thighs, extending the triceps decisively at the bottom of the stroke.\n• Return to the starting alignment in a fluid, controlled ascent, raising onto the metatarsals for maximal reach.",
    coachTip: "Engage your core as a primary driver. Treat it as a dynamic, explosive standing crunch.",
    primaryTarget: "Upper Body Anaerobic Conditioning",
    secondaryTarget: ["Latissimus Dorsi", "Triceps Brachii", "Core Stabilisers", "Erector Spinae"],
    metValue: 11.0
  }
];

