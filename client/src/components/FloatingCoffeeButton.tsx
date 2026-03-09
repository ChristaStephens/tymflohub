import { Coffee } from "lucide-react";

const BUYMEACOFFEE_URL = "https://buymeacoffee.com/tymflo";

export default function FloatingCoffeeButton() {
  return (
    <a
      href={BUYMEACOFFEE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
      data-testid="button-floating-coffee"
    >
      <Coffee className="w-5 h-5" />
      <span className="hidden sm:inline">Buy me a coffee</span>
    </a>
  );
}
