import { checkAuth } from "./actions";
import { LoginForm, Dashboard } from "./components/components";

export default async function Page() {
  const isAuthenticated = await checkAuth();

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#050505] text-zinc-100 overflow-hidden font-sans">
      {/* Premium ambient light glows */}
      <div className="absolute top-1/4 left-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-amber-500/5 to-yellow-600/5 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-600/[0.03] blur-3xl pointer-events-none" />
      
      {/* Decorative Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"
        style={{
          maskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 50%, #000 60%, transparent 100%)"
        }}
      />

      <div className="relative z-10 flex w-full flex-col items-center justify-center py-8">
        {isAuthenticated ? <Dashboard /> : <LoginForm />}
      </div>
    </main>
  );
}
