# Symptothermie App

A web application for tracking fertility markers to help with natural contraception using the symptothermal method.

## Purpose

This app helps users track key fertility markers to identify fertile and infertile windows:

- **Basal Body Temperature (BBT)** - Daily morning temperature readings
- **Cervical Mucus Observations** - Tracking changes in consistency and quantity
- **Cervix Position** - Monitoring height, firmness, and openness

## What is the Symptothermal Method?

The symptothermal method is a natural family planning approach that combines multiple fertility awareness signs to identify the fertile window. By tracking temperature shifts and cervical changes, users can determine when ovulation occurs and either avoid or achieve pregnancy naturally.

## Features

- 📊 Daily fertility marker tracking
- 📈 Visual charts and cycle analysis
- 🔔 Reminders for daily readings
- 🔒 Privacy-focused (data stays yours)
- 📱 Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express (or similar)
- **Database**: PostgreSQL (or SQLite for local use)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/symptothermie-app.git
cd symptothermie-app

# Install frontend dependencies
cd frontend
npm install
npm run dev

# Install backend dependencies (in another terminal)
cd ../backend
npm install
npm run dev
```

## Project Structure

```
symptothermie-app/
├── frontend/          # React frontend application
├── backend/           # API server
├── docs/              # Documentation
└── README.md          # This file
```

## Disclaimer

This app is for informational purposes only and should not replace professional medical advice. Consult with a healthcare provider before using fertility awareness methods for contraception.

## License

MIT License - see LICENSE file for details.
