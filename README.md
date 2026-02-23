# MenuCraft

MenuCraft is a full-stack application for venues to manage menu templates and generate filled menu PDFs. It includes authentication (JWT), role-based access control, menu generation with PDF templates, generation history, and Facebook Page integration for publishing posts.

## Tech stack

### Backend

- Java `25`
- Spring Boot `4.0.2`
- Spring Web MVC, Spring Security, Spring Data JPA
- PostgreSQL
- JWT (`io.jsonwebtoken:jjwt`)
- PDF generation/rendering (`org.apache.pdfbox:pdfbox`)
- MapStruct + Lombok

### Frontend

- React (Vite)
- Axios
- React Router
- i18next

The Vite dev server is configured to proxy `/api/*` to `http://localhost:8080`.

## Repository structure

- `src/main/java/bg/menucraft` — Spring Boot backend
  - `controller/` — REST controllers (`/auth`, `/venue`, `/admin`, `/facebook`)
  - `service/` — core business logic (menu generation, templates, auth, Facebook OAuth/posting)
  - `security/` — JWT filter + security configuration
  - `model/`, `repository/` — JPA entities and repositories
- `src/main/resources/application.yaml` — backend configuration
- `docs/facebook-integration.md` — detailed technical docs for Facebook integration
- `frontend/` — React frontend

## Prerequisites

- **JDK 25**
- **Maven** (or use the included Maven Wrapper `mvnw` / `mvnw.cmd`)
- **Node.js** (for the frontend)
- **PostgreSQL**

## Configuration

Backend configuration is in `src/main/resources/application.yaml` and uses environment variables.

### Required environment variables

- `DB_USERNAME` — PostgreSQL username
- `DB_PASSWORD` — PostgreSQL password
- `DB_DIALECT` — Hibernate dialect (example: `org.hibernate.dialect.PostgreSQLDialect`)

- `JWT_SECRET` — JWT signing secret
- `JWT_EXPIRATION` — access token expiration (as configured by `JwtService`)
- `JWT_REFRESH_EXPIRATION` — refresh token expiration (as configured by `JwtService`)

- `AES_ENCRYPTION_SECRET` — AES secret used to encrypt Facebook tokens at rest

### Facebook integration (optional)

If you want to use the Facebook Page integration, also set:

- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `FACEBOOK_REDIRECT_URI` — must match the value configured in the Facebook app (typically `http://localhost:8080/facebook/oauth/callback`)

For the full technical flow and security notes, see `docs/facebook-integration.md`.

### Database

Default datasource URL (from `application.yaml`):

- `jdbc:postgresql://localhost:5432/menu_craft`

The active profile is `dev` by default and sets:

- `spring.jpa.hibernate.ddl-auto=update`

## Running the project

### 1) Start PostgreSQL

Create a database named `menu_craft` and ensure your `DB_USERNAME`/`DB_PASSWORD` match.

### 2) Run the backend (Spring Boot)

On Windows:

```bash
mvnw.cmd spring-boot:run
```

On macOS/Linux:

```bash
./mvnw spring-boot:run
```

Backend will start on `http://localhost:8080` (default Spring port).

### 3) Run the frontend (Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server runs on:

- `http://localhost:5173`

API calls can be made via the proxy:

- `http://localhost:5173/api/...` → `http://localhost:8080/...`

## Security / roles

Spring Security is configured as stateless JWT auth.

- `/auth/**` — public
- `/facebook/oauth/**` — public (OAuth redirect endpoints)
- `/facebook/**` — authenticated
- `/admin/**` — `ADMIN` role
- `/venue/**` — `ADMIN` or `COMPANY` role

CORS allows `http://localhost:5173`.

## API overview

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`

### Venue

- `GET /venue` — list venues
- `POST /venue/register` — register venue
- `GET /venue/template?venueName=...` — get templates for a venue
- `POST /venue/menu` — generate a filled menu PDF (returns base64 PDF + preview image)
- `GET /venue/history` — list previously generated menus
- `GET /venue/history/{menuId}` — regenerate menu from history record

### Admin

- `POST /admin/template` — add a PDF template (base64 data) and optional sections/venue links
- `GET /admin/template/{id}/file` — download template PDF

### Facebook

- `GET /facebook/oauth/login?venueName=...` — generate Facebook OAuth login URL
- `GET /facebook/oauth/callback?code=...&state=...` — OAuth callback endpoint
- `POST /facebook/post` — publish a post to a connected page

For additional endpoints and exact request/response payloads for the Facebook feature, see `docs/facebook-integration.md`.

## Notes

- Menu PDF generation uses PDF form fields (AcroForm) and fills specific field patterns (e.g. `salad1`, `saladPrice1`, `soup1`, etc.).
- Templates are stored in the database as binary data and are associated with venues.

## Development

- Backend: `src/main/java/bg/menucraft`
- Frontend: `frontend/`

If you want, tell me what you consider the “main” user story (e.g. PDF menu generation only, or Facebook posting as a first-class feature) and I can adjust the README’s emphasis and add example requests.
