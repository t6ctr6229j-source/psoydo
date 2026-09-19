# Psoydo Website Agent Brief

## Mission
Build psoydo.com into a premium Enterprise-AI product website that can credibly score at least 85% in every committee category: visual quality, messaging, product clarity, trust, technical credibility, conversion, mobile UX, accessibility, maintainability and performance.

The target is not more content. The target is stronger evidence, clearer hierarchy and a finished-product feel comparable to a high-quality premium technology website.

## Core product truth
Psoydo makes sensitive data usable with powerful AI systems by separating identity from usable context before the content reaches the external model.

Original identities and the mapping between originals and pseudonyms are designed to remain within a customer-controlled protection boundary. External AI systems receive pseudonymized working context.

Psoydo can be positioned for local, on-premises and controlled private-cloud operating models. Do not invent technical implementation details that are not documented.

## PIF public-safe principles
Source philosophy: DOC-PIF-001, Psoydo Intelligence Framework, 2026-06-21.

Public-safe concepts that may be used:
- Pseudonymization is context-sensitive, not simple search-and-replace.
- The same token can mean different entity types depending on context.
- PIF combines structure/transparency with internal intelligence.
- Learning loop: detection/pseudonymization -> revision -> root-cause understanding -> feedback into detection.
- Control mechanisms make errors visible and measurable; their ideal end state is that they find less over time.
- Human visual review remains the final safety net before release.
- The user retains conscious responsibility for final release.
- Psoydo should not claim perfection. Trust comes from transparent control and a documented path to improvement.

Do NOT publish internal model names, confidential example incidents or implementation details from internal documentation unless explicitly approved.

## Claims discipline
Never claim without explicit product evidence:
- 100% accurate
- error-free
- 100% GDPR compliant / DSGVO-konform as an unconditional product property
- legally secure / rechtssicher
- revisionssicher as an unconditional product property
- concrete accuracy percentages
- certifications or deployments that are not documented

Allowed framing:
- supports GDPR-compliant process design
- supports traceable / revisionsfähige processes through documented processing and appropriate logs
- human review remains part of the control model

## Pricing direction
Current approved website direction for the working branch:
- Psoydo Test: EUR 990 one-time, 30 days, cloud, evaluation only, no auto-renewal, once per organization, credited in full when moving into an annual license directly afterwards.
- Psoydo Team: EUR 9,900 / year.
- Psoydo Business: EUR 24,900 / year.
- Psoydo Enterprise: from EUR 49,900 / year.

Do not invent hard page volumes, user counts, SLA values, API entitlements or feature gates until technical/commercial documentation confirms them.

Security functionality must not be artificially presented as a premium-only feature. Higher tiers should primarily represent scale, operating model, administration, service level and integration complexity.

## Test license
The 30-day cloud test is for evaluation and internal testing, not permanent production use. No automatic subscription conversion. The website should make this unusually clear and trustworthy.

## Design direction
- premium enterprise technology, not generic cyber-SaaS
- very dark green/black + off-white + acid/mint green accent
- large editorial typography, restrained cards, meaningful visual rhythm
- show product/process rather than decorate with generic cyber imagery
- fewer badges/icons; more evidence, diagrams and real product surfaces
- deliberate dark/light section transitions
- subtle motion only when it improves comprehension
- mobile must feel intentionally designed, not merely stacked desktop

## Existing high-value elements
Preserve and refine unless evidence suggests otherwise:
- Hero claim: "Die beste KI. Ohne deine echten Daten."
- original -> Psoydo -> pseudonymized payload demonstration
- "Schwärzen nimmt Kontext. Psoydo nimmt Identität."
- PIF learning-loop story
- protection-boundary architecture
- concrete use cases
- transparent pricing and paid 30-day evaluation

## Quality loop rules
Each iteration must:
1. Read this brief and the current overnight state.
2. Inspect PR #2, changed files and current CI status.
3. Fix CI/regressions before adding features.
4. Select exactly one highest-impact bounded improvement.
5. Implement it on `polish/committee-90`. Never push directly to `main`.
6. Re-run or inspect QA after the change.
7. Update `docs/OVERNIGHT_BUILD_STATE.md` with what changed, evidence, remaining issues and the next best task.
8. Stop rather than guess when product facts are missing.

## Hard stop conditions
Stop autonomous iteration when any of these is true:
- the state file marks `QUALITY_GATE: PASS`
- only tasks requiring undocumented product facts remain
- two consecutive attempts fail for the same root cause
- CI cannot be restored after two bounded repair attempts
- a change would require production credentials, payment-provider configuration, DNS changes or merging to main
- the run would mostly add content rather than improve a measured weakness

No endless loops. No more than one major feature or two small related fixes per iteration.

## Commercial and IP positioning

wescaleIT AG is the public-facing **provider, seller and Trusted Advisor** for Psoydo. It may be described as the customer's commercial and advisory counterpart for sales, onboarding, use-case selection, information security and deployment guidance.

Do **not** claim or imply that wescaleIT developed, built, created or owns Psoydo or its IP. Avoid phrases such as “built by wescaleIT”, “developed by wescaleIT”, “Psoydo wird von wescaleIT gebaut” or “ein Produkt der wescaleIT AG”.

Public website copy must not discuss or infer development provenance or IP ownership. If provenance is needed, use language such as “Angeboten und vertrieben durch die wescaleIT AG” or “wescaleIT AG — Anbieter, Vertrieb und Trusted Advisor”.
