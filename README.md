# WatchedList

A full-stack cloud-native media tracking application built to explore and implement real-world AWS services end-to-end.

Track all the media that you watched with cover art, personal notes, and status tracking, all in your own private vault.

🔗 **Live:** [main.d2a1xmlmlsvcav.amplifyapp.com](https://main.d2a1xmlmlsvcav.amplifyapp.com)

> **Note:** The API is hosted on Render's free tier and may take 30–60 seconds to respond on the first request after a period of inactivity.

---

## What I aimed to learn with this Project 

The primary goal was hands-on learning. I wanted to move beyond local development and understand how real cloud-native systems are designed and deployed, and also understand:

- How microservice boundaries are defined and enforced
- How managed cloud services (database, storage, auth, serverless) connect together
- How authentication actually works end-to-end with JWTs
- How event-driven automation works in practice
- How to containerise and deploy a full-stack application with CI/CD

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite |
| Backend API | .NET 8, ASP.NET Core |
| Authentication | AWS Cognito (OAuth2 Authorization Code flow) |
| Database | AWS DynamoDB |
| File Storage | AWS S3 |
| Serverless | AWS Lambda (Python 3.12) |
| Frontend Hosting | AWS Amplify |
| API Hosting | Render (Docker container) |
| Image Registry | Docker Hub |
| Source Control | GitHub |

---

## Features

- **Authentication** — Sign up and login via AWS Cognito hosted UI. JWT tokens validated on every API request without calling Cognito on each request
- **Per-user vaults** — Every entry is scoped to the authenticated user via a DynamoDB Global Secondary Index on `UserId`
- **Full CRUD** — Add, view, edit, and delete entries with confirmation
- **Media types** — Anime, Movie, TV Show, Documentary, Short Film — each with context-aware status options
- **Cover images** — Upload a cover image with any entry. Stored in S3, thumbnails generated automatically
- **Serverless thumbnails** — AWS Lambda triggers on every S3 upload, resizes the image to 300px wide and saves to a separate thumbnails folder. Fully decoupled from the API
- **Personal notes** — Add private notes to any entry
- **Search** — Client-side search filtering by title as you type
- **Media type filter** — Filter your vault by media type
- **Grid / List view** — Toggle between a poster grid and a detailed list layout
- **Detail modal** — Click any card to view full details, edit, or delete

---

## Running Locally

### Prerequisites
- .NET 8 SDK
- Node.js 20+
- AWS CLI configured with a profile that has DynamoDB and S3 access
- Docker (optional, for container testing)

### Backend
```bash
cd AnimeVault.Catalog
dotnet run
# API runs on http://localhost:5286
```

### Frontend
```bash
cd AnimeVault.UI
npm install
npm run dev
# UI runs on http://localhost:5173
```

Create a `.env.local` file in `AnimeVault.UI/` with the variables listed below before running.

### Environment Variables

**Frontend `.env.local`:**
```
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_DOMAIN=
VITE_COGNITO_REDIRECT_URI=http://localhost:5173/callback
VITE_API_URL=http://localhost:5286
```

**Backend `appsettings.Development.json`:**
```json
{
  "S3": { "BucketName": "" },
  "Cognito": { "Authority": "" },
  "Cors": { "AllowedOrigin": "http://localhost:5173" }
}
```

---

## AWS Services Used

| Service | Purpose | 
|---|---|
| Cognito | User auth, JWT issuance | 
| DynamoDB | NoSQL metadata storage + GSI | 
| S3 | Cover image and thumbnail storage | 
| Lambda | Serverless image resizing | 
| Amplify | Frontend hosting + CI/CD | 

---

Built as a personal learning project to gain hands-on experience with AWS cloud services and modern full-stack architecture.

*[Shawn Riju](https://linkedin.com/in/shawnriju/)*
