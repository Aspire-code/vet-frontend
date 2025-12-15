export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 mt-10">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h3 className="text-white font-bold">VetLink</h3>
          <p className="text-sm">Connecting pet owners and vets</p>
        </div>

        <div className="text-center md:text-right">
          <p>© {new Date().getFullYear()} VetLink — All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
