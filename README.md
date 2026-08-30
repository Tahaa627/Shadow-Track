# ShadowTrack

ShadowTrack is a full-stack web application for helping organizations monitor and understand technology use that may be operating outside official IT controls. The product is designed around the idea of “shadow IT” visibility: exposing unmanaged tools, helping teams reconcile technology spend, and creating a more structured, permission-aware view of organizational risk.

This project is currently split into:

- A Django REST API backend for authentication, organization management, and business logic
- A Next.js frontend for the public marketing experience and account onboarding flow

## What the project does

ShadowTrack is intended to help security, finance, and operations teams:

- Create and manage organizations
- Onboard users under those organizations
- Secure access with role-aware authentication
- Reduce blind spots caused by unapproved tools or platforms
- Track technology activity in a way that supports review and oversight
- Build a foundation for future expense reconciliation and audit intelligence features

The current app already includes:

- a landing page describing the product and value proposition
- organization registration flow
- user registration logic tied to organization context
- JWT-based authentication on the backend
- a modular folder structure for future product features

## Tech stack

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL-ready configuration

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- Axios for API requests

## Repository structure

```text
Shadow Track/
├── backend/
│   ├── apps/
│   │   ├── accounts/
│   │   └── organizations/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── .venv/   (local virtual environment)
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
├── .gitignore
└── README.md
```

## Prerequisites

Before you start, make sure you have:

- Python 3.11 or newer
- Node.js 18 or newer
- npm
- PostgreSQL (recommended for local backend development, even though settings are ready for it)
- Git

## Backend setup

From the project root:

```bash
cd backend
python -m venv .venv
```

Activate the virtual environment:

### Windows PowerShell

```powershell
.\.venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local environment file in the backend folder named `.env` with values similar to:

```env
SECRET_KEY=your-secret-key
POSTGRES_DB=shadowtrack
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

Then run database migrations:

```bash
python manage.py migrate
```

Create an admin user if you want to access Django admin:

```bash
python manage.py createsuperuser
```

Start the Django API server:

```bash
python manage.py runserver 0.0.0.0:8000
```

The backend will typically be available at:

- http://localhost:8000

## Frontend setup

From the project root:

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will usually run at:

- http://localhost:3000

## Default development flow

Once both services are running:

1. Open the frontend at http://localhost:3000
2. Create an organization via the registration form
3. Sign in or continue with the authentication flow as it is expanded
4. Use the backend API at http://localhost:8000 for data operations and Django admin

## Environment and configuration notes

- The Django settings are configured to accept requests from `http://localhost:3000`
- JWT authentication is enabled through DRF Simple JWT
- The project is set up for organization-scoped user access
- The default API permission class is authenticated-only unless customized in the API layer

## Useful commands

### Backend

```bash
cd backend
python manage.py makemigrations
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
python manage.py shell
python manage.py test
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Current status

This project is in an early development stage. The foundation is in place, and key modules like authentication, organization structure, and onboarding are being actively built. The landing page and registration workflow already demonstrate the product direction.

## Roadmap ideas

- complete full authentication flow with login and session handling
- add permission-based organization dashboards
- add user management and role enforcement
- support technology inventory and shadow IT discovery
- add expense reconciliation and audit reports
- expand API coverage and test suites

## Notes for contributors

- Keep frontend and backend concerns separate, even when the logic is closely related
- Prefer small, testable API endpoints and clean service layers
- Use environment variables for secrets and local configuration
- Validate frontend and backend changes together before shipping larger features

## License

This project does not currently include a license file. If you plan to share or distribute it publicly, add an appropriate license before doing so.

## Support

If you are working on this project locally, the best next steps are:

1. verify the backend is running on port 8000
2. verify the frontend is running on port 3000
3. confirm environment variables are set properly
4. test the registration and login flows end-to-end

If you want, the next useful addition would be a `.env.example` file and a Docker-based setup for one-command local development.
