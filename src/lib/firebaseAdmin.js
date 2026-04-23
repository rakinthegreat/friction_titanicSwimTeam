import admin from "firebase-admin";

if (!admin.apps.length) {
    if (!process.env.FB_PRIVATE_KEY || !process.env.NEXT_PUBLIC_FB_PROJECT_ID || !process.env.FB_CLIENT_EMAIL) {
        console.error("FIREBASE ADMIN ERROR: Missing environment variables. Please check your .env.local file for NEXT_PUBLIC_FB_PROJECT_ID, FB_CLIENT_EMAIL, and FB_PRIVATE_KEY.");
    } else {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
                clientEmail: process.env.FB_CLIENT_EMAIL,
                privateKey: process.env.FB_PRIVATE_KEY.replace(/\\n/g, "\n"),
            }),
        });
    }
}

export default admin;