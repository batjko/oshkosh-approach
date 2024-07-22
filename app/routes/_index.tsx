import { useEffect } from "react";
import type { LinksFunction } from "@remix-run/node";
import type { MetaFunction } from '@remix-run/react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import leafletStyles from "leaflet/dist/leaflet.css?url";
import FiskApproachApp from './fisk-approach-app';

// Add all icons to the library so you can use them in your components
library.add(fas);
export const links: LinksFunction = () => [
  {
    rel: "stylesheet",
    href: leafletStyles,
  },
];

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8"},
    { title: "Fisk Approach Guide" },
    { viewport: "width=device-width,initial-scale=1" },
    { name: "description", content: "A comprehensive guide for the Fisk approach." },
  ];
};

export default function Index() {
  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);
 
  return (
    <div>
      <FiskApproachApp />
    </div>
  );
}