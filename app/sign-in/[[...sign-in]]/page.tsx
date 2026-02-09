import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <main className="flex items-center justify-center h-screen bg-gray-200">
      <div className="mb-6 p-4 bg-white border border-indigo-100 rounded-xl shadow-sm max-w-sm w-full text-center">
        <h2 className="text-sm font-semibold text-indigo-600 mb-1">
          Testing Credentials
        </h2>
        <p className="text-xs text-gray-500 mb-2">
          Use these to explore the app without creating an account:
        </p>
        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-sm font-mono text-gray-700">
          <p>
            Email: <span className="font-bold">testing123@gmail.com</span>
          </p>
          <p>
            Pass: <span className="font-bold">richard_teL10nHeArt</span>
          </p>
        </div>
      </div>
      <SignIn />
    </main>
  );
}
