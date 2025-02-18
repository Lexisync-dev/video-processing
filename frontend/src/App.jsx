import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { Separator } from '@/components/ui/separator';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen border-x max-w-7xl mx-auto border-border flex flex-col">
        {/* Header */}
        <header className="flex flex-col items-center pt-8 pb-6 px-4 shrink-0">
          <p className="text-muted-foreground text-xs uppercase tracking-widest mb-4">
            Volume I • EST. 2026
          </p>
          <a href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-4xl md:text-5xl font-serif font-semibold text-center mb-6 text-foreground">
              The Video Studio
            </h1>
          </a>
          
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="/" className="hover:text-primary transition-colors">Workspace</a>
          </div>
        </header>

        <Separator className="w-full" />

        <main className="flex-1">
          <Routes>
            <Route 
              path="/" 
              element={<Dashboard />} 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <Separator className="w-full" />
        
        <footer className="py-8 text-center text-xs text-muted-foreground uppercase tracking-widest shrink-0">
          © {new Date().getFullYear()} The Video Studio. All Rights Reserved.
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
