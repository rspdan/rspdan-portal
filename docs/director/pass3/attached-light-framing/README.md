# Frame attached light effects

Pose Mode's Frame action now measures the visible character together with enabled light-effect geometry attached to the head or hands. Frame Motion uses the same measurement while sampling the keyed poses. World-attached lights, unrelated set pieces, disabled effects and editor markers are excluded from character framing.

The focused local Chromium probe passed 11 checks with zero page errors across desktop and a 390 by 844 mobile viewport. An offset hand ball and an upward beam both remained inside the frame, the current pose was preserved, a distant world light did not change the character frame, and all four keys of the motion study contained their attached effect geometry after Frame Motion.

[Receiving data](receiving.json) records projected mesh vertices and canvas dimensions. [The harness](receiving.py) drives real control handlers programmatically to isolate framing geometry; it does not establish physical touch accessibility or ACHE performance. The retained initial attempt selected a control inside collapsed details and timed out before that scenario ran. The corrected geometry probe dispatches the control change event directly. No save or Crew send was used.
