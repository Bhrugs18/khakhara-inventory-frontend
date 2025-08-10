# Khakhara Inventory Management - Frontend

A modern React TypeScript frontend for managing khakhara (wheat crisp) production inventory. This application provides a comprehensive interface for tracking ingredients, production batches, and inventory levels.

## Features

- **Dashboard**: Overview of key metrics and recent activity
- **Ingredients Management**: Track ingredients with suppliers and costs
- **Production Batches**: Monitor production runs with quality grades
- **Inventory Tracking**: Real-time stock levels with low-stock alerts
- **Responsive Design**: Optimized for desktop and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for modern UI components
- **Lucide Icons** for consistent iconography

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Update VITE_API_URL with your backend URL
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Backend Integration

This frontend connects to the Khakhara Inventory Management API. Configure the `VITE_API_URL` environment variable to point to your backend deployment.

## Deployment

The application can be deployed to any static hosting service. For GitHub Pages deployment, ensure the build output is configured correctly in your repository settings.
