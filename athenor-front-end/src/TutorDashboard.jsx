export default function TutorDashboard() {
  return (
    <div className="bg-white min-h-screen">

      {/* NAVBAR */}
      <nav className="w-full border-b bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-tight text-blue-700">
            Athenor
          </div>

          <div className="flex items-center gap-8 text-gray-700 font-medium">
            <a className="hover:text-blue-600 transition" href="#">Dashboard</a>
            <a className="hover:text-blue-600 transition" href="#">Analytics</a>
            <a className="hover:text-blue-600 transition" href="#">Reports</a>
            <a className="hover:text-blue-600 transition" href="#">Settings</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="w-full bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            A Cleaner, Faster Way to Organize Our Tutoring
          </h1>

          <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
            Athenor provides a streamlined and powerful dashboard for tutors
            looking to simplify analytics, operations, and scheduling.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition font-medium">
              Get Started
            </button>

            <button className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-100 transition font-medium">
              Learn More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
