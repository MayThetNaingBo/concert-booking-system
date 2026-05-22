# Concert Booking System

A full-stack concert ticket booking web application that allows users to register, book seats, make payments, and receive QR code tickets.

## Features

- User registration and login
- JWT authentication
- Admin-only concert management
- Real-time seat locking using Socket.io
- Stripe Checkout payment integration
- QR code ticket generation
- Booking expiry and cancellation

## Tech Stack

- Frontend: React / Next.js
- Backend: Node.js / Express / NestJS
- Database: PostgreSQL / MySQL
- Real-time: Socket.io
- Payment: Stripe

## How to Run Locally

```bash
npm install

cd server
npm run dev

cd client
npm run dev