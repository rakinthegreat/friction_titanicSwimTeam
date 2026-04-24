import admin from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export async function GET() {
    const session = (await cookies()).get("session")?.value;

    if (!session) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const decoded = await admin
            .auth()
            .verifySessionCookie(session, true);

        return new Response(JSON.stringify({
            uid: decoded.uid,
            email: decoded.email
        }));
    } catch {
        return new Response("Invalid session", { status: 401 });
    }
}