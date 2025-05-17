export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-blue-700 text-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Seantral</h1>
          <nav>
            <ul className="flex gap-6">
              <li><a href="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</a></li>
              <li><a href="/auth/login" className="hover:text-blue-200 transition-colors">Login</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main>
        <section className="py-20 px-4 bg-gradient-to-b from-blue-700 to-blue-800 text-white">
          <div className="container mx-auto text-center">
            <h2 className="text-5xl font-bold mb-6">Marine Data Platform</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              High-resolution, near-real-time information on coastal and open-water conditions by aggregating open-data sources and proprietary beacon telemetry.
            </p>
            <div className="flex gap-4 justify-center">
              <a href="/dashboard" className="bg-blue-600 text-white px-5 py-2.5 rounded font-medium hover:bg-blue-700">
                View Dashboard
              </a>
              <a href="/auth/signup" className="bg-transparent border border-blue-600 text-white px-5 py-2.5 rounded font-medium hover:bg-blue-700">
                Sign Up
              </a>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Data Sources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Copernicus Marine</h3>
                <p className="text-gray-600">
                  Access to global ocean forecasts, physical and biogeochemical data from satellites, in-situ observations and models.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3">NOAA NDBC</h3>
                <p className="text-gray-600">
                  Real-time data from the National Data Buoy Center's network of buoys and coastal stations.
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Proprietary Beacons</h3>
                <p className="text-gray-600">
                  Coming soon: Integration with proprietary beacon telemetry for hyperlocal data.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 