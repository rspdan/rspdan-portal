# Bee · Director Pass3 play

I made **“Oh hi, too much”** through the actual local Director controls: a relaxed start, a small raised-arm hello, an overeager single-arm stretch, then an embarrassed slump. This was a new four-key scene, not one of the supplied sample motions. I played it, changed its outgoing holds/easing, tried Ouch and Trip, changed camera and backdrop, retimed a Trip version, and saved/reopened the variants locally.

Dan’s source timestamp is **DPS112426 7:16pm**. Execution happened on the separately recorded UTC clock; those dates are not substituted for each other. The session began against portal baseline7bd0e7c in a fresh local Chromium desktop context. [The event log](play-events.json) records actual UI actions; [the review JSON](play-review.json) pins screenshots, take documents, saves and limits. No credentials are included.

## What the toy taught me

The elbow dot’s hold-and-drag felt immediately useful. I held it for450ms and moved it right/up, making [a reach that overshot the camera](05-overeager-stretch-unframed.png). [Frame brought the whole actor back](06-overeager-stretch-framed.png). This is the kind of distortion that makes the figure act; it did not need a newly designed anatomical hand or a rewritten character model.

Recovery worked: Undo first reversed framing, then reversed the stretch, and Redo restored the stretch. The friction is remembering which kind of edit comes next when the interface only says “Undone” and shows counts. **Named Undo/Redo actions would help.** Whole-motion framing also belongs near the stage Frame control; I had to open Timing → Try a motion to find it for my own keyed scene.

A10-degree head rotation added much less than the arm/torso silhouette in this faceless browser rendering. The [small greeting held through41](15-trip-held-hello.png), then [42 jumped into the overreach](16-trip-snap-reach.png). I gave that hold a comic purpose and used ease-out for the following slump. I also pressed Play and stopped it, capturing [a moving view](10-ouch-playback.png). That screenshot and its later snapshot are not frame-atomic during looping; they must not become a false numerical mismatch.

Trip’s white silhouette [loses contrast against white](12-trip-white-room.png) and [becomes clear on green](13-trip-green-room.png). A neutral gray working backdrop would be more comfortable than a compositing green for this task. Halp independently found the same contrast issue with a different Trip wobble. The side camera [overlaps the raised arms](14-trip-side.png); returning to¾ restores their separation. Camera and background are active parts of directing.

The Trip button also emitted **“Same character, white clay.”** That wording is wrong for Crew identity: shared construction does not make Ouch and Trip the same Character. “Trip selected” would be enough. This finding was sent to C.B.; Bee did not change the implementation.

## Saved play

The original keys are1/20/42/72. Frame20 holds until42;42 eases out into72. I made three unique local saves, each explicitly returning `shared:false`: Ouch square at3s/24fps, Trip portrait at3s/24fps, and a slower Trip portrait at4.5s/12fps. The retimed keys are1/15/32/54. Clicking the saved-take entries [reopened Ouch](21-ouch-reopened.png) and [the slower Trip](22-trip-reopened.png), restoring their visible looks, framing, timing and keys.

This was local desktop mouse/keyboard play, not physical ACHE testing. The native model and portal implementation were not edited. No live Save/Send or message to Crew was made. The browser’s rough material remains an approximation of native clay. C.B.’s independently found unkeyed-pose-loss bug and its fix are not reproduced or verified here; I keyed before moving the timeline. These observations describe this authored scene and its recovery, not arbitrary animation/collision guarantees or Dan’s acceptance.

## Subsequent Director correction

Dan directs us to improve Trip’s visibility using techniques in Dan’s existing Trip artwork, rather than changing the background. The gray-room suggestion above is historical play feedback and is superseded as a solution. Bee is moving to actual Trip-source study and DTAD teachback while C.B. handles MorningLearn; no rendering or model change is implied by the play report.
