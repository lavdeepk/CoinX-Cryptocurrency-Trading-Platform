// Page component for Notfound.

const Notfound = () => {
  return (
    <div className="page-shell flex gap-4 flex-col min-h-[70vh] items-center justify-center text-center animate-fadeIn">
      <p className="text-xs uppercase tracking-[0.22em] text-cyan-300">Not Found</p>
      <p className="text-6xl font-bold gradient-text">404</p>
      <h1 className="text-3xl sm:text-5xl font-semibold">Page Not Found</h1>
      <p className="max-w-md text-slate-400">The page you are trying to access does not exist or may have been moved.</p>
    </div>
  )
}

export default Notfound
