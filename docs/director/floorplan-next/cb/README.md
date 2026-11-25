# C.B. · Phone layout receiving

C.B. used the actual local Director in Chromium touch emulation at 390 × 844, imported the four-level receiving fixture, selected its doorway through a touch coordinate, opened its width field, returned to the plan, and viewed Building plus its floor cards. This is an invented tool fixture.

The first visual pass showed that the existing sticky page canvas could cover the inspector fields and leave its new tabs out of sight. The next layout gives the drawing and inspector separate areas within the phone workspace. The inspector scrolls independently, its tabs remain available, and Return to plan resets that pane and focuses the drawing without resetting pan/zoom.

The repeated pass kept all four level cards, did not change the source plan by viewing Building, and produced no horizontal page overflow. C.B. personally viewed [selected opening fields](phone-selected.png), [Return to plan](phone-plan.png), [Building levels](phone-building.png), and [floor cards](phone-floorcards.png). The common fields and drawing now remain simultaneously visible. Long level text in the plan's scale label was sent to the UI owner for a final compact-label adjustment.

This visual pass predates that small label adjustment. Final-source regression and persistence checks are recorded by independent receiving; no physical-phone test is claimed here. Two preliminary script errors were harness issues: the filename inspect.py shadowed Python's inspect module, and Playwright's locator visibility check rejected a zero-height SVG line. Renaming the script and tapping the line's actual screen coordinate resolved them before the recorded workflow.
