# NusaSec UI/UX Build System

## Purpose

NusaSec is built as a product UI, not a generated marketing template. The design system separates presentation from the Core/API contract so visual work can evolve without rewriting the security engine.

## Design principles

1. Product-first: show the actual Control Tower and security workflows instead of decorative illustrations.
2. Context over isolated metrics: assets, findings, threats, identities and incidents should connect to a useful security context.
3. Progressive disclosure: overview → finding → entity → investigation → action.
4. Consistent components: pages reuse the same navigation, tables, status badges, risk scores, timelines, drawers and empty/error states.
5. Honest data: demo values are clearly presentation values; production values come from NusaSec Core through the existing API proxy.
6. Restraint: motion and imagery support comprehension rather than decorate the page.
7. Accessibility: keyboard focus, readable contrast, semantic controls and responsive layouts are part of the component contract.

## Visual hierarchy

- Primary: security posture, prioritized action and active incidents.
- Secondary: exposure trend, findings distribution and engine health.
- Tertiary: recent activity and supporting metadata.

## Product surfaces

- Overview: posture and prioritized work.
- Attack Surface: assets, domains, services, exposure and attack paths.
- Threat Intelligence: indicators, campaigns, matches and correlation.
- Vulnerabilities: findings, severity, affected assets and remediation.
- Monitoring: live events, alerts and telemetry.
- Incidents: investigation timeline, evidence, affected assets and response actions.
- Compliance: frameworks, controls, evidence and reports.

## Integration rule

Do not invent backend contracts to make the UI look connected. `web/app.js` and the server proxy remain the integration boundary. When the NusaSec Core API is available, module adapters should map real Core responses into the UI components without changing the Core implementation.

## Asset strategy

Prefer, in order:

1. Real NusaSec product UI and data visualizations.
2. Custom SVG diagrams and topology graphics owned by NusaSec.
3. Licensed icon libraries used consistently.
4. A small number of relevant infrastructure photographs where they add context.
5. Illustration only when it explains a concept that UI cannot explain.

Avoid generic hacker imagery, shields, locks, glowing brains, stock keyboard shots and decorative AI-generated scenes.

## Implementation layers

```text
NusaSec Core
    ↓
API / HTTP boundary
    ↓
Module adapters
    ↓
Reusable UI components
    ↓
Product surfaces
    ↓
Responsive presentation
```

The public website and Control Tower may evolve independently from the Core as long as the API boundary remains stable.
