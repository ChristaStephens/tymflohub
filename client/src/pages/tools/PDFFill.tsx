import { useState, useEffect } from "react";
import {
  FileText, Download, CheckSquare, AlignLeft, ChevronDown, Shield,
  Zap, Lock, CheckCircle, RotateCcw, X, AlertCircle, ListChecks
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/SEO";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";
import {
  PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown,
  PDFRadioGroup, PDFOptionList
} from "pdf-lib";
import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type FieldKind = "text" | "checkbox" | "dropdown" | "radio" | "textarea" | "unknown";

interface FormField {
  name: string;
  kind: FieldKind;
  label: string;
  options?: string[];
  value: string | boolean;
  required: boolean;
}

function toLabel(name: string) {
  return name.replace(/[_.\-]/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, c => c.toUpperCase()).trim();
}

export default function PDFFill() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [fields, setFields] = useState<FormField[]>([]);
  const [pdfPreview, setPdfPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasFormFields, setHasFormFields] = useState<boolean | null>(null);

  useEffect(() => {
    if (!files.length) { setFields([]); setPdfPreview(null); setHasFormFields(null); return; }
    (async () => {
      setIsLoading(true);
      try {
        const buf = await files[0].arrayBuffer();

        // Render first page preview with pdfjs
        try {
          const pdf = await pdfjs.getDocument({ data: buf.slice(0) }).promise;
          const pg = await pdf.getPage(1);
          const vp = pg.getViewport({ scale: 1.2 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width; canvas.height = vp.height;
          await pg.render({ canvasContext: canvas.getContext("2d")!, viewport: vp } as any).promise;
          setPdfPreview(canvas.toDataURL());
        } catch { /* preview optional */ }

        // Detect form fields with pdf-lib
        const pdfDoc = await PDFDocument.load(buf);
        const form = pdfDoc.getForm();
        const rawFields = form.getFields();

        if (!rawFields.length) {
          setHasFormFields(false);
          setFields([]);
          setIsLoading(false);
          return;
        }

        setHasFormFields(true);
        const parsed: FormField[] = rawFields.map(f => {
          const name = f.getName();
          const label = toLabel(name);
          if (f instanceof PDFTextField) {
            const isMultiline = f.isMultiline?.() ?? false;
            return { name, kind: isMultiline ? "textarea" : "text" as FieldKind, label, value: f.getText() || "", required: false };
          } else if (f instanceof PDFCheckBox) {
            return { name, kind: "checkbox" as FieldKind, label, value: f.isChecked(), required: false };
          } else if (f instanceof PDFDropdown) {
            const opts = f.getOptions();
            return { name, kind: "dropdown" as FieldKind, label, options: opts, value: f.getSelected()[0] || "", required: false };
          } else if (f instanceof PDFRadioGroup) {
            const opts = f.getOptions();
            return { name, kind: "radio" as FieldKind, label, options: opts, value: f.getSelected() || "", required: false };
          } else if (f instanceof PDFOptionList) {
            const opts = f.getOptions();
            return { name, kind: "dropdown" as FieldKind, label, options: opts, value: f.getSelected()[0] || "", required: false };
          } else {
            return { name, kind: "unknown" as FieldKind, label, value: "", required: false };
          }
        }).filter(f => f.kind !== "unknown");

        setFields(parsed);
      } catch (e) {
        toast({ title: "Failed to read PDF", description: "Make sure the file is a valid PDF.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [files]);

  const updateField = (name: string, value: string | boolean) =>
    setFields(prev => prev.map(f => f.name === name ? { ...f, value } : f));

  const save = async () => {
    if (!files.length) return;
    setIsSaving(true);
    try {
      const buf = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const form = pdfDoc.getForm();

      for (const field of fields) {
        try {
          const f = form.getField(field.name);
          if (f instanceof PDFTextField) {
            f.setText(String(field.value));
          } else if (f instanceof PDFCheckBox) {
            if (field.value) f.check(); else f.uncheck();
          } else if (f instanceof PDFDropdown) {
            if (field.value) f.select(String(field.value));
          } else if (f instanceof PDFRadioGroup) {
            if (field.value) f.select(String(field.value));
          }
        } catch { /* skip fields that fail */ }
      }

      form.flatten();
      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `filled-${files[0].name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Filled PDF downloaded!" });
    } catch {
      toast({ title: "Failed to fill PDF", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const filledCount = fields.filter(f => (typeof f.value === "boolean" ? f.value : !!f.value)).length;

  return (
    <>
      <SEO
        title="Fill in PDF Forms Online Free | TymFlo Hub"
        description="Fill in PDF forms online for free. Automatically detects form fields — type, check boxes, and select dropdowns. Download the completed PDF instantly."
        canonical="https://tools.tymflo.com/tools/pdf-fill"
      />

      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 mb-4">
              <ListChecks className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-blue-900 mb-3">Fill in PDF</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Upload a PDF with form fields and fill them in directly — text fields, checkboxes, dropdowns and more.
            </p>
          </div>

          {!files.length ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
              <FileUpload accept="application/pdf" multiple={false} maxFiles={1} maxSizeMB={20} onFilesChange={setFiles} fileType="pdf" files={files} />
              <p className="text-center text-sm text-gray-400 mt-4">Works with any PDF that has fillable form fields (AcroForm)</p>
            </div>
          ) : isLoading ? (
            <div className="bg-white rounded-3xl shadow-xl p-12 text-center">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Detecting form fields…</p>
            </div>
          ) : hasFormFields === false ? (
            <div className="bg-white rounded-3xl shadow-xl p-10 text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
              <h2 className="text-xl font-semibold text-gray-800">No Form Fields Found</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                This PDF doesn't have fillable form fields. Try the <strong>PDF Edit</strong> tool to add text manually anywhere on the document.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="outline" onClick={() => setFiles([])} className="gap-2">
                  <X className="w-4 h-4" /> Try another file
                </Button>
                <Button onClick={() => window.location.href = "/tools/pdf-edit"} className="gap-2 bg-purple-600 hover:bg-purple-700">
                  <AlignLeft className="w-4 h-4" /> Open PDF Edit
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {/* PDF Preview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Document Preview</h2>
                  <Button variant="ghost" size="sm" onClick={() => { setFiles([]); setFields([]); }} className="gap-1.5 text-gray-400">
                    <X className="w-3.5 h-3.5" /> Change file
                  </Button>
                </div>
                <div className="bg-gray-100 rounded-2xl overflow-hidden shadow-inner">
                  {pdfPreview
                    ? <img src={pdfPreview} alt="PDF preview" className="w-full" />
                    : <div className="h-64 flex items-center justify-center text-gray-400"><FileText className="w-12 h-12" /></div>
                  }
                </div>
                <p className="text-xs text-gray-400 text-center">
                  {files[0]?.name} · {fields.length} field{fields.length !== 1 ? "s" : ""} detected
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fill in Fields</h2>
                  <Badge variant="secondary" className="text-xs">
                    {filledCount} / {fields.length} filled
                  </Badge>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                  {fields.map(field => (
                    <div key={field.name} className="bg-white border rounded-xl p-4 space-y-2">
                      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        {field.kind === "checkbox" ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
                          : field.kind === "dropdown" || field.kind === "radio" ? <ChevronDown className="w-3.5 h-3.5 text-blue-500" />
                          : field.kind === "textarea" ? <AlignLeft className="w-3.5 h-3.5 text-blue-500" />
                          : <AlignLeft className="w-3.5 h-3.5 text-blue-500" />}
                        {field.label}
                      </Label>

                      {field.kind === "text" && (
                        <Input
                          value={field.value as string}
                          onChange={e => updateField(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}…`}
                          data-testid={`field-${field.name}`}
                          className="text-sm"
                        />
                      )}

                      {field.kind === "textarea" && (
                        <Textarea
                          value={field.value as string}
                          onChange={e => updateField(field.name, e.target.value)}
                          placeholder={`Enter ${field.label.toLowerCase()}…`}
                          data-testid={`field-${field.name}`}
                          rows={3}
                          className="text-sm resize-none"
                        />
                      )}

                      {field.kind === "checkbox" && (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={field.name}
                            checked={field.value as boolean}
                            onCheckedChange={v => updateField(field.name, !!v)}
                            data-testid={`field-${field.name}`}
                          />
                          <Label htmlFor={field.name} className="text-sm text-gray-600 cursor-pointer">
                            {field.value ? "Checked" : "Unchecked"}
                          </Label>
                        </div>
                      )}

                      {(field.kind === "dropdown") && field.options && (
                        <Select value={field.value as string} onValueChange={v => updateField(field.name, v)}>
                          <SelectTrigger className="text-sm" data-testid={`field-${field.name}`}>
                            <SelectValue placeholder={`Select ${field.label.toLowerCase()}…`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map(opt => (
                              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}

                      {field.kind === "radio" && field.options && (
                        <div className="flex flex-wrap gap-2">
                          {field.options.map(opt => (
                            <button
                              key={opt}
                              onClick={() => updateField(field.name, opt)}
                              data-testid={`field-${field.name}-${opt}`}
                              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                                field.value === opt
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-200 text-gray-600 hover:border-blue-300"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setFields(prev => prev.map(f => ({ ...f, value: typeof f.value === "boolean" ? false : "" })))} className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </Button>
                  <Button
                    onClick={save}
                    disabled={isSaving}
                    className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                    data-testid="button-download-filled"
                  >
                    <Download className="w-4 h-4" />
                    {isSaving ? "Saving…" : "Download Filled PDF"}
                  </Button>
                </div>
                <p className="text-xs text-gray-400 text-center">Your data never leaves your browser — 100% private</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <HowItWorks title="How to Fill in a PDF Form Online" steps={[
        { step: 1, title: "Upload Your PDF", description: "Drop your fillable PDF form. The tool automatically detects all form fields — text boxes, checkboxes, dropdowns, and radio buttons." },
        { step: 2, title: "Fill in the Fields", description: "Type into text fields, check boxes, and select from dropdowns. See a live preview of the first page alongside the form." },
        { step: 3, title: "Download Completed Form", description: "Click Download to get your filled PDF. Fields are flattened so the form is locked and ready to submit or share." },
      ]} />

      <Features title="Why Use TymFlo PDF Form Filler?" features={[
        { icon: <Zap className="w-6 h-6" />, title: "Auto-Detects Fields", description: "Automatically reads all fillable fields from any AcroForm PDF — no manual mapping needed." },
        { icon: <Shield className="w-6 h-6" />, title: "100% Private", description: "Your PDF and form data never leave your browser. Zero server uploads." },
        { icon: <CheckSquare className="w-6 h-6" />, title: "All Field Types", description: "Supports text fields, multiline text areas, checkboxes, dropdowns, and radio buttons." },
        { icon: <CheckCircle className="w-6 h-6" />, title: "Flattened Output", description: "The downloaded PDF has fields flattened — the form is finalized and can't be edited again." },
        { icon: <Lock className="w-6 h-6" />, title: "No Registration", description: "Fill and download instantly with no account or subscription required." },
        { icon: <FileText className="w-6 h-6" />, title: "Standard Compatibility", description: "Works with any standard PDF that has AcroForm fields — government forms, contracts, applications." },
      ]} />

      <FAQSection title="Frequently Asked Questions" faqs={[
        { question: "What types of PDF forms does this support?", answer: "It supports any PDF with AcroForm fields — the standard format used by government forms, legal documents, tax forms, job applications, and most fillable PDFs created in Adobe Acrobat or similar tools." },
        { question: "What if the tool says 'No form fields found'?", answer: "This means the PDF doesn't have interactive form fields — it may be a scanned document or a flat PDF. Use the PDF Edit tool instead to add text manually anywhere on the page." },
        { question: "Is my data private?", answer: "Yes. Everything runs in your browser. Your PDF file and the data you type are never sent to any server." },
        { question: "Can I edit the PDF after filling?", answer: "The downloaded PDF has its fields flattened, meaning they're converted to static content. This is intentional to prevent accidental changes. If you need to re-fill, use the original PDF again." },
        { question: "What's the difference between PDF Edit and PDF Fill?", answer: "PDF Fill is for PDFs with existing interactive form fields — it fills those fields automatically. PDF Edit is for adding text, highlights, or shapes anywhere on a PDF that may not have form fields." },
        { question: "Will filled values show correctly in all PDF readers?", answer: "Yes. Flattening converts form values to standard PDF content, visible in Adobe Reader, Chrome PDF viewer, Preview on Mac, and all other standard PDF readers." },
      ]} />

      <BenefitsBanner
        title="More PDF Tools — All Free"
        description="Merge, split, compress, sign, edit, convert — TymFlo Hub has everything you need to work with PDFs, all free with no limits."
        ctaText="See All PDF Tools"
        ctaHref="/"
      />
    </>
  );
}
