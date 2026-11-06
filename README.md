# SkillBridge

SkillBridge connects volunteers who want to contribute their skills with nonprofit organizations that need help. Volunteers can discover opportunities and track applications. NGO accounts can publish and manage opportunities and review applications.

## Requirements

- Node.js 20 or newer and npm
- MongoDB Community Server or a MongoDB Atlas connection for accounts and API data

If Docker is installed, the included MongoDB service can be started from the repository root with `docker compose up -d mongo`. Stop it with `docker compose down`.

## Start the project

1. Start MongoDB locally, or create a MongoDB Atlas database.
2. In `backend/`, copy `.env.example` to `.env`, set `MONGO_URI` to your database URL, and replace `JWT_SECRET` with a long random value.
3. In a terminal, install and start the API:

   ```bash
   cd backend
   npm install
   npm run dev
   ```

   The API listens at `http://localhost:4000`. Visit that address to confirm it is running.

4. In another terminal, install and start the web app:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

   Open `http://localhost:3000`.

The frontend uses `http://localhost:4000` by default. To use another API URL, set `REACT_APP_API_URL` in `frontend/.env` and restart the frontend. Set `CORS_ORIGIN` in the backend environment if the frontend runs at a different address.

To add a few development listings, set `SEED_PASSWORD` to a private development password of at least 12 characters in `backend/.env` and run `npm run seed` from `backend/`. The seed account is `hello@brightpath.org`. Configure `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` to deliver real password reset emails. Set `SUPPORT_EMAIL` to forward contact form submissions to your team. Without SMTP, development reset requests show a one-time reset link in the app.

## API

- `POST /api/auth/register` and `POST /api/auth/login`
- `PUT /api/auth/password`, `POST /api/auth/forgot-password`, and `POST /api/auth/reset-password`
- `GET /api/users/profile` and `PUT /api/users/profile`
- `GET /api/opportunities`, `POST /api/opportunities`, `PUT /api/opportunities/:id`, and `DELETE /api/opportunities/:id`
- `POST /api/applications`, `GET /api/applications/mine`, `GET /api/applications/ngo`, and `PUT /api/applications/:id`
- `GET /api/messages/:applicationId` and `POST /api/messages/:applicationId` for accepted applications
- `POST /api/contact`

Accounts, profiles, listings, applications, and conversations are stored in MongoDB. NGO conversations become available after an application is accepted. Development seed listings can be added using the seed command above.
