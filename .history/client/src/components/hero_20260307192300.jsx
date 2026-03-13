function Hero() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20 text-center">

      <h1 className="text-5xl font-bold mb-6">
        Discover Live Music
      </h1>

      <p className="text-lg mb-8">
        Find and book tickets for your favorite concerts
      </p>

      <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition">
        Browse Events
      </button>

    </div>
  );
}

export default Hero;