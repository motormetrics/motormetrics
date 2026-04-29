---
on:
  workflow_dispatch:
    inputs:
      action:
        description: "Maintenance mode action"
        required: true
        type: choice
        options:
          - status
          - enable
          - disable
      message:
        description: "Custom maintenance message (optional)"
        required: false

permissions:
  contents: read

engine: claude
strict: false

network:
  allowed:
    - motormetrics.app

tools:
  bash:
    - curl
    - echo
    - jq

secrets:
  MOTORMETRICS_API_TOKEN: ${{ secrets.MOTORMETRICS_API_TOKEN }}

---

# Maintenance Mode

Toggle maintenance mode for motormetrics.app via the REST API.

## Instructions

You are managing maintenance mode for the MotorMetrics platform.

The user has selected the action: `${{ inputs.action }}`
The user provided this custom message: `${{ inputs.message }}`

Use the maintenance API at `https://motormetrics.app/api/v1/maintenance`.

### Authentication

All requests must include the header:
```
Authorization: Bearer $MOTORMETRICS_API_TOKEN
```

### Actions

**If the action is `status`:**
1. Send a GET request to the maintenance API
2. Report whether maintenance mode is currently enabled or disabled, and show the current message if any

**If the action is `enable`:**
1. Send a PUT request to the maintenance API with a JSON body containing `enabled: true` and a `message` field
2. If the user provided a custom message, use that. Otherwise, use the default message: "Maintenance is in progress. You may still browse the site but some pages may not work as expected."
3. Confirm that maintenance mode was enabled successfully

**If the action is `disable`:**
1. Send a PUT request to the maintenance API with a JSON body containing `enabled: false`
2. Confirm that maintenance mode was disabled successfully

### Error Handling

If any API call fails, report the HTTP status code and response body clearly.
