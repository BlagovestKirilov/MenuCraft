# Facebook Page Integration — Technical Documentation

## Overview

MenuCraft allows venues to connect their Facebook Pages and publish posts (text or photo+caption) directly from the application. The integration uses the **Facebook Graph API v21.0** with the **OAuth 2.0 Authorization Code** flow.

---

## Architecture

```
┌──────────┐      ┌──────────────┐      ┌──────────────────┐      ┌────────────┐
│ Frontend │─────>│  Backend API │─────>│ Facebook Graph   │─────>│ Facebook   │
│ (React)  │<─────│ (Spring Boot)│<─────│ API v21.0        │      │ Page       │
└──────────┘      └──────┬───────┘      └──────────────────┘      └────────────┘
                         │
                  ┌──────┴───────┐
                  │  PostgreSQL  │
                  │  (encrypted  │
                  │   tokens)    │
                  └──────────────┘
```

### Components

| Component | File | Responsibility |
|---|---|---|
| `FacebookController` | `controller/FacebookController.java` | REST endpoints for OAuth flow, connections, posting |
| `FacebookOAuthService` | `service/FacebookOAuthService.java` | OAuth 2.0 token exchange, page discovery, connection storage |
| `FacebookPostingService` | `service/FacebookPostingService.java` | Publishing text/photo posts to connected pages |
| `TokenEncryptionService` | `security/TokenEncryptionService.java` | AES-256-GCM encryption/decryption of access tokens |
| `FacebookConnection` | `model/FacebookConnection.java` | JPA entity storing page connections |
| `FacebookConnectionRepository` | `repository/FacebookConnectionRepository.java` | Database queries for connections |
| `FacebookProperties` | `config/FacebookProperties.java` | Externalized Facebook app configuration |
| `EncryptionProperties` | `config/EncryptionProperties.java` | AES secret key configuration |
| `FacebookConnectionMapper` | `util/FacebookConnectionMapper.java` | MapStruct entity-to-DTO mapper |

---

## OAuth 2.0 Flow

The integration follows the standard **Authorization Code** flow with an additional step to exchange for a **long-lived token**.

### Step-by-Step

```
  User           Frontend         Backend            Facebook
   │                │                │                   │
   │  1. Click      │                │                   │
   │  "Connect"     │                │                   │
   │───────────────>│                │                   │
   │                │  2. GET        │                   │
   │                │  /facebook/    │                   │
   │                │  oauth/login   │                   │
   │                │  ?venueId=X    │                   │
   │                │───────────────>│                   │
   │                │                │  Generate CSRF    │
   │                │                │  state token      │
   │                │  3. Return     │  Store state→     │
   │                │  Facebook URL  │  venueId mapping  │
   │                │<───────────────│                   │
   │                │                │                   │
   │  4. Redirect   │                │                   │
   │  to Facebook   │                │                   │
   │<───────────────│                │                   │
   │                │                │                   │
   │  5. User grants permissions on Facebook            │
   │────────────────────────────────────────────────────>│
   │                │                │                   │
   │                │                │  6. Facebook      │
   │                │                │  redirects to     │
   │                │                │  /facebook/oauth/ │
   │                │                │  callback?code=   │
   │                │                │  ...&state=...    │
   │                │                │<──────────────────│
   │                │                │                   │
   │                │                │  7. Validate CSRF │
   │                │                │  state            │
   │                │                │                   │
   │                │                │  8. Exchange code  │
   │                │                │  for short-lived  │
   │                │                │  token            │
   │                │                │──────────────────>│
   │                │                │<──────────────────│
   │                │                │                   │
   │                │                │  9. Exchange for   │
   │                │                │  long-lived token │
   │                │                │  (~60 days)       │
   │                │                │──────────────────>│
   │                │                │<──────────────────│
   │                │                │                   │
   │                │                │  10. GET           │
   │                │                │  /me/accounts     │
   │                │                │  (fetch pages)    │
   │                │                │──────────────────>│
   │                │                │<──────────────────│
   │                │                │                   │
   │                │                │  11. Encrypt page  │
   │                │                │  tokens & save    │
   │                │                │  to database      │
   │                │                │                   │
   │                │  12. Redirect  │                   │
   │                │  302 to        │                   │
   │                │  frontend      │                   │
   │                │  callback page │                   │
   │  13. Show      │<───────────────│                   │
   │  success page  │                │                   │
   │<───────────────│                │                   │
```

