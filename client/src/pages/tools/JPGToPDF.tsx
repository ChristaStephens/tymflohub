import { Image } from "lucide-react";
import ToolPlaceholder from "./ToolPlaceholder";

export default function JPGToPDF() {
  return (
    <ToolPlaceholder
      title="JPG to PDF"
      description="Convert JPG images to PDF documents."
      icon={Image}
    />
  );
}
