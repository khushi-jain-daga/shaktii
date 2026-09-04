# API Reference

The `api/` directory contains Vercel serverless functions used by the PKAP Analyzer workspace.

## Endpoints

```text
/api/pkap-analyze
/api/pkap-generate-report
/api/pkap-investigate
/api/pkap-threat-intel
/api/pkap-block-ip
```

## POST /api/pkap-analyze

Analyzes sanitized log content and returns structured security findings.

### Purpose

- Process uploaded/pasted logs
- Generate findings
- Extract IOCs
- Return risk/severity summary
- Use optional AI enrichment when configured
- Fall back to deterministic local-style output when needed

### Expected Input

```json
{
  "content": "raw or sanitized log text",
  "fileName": "security.log"
}
```

## POST /api/pkap-generate-report

Generates a structured incident report from an analysis result.

### Purpose

- Convert findings into report format
- Create executive and technical summaries
- Add remediation guidance
- Support export/share workflows

## POST /api/pkap-investigate

Investigates a selected finding.

### Purpose

- Provide finding-specific context
- Recommend triage steps
- Add response guidance
- Support analyst workflow from the report dashboard

## POST /api/pkap-threat-intel

Enriches an IOC such as an IP address, domain, URL, or hash.

### Purpose

- Return reputation context
- Provide vendor-style verdict summary
- Return network/owner/country context when available
- Fall back to local intelligence data if external keys are unavailable

## POST /api/pkap-block-ip

Simulates a containment/block action.

### Purpose

- Provide safe WAF/SOAR-style action placeholder
- Demonstrate incident-response workflow
- Avoid performing unsafe real infrastructure changes by default

## Environment Variables

Optional external enrichment providers should be configured through Vercel environment variables or a local `.env` file.

Never commit real secrets to the repository.

## Error Handling

The frontend should handle these cases gracefully:

- missing provider keys
- failed external API requests
- malformed log payloads
- no findings detected
- network failures

## Security Notes

- Redact sensitive values before sending logs to serverless APIs.
- Avoid submitting real production logs unless explicitly sanitized.
- Keep `.env` out of Git.
