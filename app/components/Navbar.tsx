import Link from "next/link";
import { auth } from "@/auth";

export default async function Navbar() {
    let session = null;
    try {
        session = await auth();
    } catch (error) {
        console.error("Navbar Auth Error:", error);
    }

    return (
        <nav className="fixed top-0 right-0 z-[60] p-4 pointer-events-none">
            <div className="pointer-events-auto flex gap-3">
                {session?.user ? (
                    <>
                        {session.user.role === 'ADMIN' && (
                            <Link href="/admin" className="px-4 py-2 glass rounded-full text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-all border border-purple-500/30">
                                অ্যাডমিন
                            </Link>
                        )}
                        <Link href="/profile" className="px-5 py-2 glass rounded-full text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition-all border border-emerald-500/30 ring-1 ring-emerald-500/50">
                            প্রোফাইল
                        </Link>
                    </>
                ) : (
                    <>
                        <Link href="/login" className="px-5 py-2 glass rounded-full text-xs font-bold text-white hover:bg-white/10 transition-all border border-white/10">
                            লগইন
                        </Link>
                        <Link href="/register" className="px-5 py-2 bg-emerald-600 rounded-full text-xs font-bold text-white hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">
                            রেজিস্টার
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}
