# Features

This document summarizes the major SHAKTII + PKAP Analyzer features.

## SHAKTII Landing Experience

- Cybersecurity-focused hero section
- Product positioning for digital defense
- PKAP Analyzer introduction section
- Core capability cards
- Pricing/contact sections from the SHAKTII interface
- Native dark-grid visual system

## Live Dashboard

- Security overview interface
- Telemetry-oriented dashboard layout
- Operational defense panels
- Network/event visualization sections

## PKAP Upload Center

Supported input formats:

- `.log`
- `.txt`
- `.json`
- `.csv`

Capabilities:

- Upload log files
- Paste raw logs manually
- Preview sanitized input
- Trigger analysis workflow
- Redact sensitive values before processing

## Redaction

The analyzer is designed to detect and mask sensitive values such as:

- emails
- tokens
- secrets
- API keys
- credentials
- personally identifiable information patterns

## Analysis

PKAP Analyzer provides:

- risk score
- severity breakdown
- suspicious events
- extracted indicators of compromise
- MITRE-style tactic/technique tagging
- remediation suggestions
- local fallback analysis when external APIs are unavailable

## Report Dashboard

The report dashboard includes:

- threat score summary
- severity cards
- findings list
- IOC list
- charts and event summaries
- remediation queue
- export/share actions

## Reports History

- Store generated reports locally
- Reopen previous reports
- Delete old reports
- Review prior incident snapshots

## Threat Intelligence

Threat-intelligence workspace includes:

- IOC search
- IP/domain/hash style investigation flow
- reputation score
- enrichment fallback
- observed threat activity graph
- global threat landscape section
- trending threat table

## Investigation

Finding investigation supports:

- finding-level context
- recommended triage
- incident response suggestions
- enrichment through serverless API when available

## Containment

The containment API provides a safe workflow placeholder for:

- block-IP action simulation
- WAF/SOAR style integration surface
- local containment list behavior

## Documentation and Settings

The app includes internal screens for:

- usage documentation
- workspace instructions
- compliance settings
- notifications
- local data cleanup preferences

## External Integrations

Optional integrations may be configured through environment variables. When not configured, the app keeps running with fallback analysis.
