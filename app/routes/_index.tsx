import React from 'react';
import FiskApproachApp from './fisk-approach-app';
import type { MetaFunction } from '@remix-run/react';

export const meta: MetaFunction = () => {
  return [
    { title: "Fisk Approach Guide" },
    { name: "description", content: "A comprehensive guide for the Fisk approach." },
  ];
};

export default function Index() {
  return (
    <div className="font-sans p-4">
      <FiskApproachApp />
    </div>
  );
}