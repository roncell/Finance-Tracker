import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs';
import { Landmark } from 'lucide-react';

export default function Page() {
  return ( 
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      
      {/* Left Column: Form Section */}
      <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-zinc-950">
        
        {/* Shows while Clerk is initializing */}
        <ClerkLoading>
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Tailwind CSS Spinner */}
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-zinc-900 dark:border-white"></div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading sign-in page</p>
          </div>
        </ClerkLoading>

        {/* Shows when Clerk is fully ready */}
        <ClerkLoaded>
          <SignIn 
            path="/sign-in" 
            appearance={{
              elements: {
                formButtonPrimary: 
                  "bg-zinc-900 hover:bg-zinc-800 text-white border-none normal-case dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
                card: "shadow-none border border-zinc-200 dark:border-zinc-800 dark:bg-zinc-950",
                headerTitle: "text-zinc-900 dark:text-white",
                headerSubtitle: "text-zinc-500 dark:text-zinc-400",
                socialButtonsBlockButton: "border-zinc-200 dark:border-zinc-800 dark:text-white dark:hover:bg-zinc-900",
                dividerLine: "bg-zinc-200 dark:bg-zinc-800",
                dividerText: "text-zinc-500 dark:text-zinc-400",
                formFieldLabel: "text-zinc-900 dark:text-white",
                formFieldInput: "bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-white",
                footerActionText: "text-zinc-500 dark:text-zinc-400",
                footerActionLink: "text-zinc-900 hover:text-zinc-800 dark:text-white dark:hover:text-zinc-200",
              },
            }}
          />
        </ClerkLoaded>
      </div>

      {/* Right Column: Welcome section with header and small intro (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-12 text-white relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-md space-y-6 text-center lg:text-left">
          <div className="flex items-center gap-x-2.5 justify-center lg:justify-start">
            <div className="flex items-center justify-center size-9 rounded-lg bg-white/10">
              <Landmark className="size-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">FinanceTracker</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Every account. <br/> One clear picture.
          </h1>
          <p className="text-lg text-zinc-400">
            Connect your bank, categorise your spending, and see exactly where your money goes.
          </p>
        </div>
      </div>
    </div>
  );
}