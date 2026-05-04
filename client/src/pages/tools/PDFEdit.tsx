import { useState, useRef, useEffect, useCallback } from "react";
import {
  Type, Highlighter, Square, Minus, Eraser, Download, Trash2,
  RotateCcw, ChevronLeft, ChevronRight, FileText, Shield, Zap,
  Lock, Cloud, CheckCircle, X, Palette, AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SEO from "@/components/SEO";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";
import * as pdfjs from "pdfjs-dist";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ToolType = "text" | "highlight" | "rectangle" | "underline" | "whiteout";

interface Annotation {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  content?: string;
  color: string;
  fontSize?: number;
}

const COLORS = [
  { label: "Black", value: "#000000" },
  { label: "Blue", value: "#1d4ed8" },
  { label: "Red", value: "#dc2626" },
  { label: "Green", value: "#16a34a" },
  { label: "Purple", value: "#7c3aed" },
];

const HIGHLIGHT_COLORS = [
  { label: "Yellow", value: "#fef08a" },
  { label: "Green", value: "#bbf7d0" },
  { label: "Blue", value: "#bfdbfe" },
  { label: "Pink", value: "#fbcfe8" },
];

function genId() { return Math.random().toString(36).slice(2, 9); }

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16) / 255, g: parseInt(r[2], 16) / 255, b: parseInt(r[3], 16) / 255 } : { r: 0, g: 0, b: 0 };
}

