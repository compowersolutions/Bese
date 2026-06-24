/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Configuration loaded from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyDDA8YRUbvKSrvP3gnB-gI020HO8ssH4SE",
  authDomain: "billing-options-93799.firebaseapp.com",
  projectId: "billing-options-93799",
  storageBucket: "billing-options-93799.firebasestorage.app",
  messagingSenderId: "633756188033",
  appId: "1:633756188033:web:7c6943dbb075951ace3c80"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Get Firestore database using the specified databaseId from config
export const db = getFirestore(app, "ai-studio-3f9078b8-f644-4a1d-a8bc-fb99062af8f1");
