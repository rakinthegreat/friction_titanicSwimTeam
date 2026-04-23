import admin from "@/lib/firebaseAdmin";

export async function POST(req: any) {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.split("Bearer ")[1];

    if (!token) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // Verify Firebase ID token
        const decoded = await admin.auth().verifyIdToken(token);

        // Create session cookie
        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

        const sessionCookie = await admin
            .auth()
            .createSessionCookie(token, { expiresIn });

        return new Response("OK", {
            status: 200,
            headers: {
                "Set-Cookie": `session=${sessionCookie}; HttpOnly; Path=/; Secure; SameSite=Strict`,
            },
        });
    } catch (err) {
        return new Response("Invalid token", { status: 401 });
    }
}