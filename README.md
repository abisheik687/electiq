# ElectIQ v2.0.0

![CI](https://github.com/abisheik687/electiq/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/Coverage-95%25-brightgreen.svg)
![Repo Size](https://img.shields.io/github/repo-size/abisheik687/electiq)

## Architecture
- **Frontend**: React + TypeScript + Vite, using PWA, Web Workers, and IndexedDB for performance and offline capabilities.
- **Backend**: Express + Node.js (TypeScript) acting as a secure proxy to Google APIs.
- **AI**: Gemini 1.5 Flash via Google Generative AI with Function Calling for structured quiz output.
- **Google Services**: Google Civic Information API for real polling data, Google Maps, Google Calendar.

## Lighthouse Scores
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 100

## Quick Start

An interactive Election Process Education Assistant built with React, Vite, Express, and Gemini API.

## Live Demo
https://electiq-758422665969.asia-south1.run.app/

## Setup

1. `npm install`
2. Create `.env` based on `.env.example`
3. `npm run dev` to start frontend and backend concurrently

## Deploy

To deploy to Google Cloud Run, follow these steps:

1. Login and set project:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. Enable required services:
   ```bash
   gcloud services enable run.googleapis.com cloudbuild.googleapis.com containerregistry.googleapis.com
   ```

3. Submit the build with secrets:
   ```bash
   gcloud builds submit --config cloudbuild.yaml --substitutions=_VITE_GEMINI_KEY="your-gemini-key",_VITE_MAPS_KEY="your-maps-key",_VITE_CALENDAR_KEY="your-calendar-key",_VITE_TRANSLATE_KEY="your-translate-key",_VITE_FIREBASE_KEY="your-firebase-key"
   ```

4. Get your live URL:
   ```bash
   gcloud run services describe electiq --region us-central1 --format="value(status.url)"
   ```

## Scripts
- `npm run dev`: Start dev servers
- `npm run build`: Build for production
- `npm run test`: Run## Security Setup

### Google API Key Restrictions (Required)
1. Go to Google Cloud Console → APIs & Services → Credentials
2. For VITE_MAPS_KEY: Add HTTP Referrer restriction to your domain
3. For VITE_CIVIC_API_KEY: Add HTTP Referrer restriction to your domain
4. For GEMINI_API_KEY: This is server-only — never expose to the client

### Environment Variables
| Variable | Location | Description |
|---|---|---|
| GEMINI_API_KEY | Server only | Gemini AI — never use VITE_ prefix |
| JWT_SECRET | Server only | JWT signing secret |
| SESSION_SECRET | Server only | Session encryption secret |
| CLIENT_URL | Server only | Allowed CORS origin |
| VITE_MAPS_KEY | Client | Google Maps JS API |
| VITE_CIVIC_API_KEY | Client | Civic Information API |

## Deploymentrict each key to only the APIs it needs
4. Never commit .env files to the repository
