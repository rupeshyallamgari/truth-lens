# TruthLens Browser Extension - Replit Connected

This version is configured to use:
https://59568f15-ff3d-44af-bfc1-e175f2327d56-00-3e58u0eycsbjc.pike.replit.dev

Install:
1. Extract the ZIP.
2. Open chrome://extensions
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the extracted folder.
6. Open a normal article.
7. Click TruthLens > Read this page > Verify.

Backend endpoint:
POST https://59568f15-ff3d-44af-bfc1-e175f2327d56-00-3e58u0eycsbjc.pike.replit.dev/verify

The extension does not contain secret API keys. The Replit backend must expose POST /verify and return JSON with verdict, confidence, claim, explanation, and evidence.
