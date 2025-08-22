import Navbar from "@/components/Navbar";
import Link from "next/link";
export default function Home(){return(<><Navbar /><main className="max-w-3xl mx-auto p-6"><h1 className="text-3xl font-bold mb-4">Welcome to NoteApp</h1><div className="space-y-2"><p><Link href="/public">Browse Public Notes</Link></p><p><Link href="/auth/signin">Sign In</Link> to manage your notes.</p></div></main></>);}