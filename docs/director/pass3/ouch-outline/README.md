# Ouch outline tones · runtime study

Four actual Director captures use the same raised-arm pose, fixed camera, black Ouch material and baseline lights. Outline width is **0.0025** throughout. The first three keep the existing white room: [black](black-white-room.png), [gray](gray-white-room.png), and [white](white-white-room.png). Camera difference is zero; pose differences are only quaternion rounding, at most 2.22×10⁻¹⁶.

I inspected all four rendered images. Black makes the boundary crisp while keeping Ouch's shaded body. Gray draws a brighter, more noticeable edge around the dark shape. White largely merges into the white room and reads as a narrow light border rather than a dark contour. These are silhouette treatments; they do not create new internal anatomical lines.

[White in a dark room](white-dark-room-context.png) is a separate context demonstration: only the runtime backdrop and floor colors change, while pose, camera, lights and Ouch remain the same. The white contour clearly separates the silhouette there. This is neither a production stage feature nor a proposed background fix for Trip.

[Trial receipt](trial.json) records colors, lights, character settings, image hashes and source identity. No production source or asset edits were made. These are desktop canvas captures, not phone acceptance tests; small pieces of the surrounding stage controls remain visible at their edges.