export default function PDFEdit() {
  const { toast } = useToast();
  const [files, setFiles] = useState<File[]>([]);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [pageDims, setPageDims] = useState<{ width: number; height: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType | null>(null);
  const [color, setColor] = useState("#000000");
  const [hlColor, setHlColor] = useState("#fef08a");
  const [fontSize, setFontSize] = useState(14);
  const [textInput, setTextInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState({ x: 0, y: 0 });
  const [drawRect, setDrawRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!files.length) { setPdfPages([]); setPageDims([]); setAnnotations([]); return; }
    (async () => {
      try {
        const buf = await files[0].arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: buf }).promise;
        const pages: string[] = [];
        const dims: { width: number; height: number }[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const pg = await pdf.getPage(i);
          const vp = pg.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width; canvas.height = vp.height;
          await pg.render({ canvasContext: canvas.getContext("2d")!, viewport: vp } as any).promise;
          pages.push(canvas.toDataURL());
          dims.push({ width: vp.width, height: vp.height });
        }
        setPdfPages(pages); setPageDims(dims); setCurrentPage(1);
      } catch {
        toast({ title: "Failed to load PDF", variant: "destructive" });
      }
    })();
  }, [files]);

  const getContainerCoords = (e: React.MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: e.clientX - rect.left + el.scrollLeft, y: e.clientY - rect.top + el.scrollTop };
  };

  const handleContainerMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!activeTool) return;
    const { x, y } = getContainerCoords(e);

    if (activeTool === "text") {
      const ann: Annotation = {
        id: genId(), type: "text", x, y,
        width: Math.max(120, (textInput.length || 4) * fontSize * 0.65),
        height: fontSize + 8, page: currentPage,
        content: textInput || "Text here", color, fontSize,
      };
      setAnnotations(p => [...p, ann]);
      setSelectedId(ann.id);
      setActiveTool(null);
    } else {
      setIsDrawing(true);
      setDrawStart({ x, y });
      setDrawRect(null);
    }
    e.stopPropagation();
  }, [activeTool, textInput, fontSize, color, currentPage]);

  const handleContainerMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging && selectedId) {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left + el.scrollLeft - dragOffset.x;
      const y = e.clientY - rect.top + el.scrollTop - dragOffset.y;
      setAnnotations(p => p.map(a => a.id === selectedId ? { ...a, x: Math.max(0, x), y: Math.max(0, y) } : a));
    } else if (isDrawing) {
      const { x, y } = getContainerCoords(e);
      setDrawRect({ x: Math.min(x, drawStart.x), y: Math.min(y, drawStart.y), w: Math.abs(x - drawStart.x), h: Math.abs(y - drawStart.y) });
    }
  }, [isDragging, selectedId, dragOffset, isDrawing, drawStart]);

  const handleContainerMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) { setIsDragging(false); return; }
    if (isDrawing && drawRect && activeTool && activeTool !== "text") {
      if (drawRect.w > 5 && drawRect.h > 5) {
        const ann: Annotation = {
          id: genId(), type: activeTool,
          x: drawRect.x, y: drawRect.y, width: drawRect.w, height: drawRect.h,
          page: currentPage, color: activeTool === "highlight" ? hlColor : activeTool === "whiteout" ? "#ffffff" : color,
          fontSize,
        };
        setAnnotations(p => [...p, ann]);
        setSelectedId(ann.id);
      }
      setIsDrawing(false); setDrawRect(null);
      if (activeTool !== "highlight") setActiveTool(null);
    }
  }, [isDragging, isDrawing, drawRect, activeTool, currentPage, color, hlColor, fontSize]);

  const handleAnnotationMouseDown = (e: React.MouseEvent, ann: Annotation) => {
    e.stopPropagation();
    setSelectedId(ann.id);
    setIsDragging(true);
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left + el.scrollLeft - ann.x, y: e.clientY - rect.top + el.scrollTop - ann.y });
  };

  const deleteAnnotation = (id: string) => {
    setAnnotations(p => p.filter(a => a.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const pageAnnotations = annotations.filter(a => a.page === currentPage);
  const dim = pageDims[currentPage - 1];

  const save = async () => {
    if (!files.length) return;
    setIsSaving(true);
    try {
      const buf = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(buf);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

      for (const ann of annotations) {
        const pg = pages[ann.page - 1];
        if (!pg) continue;
        const { width: pw, height: ph } = pg.getSize();
        const dispW = dim?.width || 600;
        const dispH = dim?.height || 800;
        const sx = pw / dispW, sy = ph / dispH;
        const pdfX = ann.x * sx;
        const pdfY = ph - (ann.y + ann.height) * sy;
        const pdfW = ann.width * sx;
        const pdfH = ann.height * sy;
        const c = hexToRgb(ann.color);

        switch (ann.type) {
          case "text":
            const sz = ((ann.fontSize || 14) * sx * 0.75);
            pg.drawText(ann.content || "", { x: pdfX, y: pdfY + pdfH * 0.3, size: sz, font, color: rgb(c.r, c.g, c.b) });
            break;
          case "highlight":
            pg.drawRectangle({ x: pdfX, y: pdfY, width: pdfW, height: pdfH, color: rgb(c.r, c.g, c.b), opacity: 0.35 });
            break;
          case "rectangle":
            pg.drawRectangle({ x: pdfX, y: pdfY, width: pdfW, height: pdfH, borderColor: rgb(c.r, c.g, c.b), borderWidth: 1.5 * sx });
            break;
          case "underline":
            pg.drawLine({ start: { x: pdfX, y: pdfY }, end: { x: pdfX + pdfW, y: pdfY }, thickness: 1.5 * sx, color: rgb(c.r, c.g, c.b) });
            break;
          case "whiteout":
            pg.drawRectangle({ x: pdfX, y: pdfY, width: pdfW, height: pdfH, color: rgb(1, 1, 1) });
            break;
        }
      }

      const bytes = await pdfDoc.save();
      const blob = new Blob([bytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `edited-${files[0].name}`; a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Edited PDF downloaded!" });
    } catch (e) {
      toast({ title: "Failed to save PDF", variant: "destructive" });
    } finally { setIsSaving(false); }
  };

  const tools: { id: ToolType; label: string; Icon: typeof Type; tip: string }[] = [
    { id: "text", label: "Text", Icon: Type, tip: "Click to place text" },
    { id: "highlight", label: "Highlight", Icon: Highlighter, tip: "Draw to highlight area" },
    { id: "rectangle", label: "Box", Icon: Square, tip: "Draw a rectangle" },
    { id: "underline", label: "Underline", Icon: Minus, tip: "Draw an underline" },
    { id: "whiteout", label: "Whiteout", Icon: Eraser, tip: "Draw to cover/redact" },
  ];

  const cursorStyle = activeTool === "text" ? "text" : activeTool ? "crosshair" : isDragging ? "grabbing" : "default";

  return (
    <>
      <SEO
        title="Edit PDF Online Free - Add Text, Highlight & Annotate | TymFlo Hub"
        description="Edit PDF files online for free. Add text, highlight content, draw shapes, or redact sensitive information. No registration required."
        canonical="https://tools.tymflo.com/tools/pdf-edit"
      />

      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-10">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 mb-4">
              <AlignLeft className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-purple-900 mb-3">Edit PDF</h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Add text, highlight content, draw shapes, or whiteout sections — all in your browser.</p>
          </div>

          {!files.length ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 mb-10">
              <FileUpload accept="application/pdf" multiple={false} maxFiles={1} maxSizeMB={20} onFilesChange={setFiles} fileType="pdf" files={files} />
            </div>
          ) : (
            <div className="space-y-4">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl border shadow-sm p-4 flex flex-wrap items-center gap-3">
                <div className="flex gap-1.5 flex-wrap">
                  {tools.map(({ id, label, Icon, tip }) => (
                    <button
                      key={id}
                      title={tip}
                      onClick={() => setActiveTool(activeTool === id ? null : id)}
                      data-testid={`tool-${id}`}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        activeTool === id
                          ? "bg-purple-600 text-white border-purple-600"
                          : "border-gray-200 text-gray-600 hover:border-purple-300 hover:bg-purple-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>

                <div className="h-6 w-px bg-gray-200 hidden md:block" />

                {activeTool === "text" && (
                  <>
                    <Input
                      placeholder="Text to add…"
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      className="w-36 h-8 text-sm"
                      data-testid="input-text-content"
                    />
                    <Select value={String(fontSize)} onValueChange={v => setFontSize(Number(v))}>
                      <SelectTrigger className="w-16 h-8 text-sm" data-testid="select-font-size"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {[10, 12, 14, 16, 18, 20, 24, 28, 32].map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-1">
                      {COLORS.map(c => (
                        <button key={c.value} title={c.label} onClick={() => setColor(c.value)}
                          className={`w-6 h-6 rounded-full border-2 ${color === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                          style={{ background: c.value }} />
                      ))}
                    </div>
                  </>
                )}

                {activeTool === "highlight" && (
                  <div className="flex gap-1">
                    {HIGHLIGHT_COLORS.map(c => (
                      <button key={c.value} title={c.label} onClick={() => setHlColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 ${hlColor === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                        style={{ background: c.value }} />
                    ))}
                  </div>
                )}

                {(activeTool === "rectangle" || activeTool === "underline") && (
                  <div className="flex gap-1">
                    {COLORS.map(c => (
                      <button key={c.value} title={c.label} onClick={() => setColor(c.value)}
                        className={`w-6 h-6 rounded-full border-2 ${color === c.value ? "border-gray-800 scale-110" : "border-transparent"}`}
                        style={{ background: c.value }} />
                    ))}
                  </div>
                )}

                <div className="ml-auto flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => { setAnnotations([]); setSelectedId(null); }} className="gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5" /> Clear all
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => { setFiles([]); setPdfPages([]); setAnnotations([]); }} className="gap-1.5">
                    <X className="w-3.5 h-3.5" /> New file
                  </Button>
                  <Button size="sm" onClick={save} disabled={isSaving || !annotations.length} className="gap-1.5 bg-purple-600 hover:bg-purple-700" data-testid="button-save-pdf">
                    <Download className="w-3.5 h-3.5" /> {isSaving ? "Saving…" : "Download"}
                  </Button>
                </div>
              </div>

              {/* Page nav */}
              {pdfPages.length > 1 && (
                <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => { setSelectedId(null); setCurrentPage(p => p - 1); }} data-testid="button-prev-page">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span>Page {currentPage} of {pdfPages.length}</span>
                  <Button variant="outline" size="sm" disabled={currentPage === pdfPages.length} onClick={() => { setSelectedId(null); setCurrentPage(p => p + 1); }} data-testid="button-next-page">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {activeTool && (
                <div className="text-center text-sm text-purple-600 font-medium bg-purple-50 rounded-lg py-2">
                  {tools.find(t => t.id === activeTool)?.tip} — or press Escape to cancel
                </div>
              )}

              {/* PDF canvas area */}
              <div
                ref={containerRef}
                className="bg-gray-100 rounded-2xl overflow-auto max-h-[70vh] shadow-inner relative"
                style={{ cursor: cursorStyle }}
                onMouseDown={handleContainerMouseDown}
                onMouseMove={handleContainerMouseMove}
                onMouseUp={handleContainerMouseUp}
                onMouseLeave={() => { setIsDragging(false); setIsDrawing(false); setDrawRect(null); }}
                onClick={() => { if (!activeTool) setSelectedId(null); }}
                data-testid="pdf-canvas-area"
              >
                <div className="relative inline-block m-6">
                  {pdfPages[currentPage - 1] && (
                    <img src={pdfPages[currentPage - 1]} alt={`Page ${currentPage}`} className="block max-w-full shadow-lg rounded" draggable={false} />
                  )}
                  {/* Render annotations */}
                  {pageAnnotations.map(ann => {
                    const isSelected = ann.id === selectedId;
                    return (
                      <div
                        key={ann.id}
                        data-testid={`annotation-${ann.id}`}
                        style={{
                          position: "absolute",
                          left: ann.x, top: ann.y,
                          width: ann.width, height: ann.height,
                          border: isSelected ? "2px dashed #7c3aed" : "none",
                          cursor: "grab",
                          userSelect: "none",
                          boxSizing: "border-box",
                          background: ann.type === "highlight" ? ann.color + "60"
                            : ann.type === "whiteout" ? "#ffffff"
                            : ann.type === "rectangle" ? "transparent"
                            : "transparent",
                          outline: ann.type === "rectangle" ? `2px solid ${ann.color}` : undefined,
                          borderBottom: ann.type === "underline" ? `3px solid ${ann.color}` : undefined,
                          display: "flex", alignItems: "center",
                        }}
                        onMouseDown={e => handleAnnotationMouseDown(e, ann)}
                      >
                        {ann.type === "text" && (
                          <span style={{ color: ann.color, fontSize: ann.fontSize, lineHeight: 1, whiteSpace: "nowrap", padding: "0 2px" }}>
                            {ann.content}
                          </span>
                        )}
                        {isSelected && (
                          <button
                            className="absolute -top-3 -right-3 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center z-10"
                            onMouseDown={e => e.stopPropagation()}
                            onClick={e => { e.stopPropagation(); deleteAnnotation(ann.id); }}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {/* Live draw preview */}
                  {isDrawing && drawRect && (
                    <div style={{
                      position: "absolute",
                      left: drawRect.x, top: drawRect.y,
                      width: drawRect.w, height: drawRect.h,
                      background: activeTool === "highlight" ? hlColor + "50"
                        : activeTool === "whiteout" ? "#ffffff"
                        : "transparent",
                      border: activeTool === "rectangle" ? `2px solid ${color}` : "2px dashed rgba(124,58,237,0.5)",
                      pointerEvents: "none",
                    }} />
                  )}
                </div>
              </div>

              <p className="text-xs text-center text-gray-400">Nothing is uploaded — all processing happens in your browser</p>
            </div>
          )}
        </div>
      </div>

      <HowItWorks title="How to Edit a PDF Online" steps={[
        { step: 1, title: "Upload Your PDF", description: "Drag and drop or click to upload your PDF file. It opens instantly in the editor." },
        { step: 2, title: "Add Text, Highlights & Shapes", description: "Choose a tool from the toolbar. Click or draw on the PDF to add annotations, text, or whiteout sections." },
        { step: 3, title: "Download Edited PDF", description: "Click Download to save your edited PDF. All changes are embedded permanently in the file." },
      ]} />

      <Features title="Why Use TymFlo PDF Editor?" features={[
        { icon: <Zap className="w-6 h-6" />, title: "Instant Editing", description: "Open any PDF and start editing immediately — no waiting, no installs." },
        { icon: <Shield className="w-6 h-6" />, title: "100% Private", description: "Your PDF never leaves your device. All editing is done locally in your browser." },
        { icon: <Type className="w-6 h-6" />, title: "Add Text Anywhere", description: "Place custom text anywhere on any page with full control over size and color." },
        { icon: <Highlighter className="w-6 h-6" />, title: "Highlight & Annotate", description: "Highlight important sections in multiple colors for review and collaboration." },
        { icon: <Eraser className="w-6 h-6" />, title: "Redact / Whiteout", description: "Cover sensitive information permanently before sharing documents." },
        { icon: <Lock className="w-6 h-6" />, title: "No Account Needed", description: "Free to use immediately with no registration or login required." },
      ]} />

      <FAQSection title="Frequently Asked Questions" faqs={[
        { question: "Can I edit the existing text in a PDF?", answer: "PDF Edit lets you add text, highlights, and shapes on top of any PDF. Editing existing text directly requires the original source document (Word, etc.) since PDF text is stored as fixed layout data." },
        { question: "Is my PDF uploaded to a server?", answer: "No. All editing is done entirely in your browser using client-side JavaScript. Your file never leaves your device." },
        { question: "What types of annotations can I add?", answer: "You can add: custom text in any size and color, yellow/green/blue/pink highlights, rectangle outlines, underlines, and whiteout (redaction) boxes." },
        { question: "Can I edit multiple pages?", answer: "Yes. Use the page navigation arrows to move between pages and add annotations to any page." },
        { question: "Will the annotations show up in all PDF readers?", answer: "Yes. Annotations are embedded directly into the PDF as permanent content, not as separate overlay layers. They will appear in Adobe Reader, Chrome, and any standard PDF viewer." },
        { question: "What file size limit is there?", answer: "You can edit PDFs up to 20MB. Larger files may take a few extra seconds to load." },
      ]} />

      <BenefitsBanner
        title="Need More PDF Tools?"
        description="TymFlo Hub has 40+ free tools — merge, split, compress, sign, convert, and more. All free, no registration."
        ctaText="See All Tools"
        ctaHref="/"
      />
    </>
  );
}
