import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Globe, Mic, Users, ChevronRight, MessageSquare } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent mb-6">
              AI Translation for Your Church Service
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Real-time translation in multiple languages for your congregation. Break down language barriers and unite your community.
            </p>
            <Link
              to="/services"
              className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700"
            >
              Get Started
              <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Simple Steps */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Simple Steps</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Sign Up</h3>
              <p className="text-gray-600">Create your church account in minutes</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. Create Service</h3>
              <p className="text-gray-600">Set up your service with desired languages</p>
            </div>
            <div className="text-center p-6">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Start Streaming</h3>
              <p className="text-gray-600">Begin translation with simple audio input</p>
            </div>
          </div>
        </div>
      </div>

      {/* Churches Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Trusted by Churches</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Grace Community</h3>
              <p className="text-gray-600 mb-4">500+ members</p>
              <div className="flex items-center text-sm text-gray-500">
                <Globe className="h-4 w-4 mr-1" />
                <span>5 languages</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Life Church</h3>
              <p className="text-gray-600 mb-4">1000+ members</p>
              <div className="flex items-center text-sm text-gray-500">
                <Globe className="h-4 w-4 mr-1" />
                <span>3 languages</span>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Hope Fellowship</h3>
              <p className="text-gray-600 mb-4">300+ members</p>
              <div className="flex items-center text-sm text-gray-500">
                <Globe className="h-4 w-4 mr-1" />
                <span>4 languages</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Pastors Say</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-orange-50 p-6 rounded-lg">
              <MessageSquare className="h-8 w-8 text-orange-500 mb-4" />
              <p className="text-gray-600 mb-4">
                "This service has transformed our multilingual congregation. The real-time translation is seamless and accurate."
              </p>
              <div className="font-medium">Pastor Michael, Grace Community</div>
            </div>
            <div className="bg-orange-50 p-6 rounded-lg">
              <MessageSquare className="h-8 w-8 text-orange-500 mb-4" />
              <p className="text-gray-600 mb-4">
                "We've seen incredible growth in our international members since implementing this translation service."
              </p>
              <div className="font-medium">Pastor Sarah, Life Church</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Simple Pricing</h2>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-800 mb-4">$199<span className="text-lg text-gray-600">/month</span></div>
                <p className="text-gray-600 mb-6">Everything you need for your church</p>
                <ul className="text-left max-w-md mx-auto space-y-4 mb-8">
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-orange-500 mr-2" />
                    <span>Unlimited services</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-orange-500 mr-2" />
                    <span>All supported languages</span>
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-5 w-5 text-orange-500 mr-2" />
                    <span>Unlimited listeners</span>
                  </li>
                </ul>
                <Link
                  to="/login"
                  className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700"
                >
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Languages */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Supported Languages</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {['English', 'Spanish', 'French', 'Korean', 'Russian'].map((language) => (
              <div key={language} className="flex items-center justify-center p-4 bg-orange-50 rounded-lg">
                <Globe className="h-5 w-5 text-orange-500 mr-2" />
                <span>{language}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">What audio input do I need?</h3>
              <p className="text-gray-600">Any standard microphone or audio interface will work. We recommend using a dedicated microphone for best quality.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">How accurate is the translation?</h3>
              <p className="text-gray-600">Our AI-powered translation is highly accurate and continuously improving. It handles religious terminology particularly well.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Is there a delay in translation?</h3>
              <p className="text-gray-600">Translation happens in near real-time with minimal delay, typically less than a second.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Contact Us</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="form-input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                <textarea rows={4} className="form-textarea" required></textarea>
              </div>
              <button
                type="submit"
                className="w-full px-6 py-3 text-lg font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:from-orange-600 hover:to-red-700"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;