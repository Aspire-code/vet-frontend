import { FaFacebook, FaTwitter, FaInstagram, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Footer from "../components/Footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="px-6 py-16 max-w-5xl mx-auto flex-1">

        {/* PAGE TITLE */}
        <h1 className="text-4xl font-bold mb-4 text-center text-blue-700">
          Contact Us
        </h1>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
          We’d love to hear from you! Whether you’re a client looking for help or a vet wanting 
          to improve your visibility, reach out to us anytime.
        </p>

        {/* GRID */}
        <div className="grid md:grid-cols-2 gap-10">

          {/* CONTACT FORM */}
          <form className="space-y-4 bg-white p-8 rounded-2xl shadow-lg border border-gray-200">

            {/* NAME */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Your Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full p-3 rounded-xl border border-gray-300 
                focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Your Email</label>
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full p-3 rounded-xl border border-gray-300 
                focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* SUBJECT */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Subject</label>
              <input
                type="text"
                placeholder="Type message subject"
                className="w-full p-3 rounded-xl border border-gray-300 
                focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>

            {/* MESSAGE */}
            <div>
              <label className="block font-semibold mb-1 text-gray-700">Your Message</label>
              <textarea
                rows={5}
                placeholder="Write your message here..."
                className="w-full p-3 rounded-xl border border-gray-300 
                focus:ring-2 focus:ring-blue-400 focus:outline-none"
              ></textarea>
            </div>

            {/* BUTTON */}
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
            >
              Send Message
            </button>
          </form>

          {/* CONTACT INFO */}
          <div className="space-y-8">

            {/* CONTACT CARD */}
            <div className="bg-white p-8 rounded-2xl shadow border space-y-4">

              <h2 className="text-2xl font-bold text-blue-700 mb-2">Reach Us Directly</h2>

              <p className="flex items-center gap-3 text-gray-700">
                <FaEnvelope className="text-blue-600" />
                support@vetlink.com
              </p>

              <p className="flex items-center gap-3 text-gray-700">
                <FaPhoneAlt className="text-blue-600" />
                +254 700 000 000
              </p>

              <p className="flex items-center gap-3 text-gray-700">
                <FaMapMarkerAlt className="text-blue-600" />
                VetLink HQ, Nairobi, Kenya
              </p>

              <div className="text-gray-700">
                <h3 className="font-semibold text-lg">Office Hours</h3>
                <p>Monday - Friday: 8:00 AM – 6:00 PM</p>
                <p>Saturday: 9:00 AM – 3:00 PM</p>
                <p>Sunday & Holidays: Closed</p>
              </div>

              {/* SOCIAL MEDIA */}
              <div className="flex gap-6 mt-4 text-blue-600 text-xl">
                <FaFacebook className="cursor-pointer hover:text-blue-800" />
                <FaTwitter className="cursor-pointer hover:text-blue-800" />
                <FaInstagram className="cursor-pointer hover:text-blue-800" />
              </div>
            </div>

            {/* MAP */}
            <div className="rounded-2xl overflow-hidden shadow border h-56">
              <iframe
                title="VetLink Map"
                className="w-full h-full"
                src="https://maps.google.com/maps?q=Nairobi&t=&z=13&ie=UTF8&iwloc=&output=embed"
              ></iframe>
            </div>

          </div>
        </div>

        {/* FAQ SECTION */}
        <section className="mt-16 bg-white p-8 rounded-2xl shadow border max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
            Frequently Asked Questions (FAQ)
          </h2>

          <div className="space-y-4">
            <details className="p-4 border rounded-xl cursor-pointer">
              <summary className="font-semibold">How do I register as a vet?</summary>
              <p className="mt-2 text-gray-600">
                Simply go to the Register page, choose "Vet" as your role, and fill out your details.
              </p>
            </details>

            <details className="p-4 border rounded-xl cursor-pointer">
              <summary className="font-semibold">How do clients find vets?</summary>
              <p className="mt-2 text-gray-600">
                Clients use our search feature to filter vets by location, services, and availability.
              </p>
            </details>

            <details className="p-4 border rounded-xl cursor-pointer">
              <summary className="font-semibold">How do I update my vet profile?</summary>
              <p className="mt-2 text-gray-600">
                Login as a vet and access your dashboard to update services, contacts, and profile details.
              </p>
            </details>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
