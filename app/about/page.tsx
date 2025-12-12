import Link from 'next/link'
import { ArrowLeft, Shield, Zap, Heart, Globe, Users, TrendingUp } from 'lucide-react'

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">About PH Hazard Map</h1>
          <p className="text-xl text-slate-600 mb-8">
            All hazards. One map. Real-time awareness for safer communities.
          </p>

          <div className="space-y-8 text-slate-700">
            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our Mission</h2>
              <p>
                PH Hazard Map is dedicated to making critical hazard information accessible to every Filipino. We believe that real-time awareness saves lives, and everyone deserves access to accurate, up-to-date information about natural hazards affecting their communities.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">What We Provide</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
                  <Shield className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Real-time Monitoring</h3>
                    <p className="text-sm">Live data on earthquakes, volcanic activity, and typhoons across the Philippines</p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                  <Zap className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Instant Updates</h3>
                    <p className="text-sm">Get the latest information as events unfold, powered by official sources</p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 bg-purple-50 rounded-lg">
                  <Globe className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">Interactive Map</h3>
                    <p className="text-sm">Visualize hazards on an easy-to-use map interface with detailed event information</p>
                  </div>
                </div>
                <div className="flex gap-3 p-4 bg-orange-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-1">AI-Powered Insights</h3>
                    <p className="text-sm">Intelligent analysis of volcanic activity and trend forecasting</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our Data Sources</h2>
              <p className="mb-3">
                We source our data from trusted official government agencies to ensure accuracy and reliability:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>PHIVOLCS</strong> (Philippine Institute of Volcanology and Seismology) - Earthquake and volcanic activity data
                </li>
                <li>
                  <strong>PAGASA</strong> (Philippine Atmospheric, Geophysical and Astronomical Services Administration) - Typhoon and weather data
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Why We Built This</h2>
              <div className="flex gap-4 p-6 bg-slate-50 rounded-lg border-l-4 border-blue-600">
                <Heart className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="mb-3">
                    The Philippines is one of the most disaster-prone countries in the world. We face earthquakes, volcanic eruptions, and an average of 20 typhoons each year. Despite this, critical hazard information is often scattered across multiple sources, making it difficult for communities to stay informed.
                  </p>
                  <p>
                    PH Hazard Map was created to solve this problem by bringing all hazard data into one accessible platform. Our goal is to empower Filipinos with the information they need to protect themselves and their loved ones.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Technology</h2>
              <p className="mb-3">
                PH Hazard Map is built with modern web technologies to deliver a fast, reliable, and user-friendly experience:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Real-time data processing and visualization</li>
                <li>Mobile-responsive design for access anywhere</li>
                <li>Progressive Web App (PWA) capabilities for offline access</li>
                <li>AI-powered analysis for volcanic activity insights</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Community Impact</h2>
              <div className="flex gap-4 p-6 bg-blue-50 rounded-lg">
                <Users className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <p>
                    We believe that informed communities are safer communities. By making hazard data accessible to everyone, we hope to contribute to disaster preparedness and resilience across the Philippines. Whether you&apos;re a concerned citizen, emergency responder, researcher, or local government official, PH Hazard Map is here to serve you.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Open Source</h2>
              <p>
                PH Hazard Map is committed to transparency and community collaboration. We believe in the power of open source to create better tools for public safety. Our code is available for review, contribution, and learning.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-slate-900 mb-3">Get Involved</h2>
              <p>
                We&apos;re always looking to improve and expand our services. If you have suggestions, feedback, or would like to contribute, please{' '}
                <Link href="/contact" className="text-blue-600 hover:text-blue-700 underline">
                  get in touch
                </Link>. Together, we can build a safer Philippines.
              </p>
            </section>

            <section className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600">
                <strong>Disclaimer:</strong> PH Hazard Map is an independent project and is not officially affiliated with PHIVOLCS, PAGASA, or any government agency. Always refer to official sources for emergency decisions and evacuation orders.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
