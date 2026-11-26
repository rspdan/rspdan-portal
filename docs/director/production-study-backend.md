# Local production study persistence

This separate document store supports operator-authored studies beside Director takes. It does not invoke an engine, mutate a scene, render a native, send a message or save to a shared service. Canonical take and floor-plan formats are unchanged.

The Astro route `/api/director-study` runs only with **development mode** and an explicitly configured `DIRECTOR_STUDY_STORE_DIR`. It has no Redis, hosted-storage or production fallback. Configure an existing signed operator session through PSPT; an API key does not substitute for that session. Every POST requires an exact same-origin header. Credentials and the store directory stay on the server.

## Contract

- `GET /api/director-study` → `{ok, studies, storage:'local-workspace', shared:false}`. `studies` contains the current summary for each owned study, most recently committed first.
- `GET ?id=study_<uuid>&revision=rev_<uuid>` → `{ok,saved,study,storage,shared:false}`. Omit `revision` for the current head. Revision reads do not run a model. A missing/other-owner study returns 404.
- `POST {action:'save',requestId,studyId,baseRevisionId,study}` → the same full response. Use UUID request IDs, `study_<uuid>` study IDs, `baseRevisionId:null` for a new study and the last received revision ID for a revision. Summary fields are `{id,revisionId,baseRevisionId,title,createdAt,studyHash}`. Revision IDs are `rev_<requestId>`.
- `POST {action:'asset',dataUrl}` → `{ok,asset:{sha256,mime,bytes},storage,shared:false}`.
- `GET ?asset=<sha256>` → the authenticated owner's exact PNG/JPEG/WebP bytes, with a private/no-store response and `nosniff`. It never reads a supplied path or fetches a URL.

Errors return `{ok:false,error}`. Validation is 400; authentication 401; wrong origin/non-operator 403; absent owned record 404; revision/request reuse/asset-reference conflict 409; oversized data 413; incorrect content type 415; disabled/unavailable storage 503. An uncertain save must be retried with the same request ID and exact body, not a newly created ID.

## Document

`nest-production-study/v1` has exactly:

```text
title
target: {kind:'external-native', name, sha256:null|hash}
evidence: [{id,title,kind:'image'|'text',source,asset:null|descriptor,text:null|string}]
cards: [{id,parentId:null|id,origin:'operator',observations,proposal,keepFixed,imageCheck,limits,sourceIds:[]}]
corrections: [{id,fromCardId,toCardId,text}]
selectedCardId: null|id
acceptedCardId: null|id
preview: null|{asset,cardId,settingsText,targetSha256}
nextAction
```

Text fields remain literal authored strings. Evidence `source` is a citation/locator, never an executable or fetched location. Text evidence has `asset:null`; image evidence has `text:null`. An image with `asset:null` is an explicitly unresolved draft reference. A null preview and no accepted card are valid. A non-null preview must bind a stored image to the accepted card, nonempty actual-settings text and the known matching target hash. The service validates these associations; it cannot prove that operator-authored claims describe a render that happened.

Existing saved evidence, cards and corrections remain unchanged and present in later revisions. Evidence IDs retain their original source, text and exact asset descriptor so an earlier card cannot silently acquire a different citation. To resolve a saved null-asset placeholder, keep that placeholder, upload the image, and add an evidence entry with a new ID and its returned asset descriptor. Cite the new ID in a new child card; the earlier card and its source references remain intact. Correcting source text or a locator likewise requires a new evidence ID.

To edit a saved card, create a new card ID whose parent names the earlier card. A correction points from that earlier card to its direct child. New cards reference known evidence; parents precede children, preventing cycles. Selecting a card is independent of accepting it. There is no `engine` origin or fabricated response metadata in this slice.

Limits: 1 MiB serialized study, 24 evidence items, 64 cards/corrections, 8 MiB per asset, 12 MiB request body. IDs and strings have additional bounds in `productionStudySchema.js`. The local owner log accepts 512 revisions; it returns an explicit capacity error rather than silently dropping history. This small implementation scans the local log and is not a high-volume store.

## Atomicity and exact assets

The local layout is `owners/<SHA256(operator)>/assets/<sha256>.bin` plus an immutable `commits/` chain. Each complete JSON commit is written to a private temporary file, file-synced and installed with an atomic hard link to the single slot after the previous owner commit. The first slot is `next_root.json`; later slots are `next_rev_<uuid>.json`. No mutable head file or separate index can diverge from the revision record.

Two concurrent same-study saves may observe the same base, but only one wins the next slot. The loser rereads the chain and reports a stale-base conflict. Concurrent unrelated studies can retry the append against the newer owner chain while retaining their unchanged study base. Duplicate request IDs are owner-wide: identical payload/base returns the original receipt even after newer revisions; different reuse is a conflict. A crash after atomic installation but before the response is therefore retryable without another accepted mutation. A crash before installation leaves at most an ignored temporary file, not a visible revision. No process lock or expiring lease is used.

Assets are installed atomically by hash before a study can reference them. Saving and readback verify every non-null descriptor against the owner's actual bytes. Missing, altered or wrong-MIME/length attachments do not produce a successful saved/reopened receipt. A declared absent attachment remains a valid draft. There is no asset-deletion endpoint in this slice; external filesystem damage is reported rather than silently repaired.

Raster validation checks signatures, bounded container structure and dimensions without resizing/re-encoding. Still PNG/JPEG/WebP are accepted; SVG and animated WebP are excluded. This is not a full pixel decoder or proof that an image was viewed. The bytes and SHA256 remain unchanged; later visual receiving remains separate.

Atomic installation requires a filesystem supporting same-directory hard links. File data is synced before installation; directory sync is attempted, but some Windows filesystems do not support it. Power-loss durability remains bounded by the actual filesystem. A failed operation is not reported as a successful save. Do not place the configured store inside public static assets or a shared web-served directory. Moving a copied folder requires the same operator identity to resolve its owned records; no secrets are stored in it.

## Receiving

Focused checks live in `src/lib/productionStudy.test.mjs` and `productionStudy.http.test.mjs`. They use invented records and temporary local stores, including separate processes and an isolated Astro server with synthetic sessions. Run with `node --test` against those files. Tests of persistence do not establish model usefulness, native preview production, deployed behavior or execution on HYV0.

The copied-folder check copies a completed temporary store to a different path, removes only the test's original disposable store, and opens the copy in a fresh Node process under the same operator. Both historical/current study records and exact referenced image bytes match. This establishes same-platform copied-folder portability only; it does not establish Windows or HYV0 receiving. Saved evidence replacement/removal and in-place placeholder resolution are separately rejected, while a new evidence ID with a child citation reopens without changing the earlier sources.
