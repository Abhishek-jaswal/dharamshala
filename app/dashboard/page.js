import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import Link from "next/link";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return <div className="p-8 text-xl">Not logged in.</div>;
    }

    const user = session.user;

    return (
        <div className="p-10">
            <h1 className="text-3xl font-semibold mb-4">Dashboard</h1>

            <img src={user.image} width={80} className="rounded-full mb-4" />

            <p><b>Name:</b> {user.name}</p>
            <p><b>Email:</b> {user.email}</p>

            <Link href="/logout" className="text-red-500 underline mt-4 block">
                Logout
            </Link>
        </div>
    );
}