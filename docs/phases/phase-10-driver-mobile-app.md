# Phase 10 — Driver Mobile App

> **Duration**: 8-10 days | **Goal**: React Native app for drivers — trips, expenses, POD

---

## Overview

React Native (Expo) mobile app for drivers: phone OTP login, active trip view, expense recording with receipt camera, POD capture with photo + signature + geolocation, earnings summary, and offline support.

---

## Database Tasks

### D10.1 — Mobile-Specific Tables
```sql
-- device_tokens
id UUID PK, user_id UUID FK, device_token TEXT,
platform VARCHAR(10), -- ios|android
created_at, updated_at

-- offline_sync_queue
id UUID PK, user_id UUID FK, entity_type VARCHAR(50),
operation VARCHAR(10), -- create|update
payload JSONB, synced BOOLEAN DEFAULT false,
created_at, synced_at
```

---

## Frontend (Mobile) Tasks

### FM10.1 — Project Setup
- Initialize Expo project in `/apps/mobile` with Expo Router
- Configure TypeScript, ESLint
- Set up Supabase client for React Native
- Configure Expo Notifications (FCM wrapper)

### FM10.2 — Login Screen
- Phone number input with country code (+91 default)
- OTP input (6-digit) with auto-submit
- Supabase Auth `signInWithOtp` flow
- Remember device for 30 days

### FM10.3 — Home Screen
- Active trip card: vehicle, route, departure time, status
- Today's earnings summary
- Advance balance display
- Quick action buttons: Add Expense, Capture POD

### FM10.4 — Trip Details Screen
- Route map (Google Maps embed)
- Assigned LRs list with status badges
- Current trip status with update button
- Trip timeline (status history)

### FM10.5 — Add Expense Screen
- Expense type picker (Toll, Fuel, Repair, etc.)
- Amount input (₹)
- Description text field
- Camera for receipt photo (compressed upload)
- Auto-capture GPS location
- Running balance display: Advance − Expenses = Balance

### FM10.6 — POD Capture Screen
- Camera for delivery photo (auto-compressed)
- On-screen signature pad (draw with finger)
- Receiver name text input
- Auto-capture: timestamp + GPS coordinates
- Submit → updates LR status to "Delivered"

### FM10.7 — Earnings Screen
- This month's payslip summary
- Gross, deductions breakdown, net pay
- Advance balance and recovery history
- Past months payslip list

### FM10.8 — Document Alerts Screen
- DL expiry reminder with days remaining
- Badge expiry alerts

### FM10.9 — Offline Support
- Trip and expense data cached in SQLite (expo-sqlite)
- Offline expense recording → synced on reconnect
- POD photos stored locally if upload fails → auto-retry
- Visual indicator: "Offline Mode" banner
- Sync status: pending items count

---

## Backend Tasks

### B10.1 — Mobile-Specific Routes
```
POST /v1/mobile/auth/otp/send     → Send OTP to phone
POST /v1/mobile/auth/otp/verify   → Verify and login
GET  /v1/mobile/trips/active      → Driver's active trip
POST /v1/mobile/expenses          → Record expense (with file upload)
POST /v1/mobile/pod               → Submit POD (photo + signature)
GET  /v1/mobile/earnings          → Driver's earnings summary
POST /v1/mobile/sync              → Sync offline queue
POST /v1/mobile/device-token      → Register push notification token
```

### B10.2 — Push Notification Service
- New trip assigned → push to driver
- Trip status change → push to driver
- Advance disbursed → push to driver
- Document expiry → push to driver

### B10.3 — Offline Sync Service
- Accept batch of offline operations
- Process in order (FIFO)
- Return sync results (success/conflict per item)
- Conflict resolution: server wins for financial data

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| OTP login works | Phone number → OTP → authenticated |
| POD capture complete | Photo + signature + GPS + timestamp saved |
| Offline expenses sync | Recorded offline → synced on reconnect |
| Push notifications | Driver receives trip assignment notification |
| Earnings display | Matches payroll data from Phase 7 |
