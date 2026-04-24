# ElectIQ

An interactive Election Process Education Assistant built with React, Vite, Express, and Gemini API.

## Live Demo
https://electiq-app-demo-url.a.run.app

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
- `npm run test`: Run tests
