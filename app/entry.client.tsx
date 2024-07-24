import { RemixBrowser } from "@remix-run/react";
import { startTransition, useEffect } from "react";
import { hydrateRoot } from "react-dom/client";
import posthog from 'posthog-js';

function PosthogInit() {
  useEffect(() => {
    posthog.init('phc_Fdzlm8xerItmC8dlIam0qQ59QdCDWfdC7aBUw5aReqa', {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only', 
      autocapture: true,
    });
    console.log('Posthog initialized');
  }, []);

  return null;
}

startTransition(() => {
  hydrateRoot(
    document,
    <>
      <RemixBrowser />
      <PosthogInit />
    </>
  );
});
