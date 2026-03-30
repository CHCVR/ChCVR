# VR RENTAL CHECKOUT PLATFORM - BACKEND GUIDE

This folder includes the frontend source code and the newly developed Node.js Backend Server (`server.js`) necessary to launch the secure Stripe terminal.

Because real credit card processing requires shielded API keys, the static html site must be run through a standard backend environment.

### 1. Installation
Ensure Node.js is installed on your machine (`nodejs.org`).
Open your server terminal in this folder and install the required modules:
```bash
npm install
```

### 2. Connect Your Keys
Open the `.env` file generated alongside this folder.
Paste your Live or Test secret keys from your Stripe Developer Dashboard:
`STRIPE_SECRET_KEY=sk_test_xxxxxx`

Then, open `checkout.html`, run a text search for `pk_test_YOUR_PUBLISHABLE_KEY_HERE`, and paste your public Publishable Key in the frontend Stripe initialization parameter.

### 3. Launch the Server
In your terminal, boot the local server:
```bash
node server.js
```
The console will log `[FULL BODY VR] Backend Core Online`. You can now navigate to `http://localhost:4242` on your browser to use the site natively with full working live checkout endpoints!
