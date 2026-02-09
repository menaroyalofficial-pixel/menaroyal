import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: Document not found in archive:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-lg w-full text-center space-y-12">
        <p className="font-sans text-[10px] editorial-spacing text-muted-foreground uppercase tracking-[0.4em]">
          Error 404
        </p>
        <div className="space-y-6">
          <h1 className="font-serif text-6xl lg:text-8xl font-light text-foreground tracking-tighter italic">
            Lost in <br />
            the Archive
          </h1>
          <p className="font-sans text-xs text-muted-foreground leading-relaxed editorial-spacing font-light max-w-xs mx-auto">
            The requested document could not be located in our institutional records. It may have been relocated or removed.
          </p>
        </div>
        <div className="pt-8">
          <a
            href="/"
            className="group relative font-sans text-[10px] editorial-spacing px-12 py-5 overflow-hidden inline-block"
          >
            <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500 uppercase tracking-[0.3em]">Return to Portal</span>
            <div className="absolute inset-0 bg-black scale-x-100 group-hover:scale-x-0 transition-transform duration-500 origin-right" />
            <div className="absolute inset-0 border border-black" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
