import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      <nav className="bg-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-white">Pet Groove</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-white/80 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white text-indigo-600 hover:bg-gray-100 px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center px-4 py-24">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-white mb-6">
            Turn Your Pet Into a Dancing Star
          </h1>
          <p className="text-xl text-white/90 mb-8">
            Transform your pet's photo into an amazing 8-second dancing video with AI.
            Choose from 10 different dance styles and watch your pet come to life!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-lime-400 hover:bg-lime-500 text-gray-900 font-bold py-4 px-8 rounded-lg text-lg transition-colors"
            >
              Get Started
            </Link>
            <Link
              href="/subscribe"
              className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors backdrop-blur-sm"
            >
              View Plans
            </Link>
          </div>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl">
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
            <p className="text-white/80">
              Advanced AI technology ensures your pet looks exactly like in the photo
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">💃</div>
            <h3 className="text-xl font-bold text-white mb-2">10 Dance Styles</h3>
            <p className="text-white/80">
              Choose from Macarena, Robot, Hip-Hop, and more popular dances
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-2">Fast & Easy</h3>
            <p className="text-white/80">
              Upload, select a dance, and get your video in minutes
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
