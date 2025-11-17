import Header from './components/Header';
import CollageBuilder from './components/CollageBuilder';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold">Make a collage in your browser</h2>
          <p className="text-gray-600 mt-1">Drop photos, pick a layout, tweak spacing and background, then export a high-quality PNG.</p>
        </div>
        <CollageBuilder />
      </main>
      <Footer />
    </div>
  )
}

export default App
