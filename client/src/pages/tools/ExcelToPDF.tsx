import { FileSpreadsheet } from "lucide-react";
import ToolPlaceholder from "./ToolPlaceholder";

export default function ExcelToPDF() {
  return (
    <ToolPlaceholder
      title="Excel to PDF"
      description="Convert Excel spreadsheets to PDF."
      icon={FileSpreadsheet}
    />
  );
}
