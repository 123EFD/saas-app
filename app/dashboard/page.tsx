//analytic dashboard for both recommender(flutter) and saas (react)
import Link from "next/link";
import { auth } from "@clerk/nextjs/server"; 
import { Card, CardContent, CardHeader,CardDescription , CardTitle } from "@/components/ui/card";
import { DashboardChart } from "@/components/DashboardChart";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from 'next/navigation';

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
    const user = await currentUser();

    if (!userId) redirect("/sign-in");

    const [neonData, xanoData] = await Promise.all([
        getNeonData(),
        getXanoData(userId),
    ]);

return (
        // Using Shadcn semantic variables for perfect dark/light mode
        <div className="min-h-screen bg-background text-foreground p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">Welcome back! Here is an overview of your study metrics.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Card className="bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">PDFs Analyzed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-blue-950 dark:text-blue-50">{neonData.total_pdfs}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-pink-50/50 dark:bg-pink-900/10 border-pink-100 dark:border-pink-900/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-pink-500 dark:text-pink-400 uppercase tracking-wider">Active Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-pink-950 dark:text-pink-50">{xanoData.total_notes}</div>
                        </CardContent>
                    </Card>

                    <Card className="bg-purple-50/50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/50 shadow-none">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">AI Interactions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black text-purple-950 dark:text-purple-50">{neonData.total_ai_interactions}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Data Visualization Section */}
                <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
                    <Card className="col-span-1 lg:col-span-4 shadow-sm">
                        <CardHeader>
                            <CardTitle>Activity Overview</CardTitle>
                            <CardDescription>Your AI interactions and notes created over the last 7 days.</CardDescription>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <DashboardChart />
                        </CardContent>
                    </Card>

                    {/* Navigation Cards combined into a quick-links menu */}
                    <Card className="col-span-1 lg:col-span-3 shadow-sm">
                        <CardHeader>
                            <CardTitle>Workspaces</CardTitle>
                            <CardDescription>Jump back into your study sessions.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <Link href="https://saas-pi-inky-49.vercel.app" className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all">
                                <div className="text-3xl">📝</div>
                                <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">AI Voice Notes</h3>
                                    <p className="text-sm text-muted-foreground">Access synced study materials</p>
                                </div>
                            </Link>

                            <a href="https://recommender-api-ten.vercel.app" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 p-4 rounded-xl border bg-card hover:bg-muted/50 transition-all">
                                <div className="text-3xl">📚</div>
                                <div>
                                    <h3 className="font-semibold group-hover:text-primary transition-colors">PDF Analyzer</h3>
                                    <p className="text-sm text-muted-foreground">Upload and parse textbooks</p>
                                </div>
                            </a>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}