### CSRF Protection

A random 32-byte state token is generated using `SecureRandom` and stored in an in-memory `ConcurrentHashMap` keyed by state, mapping to the venue ID. When the callback arrives, the state is validated and consumed (one-time use). If the state is missing or already used, the request is rejected.

> **Note:** The in-memory state store works for single-instance deployments. For multi-instance production environments, replace with Redis or a database table.

### Token Exchange Chain

1. **Authorization Code → Short-Lived User Token** (~1 hour)
   - `GET /oauth/access_token?client_id=...&client_secret=...&redirect_uri=...&code=...`

2. **Short-Lived → Long-Lived User Token** (~60 days)
   - `GET /oauth/access_token?grant_type=fb_exchange_token&client_id=...&client_secret=...&fb_exchange_token=...`

3. **Long-Lived User Token → Page Access Tokens**
   - `GET /me/accounts?access_token=...`
   - Each page in the response includes its own `access_token`
   - Page tokens derived from a long-lived user token for pages where the user is an admin **do not expire**

### Required Facebook Permissions

| Permission | Purpose |
|---|---|
| `pages_manage_posts` | Create posts on the connected page |
| `pages_read_engagement` | Read page engagement metrics |
| `pages_show_list` | List pages the user administers |

---

## Token Security

### Encryption at Rest

Page access tokens are **never stored in plaintext**. Before persisting to the database, each token is encrypted using **AES-256-GCM**.

**Format:** `Base64( IV[12 bytes] || ciphertext || authTag[16 bytes] )`

- **Algorithm:** AES/GCM/NoPadding
- **Key size:** 256 bits (32 bytes)
- **IV:** 12 bytes, randomly generated per encryption (via `SecureRandom`)
- **Auth tag:** 128 bits (built into GCM mode)
- **Key source:** `encryption.aes-secret` from `application.yaml` (environment variable `AES_ENCRYPTION_SECRET`)

Each encryption produces a unique ciphertext even for the same input, because the IV is random. The IV is prepended to the ciphertext so decryption can extract it.

### Tokens Never Exposed to Frontend

The `FacebookConnectionDto` (returned by the API) contains `id`, `pageId`, `pageName`, `status`, `createdAt`, and `updatedAt`. The `encryptedPageToken` field is **never mapped** to any DTO. The MapStruct mapper explicitly excludes it.

---

## Database Model

### `facebook_connection` Table

| Column | Type | Description |
|---|---|---|
| `id` | UUID (PK) | Auto-generated primary key |
| `venue_id` | UUID (FK) | References `venue.id` |
| `page_id` | VARCHAR | Facebook Page ID (numeric string) |
| `page_name` | VARCHAR | Human-readable page name |
| `encrypted_page_token` | VARCHAR(1024) | AES-256-GCM encrypted page access token |
| `status` | VARCHAR (ENUM) | `CONNECTED` or `DISCONNECTED` |
| `created_at` | TIMESTAMP | Auto-set on creation |
| `updated_at` | TIMESTAMP | Auto-updated on modification |

### Upsert Logic

When a user reconnects the same Facebook Page to the same venue, the existing row is updated rather than duplicated. The lookup is done via `findByVenueIdAndPageId`.

---

## API Endpoints

### `GET /facebook/oauth/login?venueId={uuid}`

**Auth:** Public (permitAll)

Generates the Facebook OAuth login URL. The frontend should redirect the user's browser to the returned URL.

**Response:** `200 OK` — plain string containing the Facebook OAuth dialog URL.

---

### `GET /facebook/oauth/callback?code={code}&state={state}`

**Auth:** Public (permitAll)

Facebook redirects to this endpoint after the user grants permissions. The backend:
1. Validates the CSRF state
2. Exchanges the code for tokens
3. Fetches and stores page connections
4. Redirects the browser (HTTP 302) to `http://localhost:5173/facebook/oauth/callback?status=SUCCESS&pages=N`

The frontend callback page reads these query parameters and displays the result.

---

### `GET /facebook/connections/{venueId}`

**Auth:** Authenticated (JWT required)

Returns all Facebook connections for the given venue.

**Response:**
```json
[
  {
    "id": "uuid",
    "pageId": "1054389641079878",
    "pageName": "Test page",
    "status": "CONNECTED",
    "createdAt": "2026-02-14T19:15:00Z",
    "updatedAt": "2026-02-14T19:15:00Z"
  }
]
```

