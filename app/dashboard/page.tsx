//analytic dashboard for both recommender(flutter) and saas (react)
import Link from "next/link";
import { auth } from "@clerk/nextjs/server"; 

async function getNeonData() {
    try {
        const res = await fetch('https://kasshier-ai-study-suite.hf.space/analytics/global', {
            next: { revalidate: 60 } //catch python api at once 
        });

        //checking for Huggingface asleep or not 
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.error("🛑 Server sent HTML instead of JSON! Hugging Face is likely asleep or building.");
            return { total_pdfs: 0, total_ai_interactions: 0, total_active_notes: 0 }; // Return safe fallback numbers
        }

        if (!res.ok) throw new Error('Failed to fetch data');

        return res.json();
        
    } catch (error) {
        console.error('Error fetching Neon data:', error);
        return { total_pdfs: 0, total_ai_interactions: 0, total_active_notes: 0 };
    }
}

async function getXanoData(userId: string) {
    try {
        const { userId } = await auth();
        const res = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:g_TkL_bT/get_study_notes?user_id=${userId}`, {
            next: { revalidate: 60 }
    });

        if (!res.ok){
            console.warn(`⚠️ Xano rejected the request: ${res.status} ${res.statusText}`);
            return { total_notes: 0 }; 
        }

        const notes = await res.json();

        //the response for Xano is object not a list
        return {
            total_notes: notes.items.length ||0
        };

    } catch (error) {
        console.error('Error fetching Xano data:', error);
        return { total_notes: 0 };
    }
}

export default async function DashBoard() {
    //update data based on user logged in
    const {userId } = await auth();

    if (!userId) {
        return <div>Please sign in to view your dashboard.</div>
    }

    const [neonData, xanoData] = await Promise.all([
        getNeonData(),
        getXanoData(userId),
    ]);

    return (
        //Data visualization section
        <div className="min-h-screen bg-gray-100 p-8">
            <section className="max-w-6xl mx-auto text-gray-900 bg-white rounded-2xl p-8 mb-12 shadow-sm">
                <h3 className="text-xl font-bold mb-6 border-b pb-4">Study Statistics</h3>

                {/* The SINGLE grid container for all 3 cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {/* Card 1: PDFs Analyzed */}
                    <div className="p-6 bg-blue-50 rounded-xl text-center">
                        <p className="text-sm text-blue-600 font-bold uppercase">PDFs Analyzed</p>
                        {/* Injecting the data fetched from your Python API! */}
                        <p className="text-4xl font-black text-blue-900 mt-2">{neonData.total_pdfs}</p>
                    </div>

                    {/* Build Card 2 (Active Notes)*/}
                    <div className="p-6 bg-pink-50 rounded-xl text-center">
                        <p className="text-sm text-pink-300 font-bold uppercase">Active Notes</p>
                        {/* Injecting the data fetched from your Python API! */}
                        <p className="text-4xl font-black text-pink-900 mt-2">{xanoData.total_notes}</p>
                    </div>

                    {/* Card 3: AI Interactions */}
                    <div className="p-6 bg-purple-50 rounded-xl text-center">
                        <p className="text-sm text-purple-600 font-bold uppercase">AI Interactions</p>
                        <p className="text-4xl font-black text-purple-900 mt-2">{neonData.total_ai_interactions}</p>
                    </div>

                </div>

                {/*
                Navigation cards for both internal(React SaaS) and external(Flutter Recommender App) apps
                <Link href="..."> : click and lad new pages without blank reloading 
                <a> tag with target="_blank" : open new tab, while dashboard open in the background
                */}
                <main className="mt-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Internal React App: Use <Link> */}
                    <Link href="https://saas-pi-inky-49.vercel.app" className="group p-8 bg-white border rounded-2xl hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">📝</div>
                        <h2 className="text-2xl font-bold group-hover:text-blue-300">AI Voice Assistant Notes</h2>
                        <p className="text-gray-600">Access your synced study materials...</p>
                    </Link>

                    {/* External Flutter App: Use <a> tag */}
                    <a href="https://recommender-api-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="group p-8 bg-white border rounded-2xl hover:shadow-lg transition-all">
                        <div className="text-4xl mb-4">📚</div>
                        <h2 className="text-2xl font-bold group-hover:text-amber-300">Study Material Recommender & PDF Analyzer Workspace</h2>
                        <p className="text-gray-600">Upload massive textbooks,articles,pdfs...</p>
                    </a>

                </main>
            </section>
        </div>
    );
}