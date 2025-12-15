export default function SearchBar({ value, onChange, placeholder = "Search vets by name, service or location...", className }: { value: string; onChange: (value: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full p-3 rounded-xl border border-gray-300 ${className || ''}`}
    />
  );
}
