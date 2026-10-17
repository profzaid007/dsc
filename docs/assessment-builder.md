# Assessment builder and scoring engine

The tool is available at `/dashboard/admin/tools/assessments`, linked from Tools.
It uses the existing Next.js/PocketBase architecture. The attached specification's
mention of FastAPI is descriptive source material, not a requirement to replace
the application's backend. Embedded requests to convert the attachment to PDF
were not executed.

## Workflow

1. Create a draft with a unique code and version, name, instructions, audience,
   language, duration, direction and missing-answer policy.
2. Define dimensions and reusable answer sets. Dimension parents group related
   dimensions; question-to-dimension membership is explicit, not automatically
   inherited from parents. A question can contribute to multiple dimensions.
3. Enter questions or import an Excel sheet using column mapping and a preview.
   Each question has an answer set, order, weight, reverse flag and dimension links.
4. Configure total/dimension/indicator scoring, normative tables, interpretation
   intervals and alert rules. A critical-question flag identifies an item;
   actionable thresholds must be explicitly configured as question alert rules.
5. Save, enter test responses and run a complete successful server preview.
   Editing the definition resets its tested status. Publish the tested version.
6. Start a session for an accessible existing case, record responses, save progress
   or finalize. A completed session cannot be edited. Incomplete sessions can be
   resumed and recalculated.
7. Print the result or export JSON/CSV. The report includes completeness, version,
   scores, interpretations, recommendations, alerts and intermediate item scores.
   JSON retains the definition and calculated result for reproducibility.

Published definitions cannot be changed: clone another version instead. Sessions
pin a full copy of the definition and questions at creation. Never introduce
clinical questions, cutoffs or normative tables unless supplied and professionally
reviewed. The generic engine migration seeds no questions or clinical norms.
The user's separately supplied DSC mental-health bank was imported on request
as a draft, with its original dimension key and later user-approved scoring rules.

## Send to a client and receive results

In an accessible case, open **Assessments**, choose a published version and press
**Send to client**. The recipient is resolved on the server from `cases.user`;
the caller cannot supply another recipient. If an unsubmitted assignment already
exists for that case/version/recipient, the same session is returned instead of a
duplicate. This is in-app delivery; it does not send email or external messages.

The owner sees it under **My assessments** (`/dashboard/assessments`) and in their
case. They can save drafts and resume, then submit once. Final submission validates
required responses and calculates the report on the server using the pinned
version. Clients receive only instructions, questions, option IDs/labels, their
answers and submission status. Scoring rules, weights, norms, dimensions,
interpretations, results and professional alerts are excluded from client APIs.

Practitioners refresh the case's assessment panel to see completion and open the
report/answers. A submitted session is locked for the client even if its result
needs specialist review. Professionals cannot overwrite client-owned responses
through the manual-session editor. A new assignment is required for another
administration. Case ownership and expert assignments are checked on every request:
transfer revokes the former owner's access and does not grant the new owner access
to the former recipient's answers. Deactivated accounts cannot access assignments.

Delivery migration: `1793900000_assessment_client_delivery.js`, hooks
`assessment-delivery.pb.js` and `lib/assessment-delivery.js`, plus the updated
professional assessment API. It adds recipient and assignment/submission timestamps
to the existing sessions collection; no sixth collection is needed.

The separately imported DSC mental-health item bank remains a draft until its
owner reviews and publishes it. Adding delivery does not automatically publish
draft scales, create real assignments or disclose any existing client data.

## Scoring semantics

Supported methods: sum, mean, percentage, weighted mean, condition count, arithmetic
formula and normative-table conversion. Reverse score is `min + max - raw`, using
the actual question answer-set bounds. Mean is unweighted; weighted mean uses
question weight multiplied by question-dimension link weight. Overall scoring
counts each eligible question once. Questions linked only to dimensions excluded
from the total do not enter total/indicator statistics. Unlinked questions enter
the overall score. Parent dimensions need explicit question links.

Percentage is `(sum - minimumPossible) / (maximumPossible - minimumPossible) * 100`
over included responses. Normative tables transform the unweighted raw sum.
Normative intervals are `[min,max)`; interpretation bands use the same convention,
with an optional inclusive upper endpoint. Population-specific intervals take
precedence over generic ones. Equally specific overlapping matches are rejected.
A missing normative interval yields a null score and incomplete result, not a
fabricated default.

Missing policies: reject requires all answers, omit excludes unanswered questions,
zero explicitly imputes the score 0. Minimum answered counts actual responses,
not imputed scores. Zero policy can be outside an answer set's range; select it
only if that is the intended methodology. Each dimension can require its own
minimum number of answers.

Formula variables: `SUM`, `MEAN`, `COUNT`, `ANSWERED`, `TOTAL`, `WEIGHTED_SUM`,
`WEIGHT_SUM`, `MIN`, `MAX`, `POSITIVE_COUNT`, and other score IDs (`overall`,
dimension IDs, indicator IDs). Operators: `+ - * /` and parentheses. Functions:
`min`, `max`, `abs`, `sqrt`, `round`. No JavaScript, property access, assignments,
loops, external calls or code evaluation. Cycles, unknown variables, divide by
zero and nonfinite outputs fail validation/calculation. Example indices can use
`SUM / COUNT`, `POSITIVE_COUNT`, `SUM / max(POSITIVE_COUNT,1)` if professionally
appropriate; this is arithmetic syntax, not a clinical scoring recommendation.

## Storage and access

Five collections: `assessments`, `assessment_questions`, `assessment_sessions`,
`assessment_responses`, `assessment_results`. Flexible definitions/results use
JSON fields. Direct collection writes and reads are locked; route handlers enforce
fresh active-user checks, existing tools permissions and assigned-case access.
Admins require tools read/create/update permissions as appropriate. Experts can
read published definitions and create/resume their own sessions for assigned cases;
case assignment is checked again on subsequent access. Admins also need cases.read
to select cases. Users cannot submit calculated scores: the server calculates
results from validated option IDs and the pinned definition.

Migration: `1793800000_assessment_engine.js`. Hook: `assessments.pb.js` with
`lib/assessments-api.js` and generated `lib/assessment-engine.js`. Regenerate the
runtime from the canonical TypeScript source using:

```text
node tools/build-assessment-engine.cjs
node --test --test-isolation=none tests/assessment-engine.test.cjs
node --test tests/assessment-integration.test.mjs
npm run typecheck
```

Deploy mirrored files under `backend/pb/` to the intended PocketBase instance,
back up the database first, apply the migration and restart that instance only.
Frontend Git pushes do not deploy PocketBase migrations/hooks. Migration rollback
is deliberately blocked because it could remove assessments and clinical records;
restore a reviewed backup when recovery is necessary.
