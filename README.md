# Transaction History Application

A simple web application for tracking transactions with user authentication and Firebase integration.

## Features

- User authentication with username and password
- Transaction management (add, view, update status)
- Firebase Firestore integration for data storage
- Responsive design for mobile and desktop

## Technologies Used

- HTML, CSS, JavaScript
- Firebase Firestore
- Vercel for deployment

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Create an account or log in with existing credentials

## Deployment Instructions

### Deploying to Vercel

1. Make sure you have the Vercel CLI installed:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the application:
   ```
   vercel
   ```

4. For production deployment:
   ```
   vercel --prod
   ```

### Important Notes for Deployment

- Make sure your `vercel.json` file is properly configured
- This application is a static site and does not use server-side PHP
- All data is stored in Firebase Firestore
- The application uses client-side JavaScript for all functionality
