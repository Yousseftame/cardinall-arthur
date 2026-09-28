import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/50">
      <div className="w-full max-w-md p-8 bg-card text-card-foreground rounded-2xl shadow-xl border border-border">
        <h1 className="text-center font-heading text-3xl mb-6">Cardinal Arthur</h1>
        <Outlet />
      </div>
    </div>
  );
}
