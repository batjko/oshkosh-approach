# EAA Oshkosh Approach Guide

Welcome to the EAA Oshkosh Approach Guide! This application provides a comprehensive guide for pilots navigating the Fisk Approach to EAA AirVenture in Oshkosh. The guide includes detailed instructions, current NOTAMs, and real-time updates to ensure a safe and efficient arrival.

## Features

- **Interactive Timeline**: Follow the step-by-step stages of the Fisk Approach with visual indicators and detailed instructions.
- **Current NOTAMs**: Stay updated with the latest Notices to Airmen (NOTAMs) relevant to the Oshkosh area.
- **Standing Instructions**: Access essential information and frequencies for the Fisk Approach.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Development

Run the development server:

```sh
npm run dev
```

## Deployment

First, build your app for production:

```sh
npm run build
```

Then run the app in production mode:

```sh
npm start
``` 


Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`:

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer. See the [Vite docs on CSS](https://vitejs.dev/guide/features.html#css) for more information.

## API Integration

The app fetches NOTAMs from the FAA's NOTAM API. Ensure you have the correct API credentials set up in your environment.

## Service Worker

The app includes a service worker for offline support and caching. The service worker is registered automatically when the app is loaded.

## PWA Support

The app is configured as a Progressive Web App (PWA) with a manifest file and service worker. This allows users to install the app on their devices for a native-like experience.

Hasn't been tested on all dimensions and orientations, but should work best on tablet and desktop, while still being readable on phones.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

