import { Scissors } from "lucide-react";
import ToolPlaceholder from "./ToolPlaceholder";

export default function PDFExtract() {
  return (
    <ToolPlaceholder
      title="Extract PDF Pages"
      description="Extract specific pages from a PDF into a new document."
      icon={Scissors}
    />
  );
}
