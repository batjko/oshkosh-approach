# EAA Airventure Oshkosh Approach App: Review and Modernization Plan

## 1. Project Overview

The Oshkosh Approach App is a single-page application designed to assist general aviation pilots in navigating the complex VFR arrival procedure for EAA Airventure in Oshkosh, Wisconsin. The application provides a step-by-step guide through the Fisk approach, displays current NOTAMs, and offers essential information for a safe arrival.

The current implementation is a solid foundation, built on Remix with React and using Font Awesome for icons. It effectively presents the necessary information in a structured manner. However, there are significant opportunities to enhance the user experience, improve the UI, and add features that would make it an indispensable tool for pilots.

## 2. UX/UI Refresh

The primary goal of the UX/UI refresh is to create a more intuitive, user-friendly, and context-aware experience for pilots.

### 2.1. User-Centric Design

*   **Target Audience**: The design should be tailored to general aviation pilots, who are often operating in a high-workload environment. This means large, easily tappable targets, clear and concise text, and a high-contrast color scheme that is readable in various lighting conditions (including a dark mode).
*   **Information Hierarchy**: The most critical information should be the most prominent. During the approach, this would be the current and next steps, key frequencies, and visual cues.
*   **Tablet-First Approach**: While the app should be responsive, the primary design target should be tablets (i.e., iPads), as these are commonly used by pilots for navigation and information.

### 2.2. UI Element Redesign

*   **Timeline**: The timeline is a great feature, but it could be more visually engaging. A horizontal, scrollable timeline at the top of the screen could provide a better sense of progress.
*   **Stage Display**: Each stage should be presented as a distinct "card" with a clear title, a summary of key actions, and detailed information available on demand.
*   **NOTAMs**: The NOTAMs table is functional but could be improved. A more readable format, with better spacing and typography, would be beneficial. Important NOTAMs could be highlighted.
*   **Icons**: While Font Awesome is a good choice, custom-designed icons that are more specific to aviation could enhance the visual appeal and clarity.

## 3. Information Architecture

The key to a successful refresh is presenting the right information at the right time.

### 3.1. Context-Awareness

*   **Pre-Flight Mode**: Before the flight, the app should focus on planning and preparation. This would include a detailed overview of the entire procedure, NOTAMs, and links to official resources.
*   **In-Flight Mode**: During the flight, the app should switch to a streamlined "in-flight" mode. This mode would be triggered manually by the user and would feature:
    *   A large, prominent display of the current stage.
    *   Minimal text, focusing on key instructions.
    *   A "next step" button that is easy to tap.
    *   A moving map display (see New Feature Suggestions).

### 3.2. Data Presentation

*   **Frequencies**: Key frequencies (ATIS, Fisk Approach, etc.) should be displayed prominently and persistently, perhaps in a dedicated header.
*   **Visual Cues**: The app should make better use of visual aids. This could include diagrams of the holding patterns, illustrations of key landmarks (e.g., the Fisk water tower), and runway diagrams.
*   **Checklists**: The instructions for each stage could be presented as interactive checklists, allowing pilots to mark items as complete.

## 4. Performance and Responsiveness

The application is already using a modern framework (Remix), which is a good start. However, we can still make improvements.

*   **Code Splitting**: Ensure that code is split effectively so that only the necessary JavaScript is loaded for each view.
*   **Image Optimization**: All images and visual assets should be optimized for fast loading.
*   **Offline First**: The use of a service worker is a great feature. This should be enhanced to ensure that all essential data (stages, diagrams, etc.) is available offline. The NOTAMs should be cached and refreshed when a connection is available.

## 5. New Feature Suggestions

### 5.1. Moving Map with Geofencing

The most significant new feature would be a moving map that displays the pilot's position relative to the approach course and key waypoints.

*   **GPS Integration**: Use the device's GPS to show the aircraft's current location.
*   **Geofencing**: Trigger automatic stage transitions as the pilot reaches specific points (e.g., Ripon). This would be a major enhancement to the user experience.
*   **Map Layers**: Allow users to toggle different map layers, such as sectional charts, satellite imagery, and weather radar (via an external API).

### 5.2. ATIS and NOTAM Integration

*   **Live ATIS**: If possible, integrate a live feed of the Oshkosh ATIS. This could be done via a public data source or by scraping the official feed.
*   **NOTAM Filtering**: Allow users to filter NOTAMs by type and relevance.

### 5.3. User-Customizable Settings

*   **Aircraft Profile**: Allow users to create a simple profile for their aircraft (e.g., type, color, call sign). This information could then be used to personalize the experience.
*   **Dark Mode**: A must-have for in-flight use.

## 6. Bug Fixes and Improvements

The current codebase is relatively small and does not appear to have any major bugs. However, there are a few areas for improvement:

*   **State Management**: While `useState` is sufficient for the current implementation, a more robust state management solution (e.g., Zustand or Redux Toolkit) would be beneficial, especially with the addition of new features.
*   **Styling**: The use of a CSS file alongside Tailwind CSS is not ideal. It would be better to consolidate all styling into Tailwind utility classes or a dedicated CSS-in-JS solution.
*   **Component Structure**: The `fisk-approach-app.tsx` file is quite large. It should be broken down into smaller, more manageable components.

## 7. Step-by-Step Implementation Plan

This plan is designed to be executed by a developer LLM.

1.  **Setup and Scaffolding**:
    *   Create a new branch for the project refresh.
    *   Install necessary dependencies: `zustand` for state management, `react-map-gl` for the moving map, and any other required libraries.
    *   Restructure the `app` directory to better organize components. Create a `components` directory with subdirectories for major features (e.g., `map`, `timeline`, `stages`).

2.  **UI/UX Redesign**:
    *   Implement the new UI design, focusing on a tablet-first layout.
    *   Create a dark mode theme and a mechanism for switching between light and dark modes.
    *   Redesign the timeline, stage display, and NOTAMs list as described above.

3.  **Information Architecture**:
    *   Implement the "pre-flight" and "in-flight" modes.
    *   Create a persistent header for key frequencies.
    *   Add visual aids (diagrams, illustrations) for each stage.

4.  **Moving Map Integration**:
    *   Integrate `react-map-gl` (or a similar library) to display a moving map.
    *   Use the device's GPS to show the user's location.
    *   Implement geofencing to trigger automatic stage transitions.

5.  **Data Integration**:
    *   Enhance the service worker to ensure full offline functionality.
    *   Investigate options for live ATIS integration.
    *   Improve the NOTAM display and add filtering capabilities.

6.  **Refactoring and Cleanup**:
    *   Refactor the `fisk-approach-app.tsx` component into smaller, more focused components.
    *   Consolidate all styling into a single, consistent system (e.g., Tailwind CSS).
    *   Implement a global state management solution with Zustand.

7.  **Testing and Deployment**:
    *   Thoroughly test the application on various devices, with a focus on tablets.
    *   Deploy the updated application.

## 8. Tech Stack Recommendations

*   **Framework**: Remix (existing)
*   **Language**: TypeScript (existing)
*   **UI Library**: React (existing)
*   **Styling**: Tailwind CSS (existing)
*   **State Management**: Zustand
*   **Mapping**: `react-map-gl` with Mapbox
*   **Icons**: Custom SVG icons or a more comprehensive library like React Icons.

This plan provides a roadmap for transforming the Oshkosh Approach App into a modern, user-friendly, and indispensable tool for pilots. By focusing on a user-centric design, context-aware information architecture, and powerful new features, we can create an application that significantly enhances safety and reduces pilot workload during one of aviation's busiest events.
