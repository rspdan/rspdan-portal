# STANDARD RULE — Date Filename Generation
# Canon: 033126 | ◆ Stan (STN2_StanS_033126_1)
# Witnessed: ● Dan Sullivan
# Filed: Onesday 033126 ~1:20pm rw

---

## THE RULE

Never generate a MMDDYY date string from memory or by incrementing a prior date.
Always compute from the system clock before writing any date-based filename.

**PowerShell command:**
```powershell
(Get-Date).ToString("MMddyy")
```

**BPK sanity check:**
Extract the DD digits from any generated date string.
If DD > 31 → impossible date → stop, recompute, do not proceed.

---

## WHAT TRIGGERED THIS RULE

On 033126 (March 31, 2026), two independent Stan instances both generated
the filename `LOG_STN2_StanS_ 034026_1.md` — an impossible date.

Dissected:
- `03` = March ✅
- `40` = day 40 of March ❌ — March has 31 days maximum
- `26` = 2026 ✅

Root cause: the model saw the prior date `033026` (March 30) in context
and incremented the day digits from `30` to `40` — treating the two
digits as a single number and adding 1, rather than computing March 31
from the actual calendar.

The correct MMDDYY for March 31 2026 is `033126`.

Both instances made the same error independently. This is a systematic
failure mode, not a one-off. The rule exists to prevent it at the BPK
layer before any file is named or created.

---

## PRIOR PATTERN

This failure type has precedent. On 031926, a calendar day-name error
was caught by Dan and filed immediately:
  `MAIL/STN2_TO_ALL_CalendarCorrection_031926.md`
  *"Dan caught it. Stan filed it. The record is clean."*

The correction protocol is: Name the error precisely → file Standard Rule
to RELAY → file MAIL to all crew → commit → record clean.

---

## HOW WE HANDLED IT (033126 session)

1. Dan named the error — twice, because the first correction was analyzed incorrectly
2. Stan stopped, looked at the Explorer image showing the actual file naming convention
3. Diagnosed root cause: increment failure, not naming convention failure
4. Filed retraction LIAM to Trip for the false auto-logger finding
5. Ran MM (memory #4 updated with root cause + fix)
6. Filed this Standard Rule
7. Filed MAIL to all crew
8. Committed atomically with Living Map

The correction was not easy to extract — it took two corrections from Dan
before Stan stopped analyzing the wrong thing. That is itself a finding:
when corrected, always re-read the original error before analyzing the fix.
The danger is analyzing the correction rather than the underlying error.

---

## THE NAMING CONVENTION (confirmed from Explorer image, 033126)

```
LOG_STN2_StanS_ [MMDDYY]_[n].md
                 ^^  ^^  ^^
                 MM  DD  YY
                 03  30  26 = March 30 2026 (033026) ✅
                 03  31  26 = March 31 2026 (033126) ✅
                 03  40  26 = IMPOSSIBLE ❌ — no 40th day
```

Space before the date is part of the convention: `StanS_ 033126_1`.

---

*"Dan caught it. Stan filed it. The record is clean."*
*— Pattern established 031926, confirmed 033126*
