#!/bin/bash

echo "✅ Installation des dépendances Expo SDK..."
npx expo install expo-router expo-status-bar expo-linear-gradient
npx expo install expo-secure-store expo-image-picker expo-haptics
npx expo install expo-local-authentication expo-location expo-notifications
npx expo install expo-device expo-camera expo-file-system
npx expo install expo-constants expo-linking expo-splash-screen
npx expo install expo-font expo-av expo-blur expo-clipboard
npx expo install expo-sharing expo-mail-composer expo-web-browser

echo "✅ Navigation & UI..."
npm install @react-navigation/native @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated

echo "✅ Formulaires, validation & état..."
npm install formik yup react-hook-form
npm install zustand @tanstack/react-query

echo "✅ Stockage & sécurité..."
npm install @react-native-async-storage/async-storage
npm install react-native-mmkv
npm install react-native-keychain
npm install react-native-device-info
npm install react-native-permissions

echo "✅ QR Code, UUID, crypto..."
npm install react-native-qrcode-svg react-native-qrcode-scanner
npm install react-native-uuid crypto-js

echo "✅ Médias & fichiers..."
npm install @react-native-document-picker
npm install react-native-fast-image react-native-image-resizer
npm install react-native-share react-native-fs
npm install react-native-print react-native-pdf

echo "✅ Graphiques & UI..."
npm install react-native-chart-kit react-native-svg react-native-progress
npm install react-native-skeleton-placeholder
npm install react-native-paper

echo "✅ Géolocalisation..."
npm install react-native-maps react-native-geolocation-service

echo "✅ Notifications & tâches de fond..."
npm install react-native-background-fetch
npm install react-native-push-notification

echo "✅ Utilitaires..."
npm install axios lodash moment date-fns
npm install numeral validator

echo "✅ Firebase (optionnel)..."
npm install @react-native-firebase/app @react-native-firebase/auth
npm install @react-native-firebase/firestore @react-native-firebase/messaging
npm install @react-native-firebase/analytics @react-native-firebase/crashlytics
npm install @react-native-firebase/storage

echo "✅ Développement & types..."
npm install --save-dev typescript
npm install --save-dev jest jest-expo @types/jest @types/react @types/react-native
npm install --save-dev @types/lodash @types/numeral @types/validator
npm install --save-dev react-native-svg-transformer

echo "✅ ESLint & Prettier..."
npm install --save-dev eslint eslint-config-expo prettier
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser

echo "✅ Installation terminée."
