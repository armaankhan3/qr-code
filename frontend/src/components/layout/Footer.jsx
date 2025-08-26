export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 py-8 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center space-x-4 mb-4">
          <a href="#" aria-label="twitter" className="hover:opacity-80">Twitter</a>
          <a href="#" aria-label="instagram" className="hover:opacity-80">Instagram</a>
          <a href="#" aria-label="linkedin" className="hover:opacity-80">LinkedIn</a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} WomenSafe — Built for safer travel</p>
      </div>
    </footer>
  );
}
