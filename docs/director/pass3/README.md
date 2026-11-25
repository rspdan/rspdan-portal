# Director · Pass 3 through play

**Current implementation:** see [Pose, Lighting, Stage and connected controls](current-update.md). The notes below preserve the initial play sessions and early rendering experiments; their then-current deployment and open-work statements are historical. Later module and integration receipts cover the expanded update.

Dan asked C.B., Bee and Halp to each play with Director as a toy and learn through making, then paused further ODK work for the HCUS Morning Learn. His source stamp was corrected from **DPS 112427 7:16pm** to **DPS 112426 7:16pm**. Browser work occurred on November 25 UTC; these are separate clocks.

## Three actual authored sessions

- [C.B. · I meant to do that](cb/README.md): touch interaction at 390 × 844, outward arm gesture, overreach and defeat. Moving away from an unkeyed pose revealed an edit that Undo could not recover.
- [Bee · Oh hi, too much](bee/play-review.md): greeting, an exaggerated reach and a slump, with hold/ease choices and two timing versions. Framing and meaningful silhouette changes mattered more than subtle head rotation.
- [Halp · Trip’s little wobble](halp/play-report.md): alternating torso gestures, deliberate over-edit, recovery and a saved/reopened motion.

These were local development saves. No live Crew message was sent. Mobile browser emulation is not physical ACHE receiving. Each linked report retains its screenshots and observations.

## Recovery correction

The working-tree change to `public/director/director.js` preserves an authored unkeyed pose in Undo before manual timeline navigation or playback consumes it. It does not silently key the pose or add history on every playback tick. The status message now explains where that pose went.

The reproduction and adjacent cases passed [41 focused checks](../receiving/unkeyed-recovery.json) and [28 independent checks](review/unkeyed-pose-recovery.json). The 27 existing animation/server/auth tests and production build also passed. These results validate the tested recovery paths; they do not imply every possible directing action has been exercised. This change has not been deployed in this pass.

## The lesson changed the next experiment

Dan selected IBM Technology’s [Vibe Coding vs. Agentic Coding: Which Should You Use?](https://youtu.be/h4tHDFCPmQE). C.B. read all 74 returned timed transcript segments and viewed five stills supplied by Dan; video/audio playback was not received. The private HCUS record retains retrieval provenance and fuller notes. Dan’s own connection is that Grace makes clear what we have already been learning by doing: focused tasks, actual use, intent validation and recoverability.

Dan also pointed to key and rim lighting as a way to separate black from black, applicable across colors. His Trip correction supplied the artistic reference: lines provide separation where needed, while the scene determines defined outlines versus implied boundaries. RepoWise helped Halp navigate the art catalogue and locate original scans; viewing the actual artwork established the visual evidence.

The [Trip rendering study](trip-contour/) keeps the white room, character, pose and camera fixed while comparing contour, lighting and both. These are runtime-only experiments, not installed looks. The brighter key/fill/rim comparison restores a white reading and rounded volume; a fine contour strengthens the pale silhouette. The same lighting gives Ouch more visible volume without changing his black material. A uniform silhouette outline still fails to articulate the forearm/head overlap and does not implement Dan’s full scene-dependent boundary treatment. The pose called `holding-phone` in early filenames contains no phone prop; it tests an arm/head overlap only.

## Work still open

The rendering comparison needs a selective treatment of interior overlaps, plus motion review for temporal stability, before it can serve as a finished Trip treatment. Scene lighting and line choices would also need to survive save/reopen if made into Director controls. Existing runtime screenshots do not establish either property. The recovery patch is tested but remains separate from these rendering experiments; the previous live deployment is unchanged.
