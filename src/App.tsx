import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { GeographyChat } from "./GeographyChat";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-green-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm h-16 flex justify-between items-center border-b shadow-sm px-4">
        <div className="flex items-center gap-3">
          <div className="text-2xl">🌍</div>
          <h2 className="text-xl font-bold text-blue-700">Geography AI Tutor</h2>
        </div>
        <Authenticated>
          <SignOutButton />
        </Authenticated>
      </header>
      <main className="flex-1 p-4">
        <Content />
      </main>
      <Toaster />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Authenticated>
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome to Geography AI Tutor! 🗺️
          </h1>
          <p className="text-gray-600">
            Ask me anything about geography - from world capitals to physical features!
          </p>
        </div>
        <GeographyChat />
      </Authenticated>

      <Unauthenticated>
        <div className="max-w-md mx-auto mt-12">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🌍</div>
            <h1 className="text-4xl font-bold text-blue-700 mb-4">Geography AI Tutor</h1>
            <p className="text-xl text-gray-600 mb-2">
              Your personal AI geography teacher
            </p>
            <p className="text-gray-500">
              Get instant answers to geography questions, learn about countries, capitals, 
              physical features, and more!
            </p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>
    </div>
  );
}
