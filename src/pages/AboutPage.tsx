import Footer from "../components/Footer";

export default function About() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="px-6 py-12 max-w-5xl mx-auto">
        
        {/* Page Title */}
        <h1 className="text-4xl font-extrabold text-center text-blue-700 mb-4">
          About VetLink
        </h1>
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10">
          Connecting clients with trusted, professional veterinarians anytime, anywhere.
        </p>

        {/* Who We Are */}
        <section className="bg-white p-8 rounded-2xl shadow mb-10">
          <h2 className="text-2xl font-semibold text-blue-600 mb-3">Who We Are</h2>
          <p className="text-gray-700 leading-7">
            VetLink is a digital platform created to enhance the visibility of veterinary professionals while making 
            it easier for pet owners and livestock farmers to access reliable veterinary services. 
            With VetLink, clients can search, filter, and connect with qualified vets instantly through detailed profiles.
          </p>
        </section>

        {/* Mission & Vision */}
        <section className="grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">Our Mission</h2>
            <p className="text-gray-700 leading-7">
              To empower veterinarians and make quality animal healthcare more accessible 
              by providing a digital space where clients can easily find the right professionals.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow">
            <h2 className="text-2xl font-semibold text-blue-600 mb-3">Our Vision</h2>
            <p className="text-gray-700 leading-7">
              To become Africa’s most trusted digital platform for veterinary services, 
              connecting millions to reliable and affordable animal healthcare.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-white p-8 rounded-2xl shadow mb-10">
          <h2 className="text-2xl font-semibold text-blue-600 mb-3">Our Core Values</h2>
          <ul className="grid md:grid-cols-2 gap-4 text-gray-700 leading-7">
            <li>✓ Integrity & Transparency</li>
            <li>✓ Professionalism & Trust</li>
            <li>✓ Accessibility & Convenience</li>
            <li>✓ Innovation & Continuous Improvement</li>
          </ul>
        </section>

        {/* Why Choose Us */}
        <section className="bg-white p-8 rounded-2xl shadow mb-10">
          <h2 className="text-2xl font-semibold text-blue-600 mb-4">Why Choose VetLink?</h2>
          <div className="space-y-4 text-gray-700">
            <p>✔ Easy access to verified veterinarians near you</p>
            <p>✔ Simple search and filter by location and services</p>
            <p>✔ A professional platform for vets to showcase their skills</p>
            <p>✔ Instant tap-to-call or message features</p>
            <p>✔ Regular updates and vet profile customization</p>
          </div>
        </section>
        

      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
