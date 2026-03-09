import { FileInput } from "lucide-react";
import ToolPlaceholder from "./ToolPlaceholder";

export default function WordToPDF() {
  return (
    <ToolPlaceholder
      title="Word to PDF"
      description="Convert Word documents to PDF format."
      icon={FileInput}
    />
  );
}
