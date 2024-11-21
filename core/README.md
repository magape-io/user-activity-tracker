# user-activity-tracker

A lightweight user activity tracking tool for monitoring real-time user activity status on web pages.

## Features

- 🔄 Real-time user activity tracking
- 🕒 Precise active time recording
- 📊 Automatic device and IP information collection
- 🔍 Smart user inactivity detection
  - Page focus/blur detection
  - No-activity detection
- 📝 Automatic session ID generation (UUID)
- ⏱️ Configurable activity detection thresholds
- 📡 Real-time data reporting

## Installation

```bash
bun install
# or
npm install
```

## Rules
When a user visits a page, a UUID is generated. This ID will start recording the usage time of this visit, along with hardware information 
from this IP address and login time details. The timing will begin immediately.
How to determine user inactivity

## Quick Start

1. Start the development server:
```bash
bun run dev
```

2. Include in your HTML:
```html
<script src="/index.js"></script>
<script>
    const activityMonitor = new UserActivityMonitor({
        noActivityThreshold: 10000,    // 10 seconds for no mouse/keyboard activity
        sendInterval: 30000,         // Sync data every minute
        endpoint: '/api/activity-log',
    });
</script>
```

## Configuration Options

| Parameter | Description | Default Value |
|-----------|-------------|---------------|
| noActivityThreshold | Time threshold for no activity detection | 10000ms |
| sendInterval | Data reporting interval | 30000ms |
| endpoint | Data reporting API endpoint | '/api/activity-log' |
| storageKey | Local storage key | 'user_activity_data' |

## Collected Data

- Session ID (UUID)
- Login time
- Active time statistics
- Device information
- IP address
- Page focus status
- User interaction status

## Use Cases

- User behavior analysis