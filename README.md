# JobAI Frontend

React + Vite frontend for JobAI — an AI-powered job search assistant that analyzes job descriptions, generates tailored cover letters, and gives role-specific interview tips.

## Features

- Paste a job posting URL or raw text to extract structured job data
- AI-powered job description analysis (role fit, key skills, gaps)
- One-click tailored cover letter generation
- Interview tips customized to the specific role
- Firebase Authentication + Firestore for saved analyses

## Tech Stack

- React + Vite
- Tailwind CSS
- Firebase (Auth + Firestore)
- Axios

## Local Setup

npm install
npm run dev

Copy .env.example to .env and set VITE_API_BASE_URL to your backend URL (see JobAI-Backend).
