import admin from "firebase-admin";

if (!admin.apps.length) {
    if (!process.env.FB_PRIVATE_KEY || !process.env.NEXT_PUBLIC_FB_PROJECT_ID || !process.env.FB_CLIENT_EMAIL) {
        console.error("FIREBASE ADMIN ERROR: Missing environment variables. Please check your .env.local file for NEXT_PUBLIC_FB_PROJECT_ID, FB_CLIENT_EMAIL, and FB_PRIVATE_KEY.");
    } else {
        let privateKey = process.env.FB_PRIVATE_KEY;
        if (privateKey) {
            // 1. Remove wrapping quotes and trim whitespace
            privateKey = privateKey.trim().replace(/^"|"$/g, '').trim();
            
            // 2. Handle escaped newlines
            privateKey = privateKey.replace(/\\n/g, '\n');
            
            // 3. Ensure the PEM format is clean (remove any accidental double newlines or spaces at line starts)
            privateKey = privateKey.split('\n').map(line => line.trim()).join('\n');

            // Log info for one last check
            console.log('--- PEM Final Check ---');
            console.log('Final Length:', privateKey.length);
            console.log('First 5:', privateKey.substring(0, 5));
            console.log('Last 5:', privateKey.substring(privateKey.length - 5));
            console.log('-----------------------');
        }

        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
                clientEmail: process.env.FB_CLIENT_EMAIL,
                privateKey: privateKey,
            }),
        });
    }
}

export default admin;