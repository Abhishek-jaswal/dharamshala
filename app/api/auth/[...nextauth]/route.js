import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],

    callbacks: {
        async signIn({ user }) {
            const email = user.email;

            try {
                // check if email exists in PocketBase
                const existing = await pb
                    .collection("users")
                    .getFirstListItem(`email="${email}"`)
                    .catch(() => null);

                // if not exists → create new user
                if (!existing) {
                    await pb.collection("users").create({
                        email: email,
                        name: user.name,
                        image: user.image,
                    });
                }

                return true;
            } catch (err) {
                console.error("PocketBase error:", err);
                return false;
            }
        },
    },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };