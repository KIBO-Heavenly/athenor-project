export default function AdminDashboard() {
  return (
    <div className="bg-gray-50 min-h-screen">

      {/* NAVBAR */}
      <nav className="w-full border-b bg-gray-900/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-semibold tracking-tight text-white">
            Athenor Admin
          </div>

          <div className="flex items-center gap-8 text-gray-200 font-medium">
            <a className="hover:text-white transition" href="#">Dashboard</a>
            <a className="hover:text-white transition" href="#">Users</a>
            <a className="hover:text-white transition" href="#">Reports</a>
            <a className="hover:text-white transition" href="#">Settings</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="w-full bg-gradient-to-b from-gray-100 to-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            Admin Dashboard
          </h1>

          <p className="text-lg text-gray-700 mt-6 max-w-2xl mx-auto leading-relaxed">
            Manage tutors, students, and analytics from a single powerful interface.
          </p>

          <div className="mt-10 flex justify-center gap-4">
            <button className="px-8 py-3 bg-gray-900 text-white rounded-xl shadow hover:bg-gray-800 transition font-medium">
              Manage Users
            </button>

            <button className="px-8 py-3 border border-gray-400 rounded-xl hover:bg-gray-100 transition font-medium">
              View Reports
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
