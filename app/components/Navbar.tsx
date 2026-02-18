import Link from "next/link";
import { auth } from "@/auth";

export default async function Navbar() {
    let session = null;
    try {
        session = await auth();
        console.log("Navbar Session:", session);
    } catch (error) {
        console.error("Navbar Auth Error:", error);
    }


    return (
        <nav className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
            <div className="pointer-events-auto">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                        <span className="text-xl">🌙</span>
                    </div>
                    <span className="font-serif font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-white hidden md:block">
                        Ramadan Planner
                    </span>
                </Link>
            </div>

            <div className="pointer-events-auto flex gap-3">
                {session?.user ? (
                    <>
                        {session.user.role === 'ADMIN' && (
                            <Link href="/admin" className="px-4 py-2 glass rounded-full text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all border border-purple-500/30">
                                ADMIN
                            </Link>
                        )}
                        <Link href="/profile" className="px-5 py-2 glass rounded-full text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all border border-emerald-500/30 ring-1 ring-emerald-500/50">
                            PROFILE
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="px-5 py-2 glass rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all border border-white/10">
                            LOGIN
                        </Link>
                        <Link href="/register" className="px-5 py-2 bg-emerald-600 rounded-full text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                            SIGN UP
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
