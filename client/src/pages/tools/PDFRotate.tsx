import { RotateCw } from "lucide-react";
import ToolPlaceholder from "./ToolPlaceholder";

export default function PDFRotate() {
  return (
    <ToolPlaceholder
      title="Rotate PDF"
      description="Rotate PDF pages to the correct orientation."
      icon={RotateCw}
    />
  );
}
