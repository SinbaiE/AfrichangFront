#!/bin/bash

echo "🚀 Installation des dépendances AfriChange (sans Firebase)"

# Expo essentiels
echo "📱 Installation des packages Expo..."
npx expo install expo-router expo-status-bar expo-linear-gradient
npx expo install expo-secure-store expo-image-picker expo-haptics
npx expo install expo-local-authentication expo-location expo-notifications
npx expo install expo-device expo-camera expo-file-system
npx expo install expo-constants expo-linking expo-splash-screen
npx expo install expo-font expo-av expo-blur expo-clipboard
npx expo install expo-sharing expo-mail-composer expo-web-browser

# React Native Core
echo "⚛️ Installation des packages React Native..."
npm install @react-native-async-storage/async-storage
npm install @react-native-community/netinfo
npm install react-native-reanimated react-native-gesture-handler
npm install react-native-screens react-native-safe-area-context

# Graphiques et Visualisation
echo "📊 Installation des packages de graphiques..."
npm install react-native-chart-kit react-native-svg
npm install react-native-progress

# Interface Utilisateur
echo "🎨 Installation des composants UI..."
npm install react-native-super-grid react-native-modal
npm install react-native-animatable react-native-skeleton-placeholder
npm install react-native-flash-message react-native-paper
npm install react-native-vector-icons @expo/vector-icons

# Formulaires et Sélecteurs
echo "📝 Installation des packages de formulaires..."
npm install react-native-date-picker react-native-picker-select
npm install formik yup react-hook-form

# QR Code et Scanner
echo "📷 Installation des packages QR Code..."
npm install react-native-qrcode-svg react-native-qrcode-scanner

# Sécurité et Authentification (sans Firebase)
echo "🔐 Installation des packages de sécurité..."
npm install react-native-keychain react-native-biometrics
npm install react-native-crypto-js react-native-uuid

# Informations Appareil
echo "📱 Installation des packages device info..."
npm install react-native-device-info react-native-permissions

# Gestion de Fichiers
echo "📁 Installation des packages de fichiers..."
npm install react-native-image-crop-picker react-native-document-picker
npm install react-native-fs react-native-share
npm install react-native-print react-native-pdf
npm install react-native-fast-image react-native-image-resizer

# Géolocalisation et Cartes
echo "🗺️ Installation des packages de géolocalisation..."
npm install react-native-maps react-native-geolocation-service

# Background et Notifications (sans Firebase)
echo "🔔 Installation des packages de notifications..."
npm install react-native-background-job react-native-background-fetch
npm install react-native-push-notification

# Stockage et Performance
echo "💾 Installation des packages de stockage..."
npm install react-native-mmkv

# Orientation et Splash
echo "🔄 Installation des packages d'orientation..."
npm install react-native-orientation-locker react-native-splash-screen
npm install react-native-bootsplash

# Utilitaires JavaScript
echo "🛠️ Installation des utilitaires..."
npm install axios lodash moment date-fns
npm install numeral validator

# Gestion d'État
echo "🗃️ Installation des packages de state management..."
npm install zustand @tanstack/react-query swr
npm install immer redux-toolkit react-redux
npm install redux-persist redux-logger

# Configuration
echo "⚙️ Installation des packages de configuration..."
npm install react-native-dotenv react-native-config

# Types TypeScript
echo "📝 Installation des types TypeScript..."
npm install --save-dev @types/lodash @types/numeral @types/validator
npm install --save-dev @types/react @types/react-native

# Outils de Développement
echo "🔧 Installation des outils de développement..."
npm install --save-dev @typescript-eslint/eslint-plugin @typescript-eslint/parser
npm install --save-dev eslint eslint-config-expo
npm install --save-dev eslint-plugin-react eslint-plugin-react-hooks
npm install --save-dev eslint-plugin-react-native prettier
npm install --save-dev babel-plugin-module-resolver

# Flipper (Debugging)
echo "🐛 Installation des outils de debugging..."
npm install --save-dev react-native-flipper
npm install --save-dev flipper-plugin-react-native-performance

echo "✅ Installation terminée ! AfriChange est prêt (sans Firebase)"
echo "🚀 Lancez le projet avec: npx expo start"