---

### `POST /facebook/post`

**Auth:** Authenticated (JWT required)

Publishes a post to a connected Facebook Page.

**Request:**
```json
{
  "connectionId": "uuid",
  "message": "Hello from MenuCraft!",
  "photoUrl": "https://example.com/image.jpg"  // optional
}
```

- If `photoUrl` is provided: creates a photo post via `POST /{page-id}/photos`
- If `photoUrl` is omitted: creates a text post via `POST /{page-id}/feed`

**Response:**
```json
{
  "status": "SUCCESS",
  "postId": "1054389641079878_123456789"
}
```

---

## Error Handling

### Expired or Revoked Tokens

When a post attempt fails because the token is invalid or expired, Facebook returns an HTTP 400 with error code `190` (`OAuthException`). The system handles this automatically:

1. `FacebookPostingService` catches the `HttpClientErrorException`
2. Checks if the error body contains `"code":190` or `"OAuthException"`
3. If yes: sets the connection status to `DISCONNECTED` and saves to the database
4. Returns an error response: `"Facebook token is invalid or expired. Connection marked as disconnected. Please reconnect."`
5. The frontend shows the connection with a red `DISCONNECTED` badge and no "Post" button
6. The user must go through the OAuth flow again to get a fresh token

### Other Graph API Errors

Any other Facebook API error (rate limiting, permission denied, invalid content, etc.) is returned as-is in the response message without changing the connection status.

### CSRF State Errors

If the state parameter in the callback is invalid or expired (e.g., the user waited too long, or the server restarted clearing the in-memory store), the system returns: `"Invalid or expired OAuth state. Please restart the connection."`

---

## Configuration

### `application.yaml`

```yaml
facebook:
  app-id: ${FACEBOOK_APP_ID}
  app-secret: ${FACEBOOK_APP_SECRET}
  redirect-uri: ${FACEBOOK_REDIRECT_URI}
  graph-api-base: https://graph.facebook.com/v21.0

encryption:
  aes-secret: ${AES_ENCRYPTION_SECRET}
```

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `FACEBOOK_APP_ID` | Facebook App ID from developers.facebook.com | `123456789012345` |
| `FACEBOOK_APP_SECRET` | Facebook App Secret | `abc123def456...` |
| `FACEBOOK_REDIRECT_URI` | Must match the URI registered in the Facebook app | `http://localhost:8080/facebook/oauth/callback` |
| `AES_ENCRYPTION_SECRET` | 32-character secret for AES-256 encryption | `mySecureKey32CharactersLong!!!!` |

### Where to Get These Values

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Create or select your app
3. Go to **App Settings > Basic** to find your App ID and App Secret
4. Go to **Facebook Login > Settings** and add your redirect URI to **Valid OAuth Redirect URIs**
5. Generate a random 32-character string for `AES_ENCRYPTION_SECRET`

---

## Security Configuration

In `SecurityConfig.java`:

```java
.requestMatchers("/facebook/oauth/**").permitAll()   // OAuth endpoints are public
.requestMatchers("/facebook/**").authenticated()      // Everything else requires JWT
```

- OAuth login and callback must be public because the browser redirects happen without a JWT
- Connection listing and posting require authentication

---

## Technical Notes

### RestClient and Facebook's Content-Type

Facebook's Graph API sometimes returns responses with `Content-Type: text/javascript` instead of `application/json`. Spring's `RestClient` doesn't have a message converter for `text/javascript`. To fix this, all Graph API calls include `.accept(MediaType.APPLICATION_JSON)`, which tells Facebook to respond with proper JSON.

### URI Template Encoding

Spring's `RestClient.uri(String)` interprets the argument as a URI template and re-encodes special characters. Since the Graph API URLs contain pre-encoded parameters (like the redirect URI), this causes double-encoding. The fix is to use `URI.create(url)` instead, which bypasses template processing and sends the URL as-is.

### Page Token Lifetimes

- **Short-lived user tokens:** ~1 hour (never stored)
- **Long-lived user tokens:** ~60 days (used only to fetch page tokens, then discarded)
- **Page tokens from long-lived user tokens:** Do not expire for pages where the user is an admin (these are stored encrypted in the database)

If a page token does become invalid (user revokes permissions, changes password, etc.), the posting service detects the `190` error code and marks the connection as `DISCONNECTED`.
