# Expo App - Quick Start Guide

This guide will help you set up, install, and run your Expo app on your desktop.

## Prerequisites

Make sure you have the following installed:
- **Node.js** (LTS Version) - [Download](https://nodejs.org/)
- **npm** or **yarn** (npm comes with Node.js)
- **Expo CLI** - `npm install -g expo-cli`
- **Git** (Optional, if using version control) - [Download](https://git-scm.com/)
- **Expo Go App** (if testing on mobile) - Available on the App Store or Google Play Store

## Step 1: Clone or Create Expo App

- **To create a new Expo app:**
```bash
npx create-expo-app my-app
cd my-app
```

- **To clone an existing Expo app:**
```bash
git clone <repository-url>
cd <app-folder>
npm install
```

## Step 2: Install Dependencies

Ensure you are inside the project directory and run:
```bash
npm install
```
If using yarn:
```bash
yarn install
```

## Step 3: Start the Expo Server

To start your app, run:
```bash
npx expo start
```
Or using npm:
```bash
npm start
```
Or using yarn:
```bash
yarn start
```
This will launch the Expo Developer Tools in your browser.

## Step 4: Test the App

- **On Emulator (iOS/Android)**: Ensure you have Android Studio or Xcode installed. Then select "Run on Android device/emulator" or "Run on iOS simulator" from Expo DevTools.
- **On Mobile Device**: Download the Expo Go app and scan the QR code from Expo DevTools.
- **On Web**: Run on your browser using:
```bash
npx expo start --web
```

## Troubleshooting

- If you encounter any errors, ensure that all dependencies are installed and versions are compatible.
- Restart the Expo server using `Ctrl + C` and `npx expo start`.
- Clear cache if necessary:
```bash
expo start --clear
```

## Additional Commands

- To install a new package:
```bash
npm install <package-name>
```
- To run the app on a specific platform:
```bash
npx expo start --android
npx expo start --ios
```
- To publish the app:
```bash
expo publish
```

## Conclusion
You are now ready to start developing with Expo! Happy coding!

For more detailed documentation, visit the [Expo Documentation](https://docs.expo.dev/).

