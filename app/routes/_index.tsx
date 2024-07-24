import { useEffect } from "react";
import type { MetaFunction } from '@remix-run/react';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
// import { serverOnly$ } from "vite-env-only/macros";

import { getNotamsFromEAA, TransformedNotam } from "../.server/notamList";
import FiskApproachApp from './fisk-approach/fisk-approach-app';

library.add(fas);

export const loader: LoaderFunction = async () => {
  console.log("Loading NOTAMs...");
  const notamList: TransformedNotam[] = await getNotamsFromEAA();
  
  const result = await json({ notamList })

  return result;
};

export const meta: MetaFunction = () => {
  return [
    { charset: "utf-8"},
    { title: "EAA Airventure Oshkosh Approach Guide" },
    { viewport: "width=device-width,initial-scale=1" },
    { name: "description", content: "A comprehensive guide for the Fisk approach to EAA Airventure in Oshkosh." },
  ];
};

export default function Index() {
  const notamList = useLoaderData<typeof loader>()
  
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
      <FiskApproachApp notamList={notamList} />
    </div>
  );
}