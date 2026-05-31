# Firestore Security Specification

This document defines the security architecture and threat models for the Autotopi database.

## 1. Data Invariants
- **Admin Supremacy**: Only the verified owner account `tasadddikahanafdre.dev@gmail.com` can create, update, or delete website components (banners, news, videos, settings, notifications).
- **Public Visibility (Read-All)**: All website content (banners, news posts, videos, settings, and notifications) can be read by any visitor (signed in or anonymous) to ensure the platform operates seamlessly.
- **Inquiry Integrity (Write-Only for Visitors)**: Users can submit contact inquiries (`/messages`). Once submitted, visitors cannot view other users' messages (`get`/`list` are blocked), nor can they update or delete existing messages. Only the verified Admin can read, update the status, and delete messages.
- **Timestamp Verasity**: All creation/update timestamps must strictly match `request.time`.

## 2. Threat Scenarios (The Dirty Dozen Payloads)
The security rules are designed to prevent and explicitly block the following operations:
1. **Unauthenticated Admin Hijack**: Anonymous visitor pokušava write banner details.
2. **Standard User Privilege Escalation**: Logged-in user who is not the admin tries to post a news article.
3. **Admin Identity Spoofing**: Logged-in user with unverified email `tasadddikahanafdre.dev@gmail.com` trying to write a video.
4. **Phantom Settings Injection**: Visitors posting configuration settings.
5. **Inquiry Data Scraping**: Public user attempting to list `/messages`.
6. **Inquiry Sniffing**: Public user attempting to `get` `/messages/{messageId}`.
7. **Inquiry Modification**: Public user trying to alter status or message content of their own submittal.
8. **Malicious ID Injection**: Injecting long non-alphanumeric text strings to pollute keys.
9. **No-Timestamp Timestamp Forgery**: Client providing its own client-side timestamp for news creation.
10. **Shadow Field Insertion**: Appending undocumented field parameters to banners.
11. **Immutability Breach**: Updating `id` or primary structural keys on existing documents.
12. **Notification Broadcast Spoofing**: Normal user posting a notification alert.

## 3. Standard Global Rules Definition (`firestore.rules`)
Below we define the standard secure ruleset to block every single one of those attacks.
