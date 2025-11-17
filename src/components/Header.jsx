export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-inner" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Collage Studio</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Create beautiful photo collages in seconds</p>
          </div>
        </div>
        <a href="https://flames.run" target="_blank" className="text-sm text-blue-600 hover:text-blue-700">Powered by Flames</a>
      </div>
    </header>
  );
}
