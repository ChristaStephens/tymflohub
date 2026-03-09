import { useState, useRef, useEffect, useCallback } from "react";
import { 
  PenLine, Type, Upload, Download, Trash2, RotateCcw, Check, Move, 
  ZoomIn, ZoomOut, Calendar, Shield, Square, Circle, Minus, 
  CheckSquare, FileText, Palette, ChevronLeft, ChevronRight,
  GripVertical, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import SEO from "@/components/SEO";
import FileUpload from "@/components/FileUpload";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb, StandardFonts, PDFPage } from 'pdf-lib';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type ElementType = "signature" | "text" | "checkbox" | "rectangle" | "circle" | "line";

interface PDFElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  content?: string;
  color?: string;
  fontSize?: number;
  checked?: boolean;
  required?: boolean;
  signatureDataUrl?: string;
  strokeWidth?: number;
  filled?: boolean;
}

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "Blue", value: "#2563eb" },
  { name: "Red", value: "#dc2626" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Orange", value: "#ea580c" },
];

const FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export default function PDFSign() {
  const [files, setFiles] = useState<File[]>([]);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [signatureMethod, setSignatureMethod] = useState<"draw" | "type" | "upload">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [elements, setElements] = useState<PDFElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfDimensions, setPdfDimensions] = useState<{ width: number; height: number }[]>([]);
  const [includeDateStamp, setIncludeDateStamp] = useState(true);
  const [signerName, setSignerName] = useState("");
  const [activeTool, setActiveTool] = useState<ElementType | null>(null);
  const [toolColor, setToolColor] = useState("#000000");
  const [toolFontSize, setToolFontSize] = useState(14);
  const [isCheckboxRequired, setIsCheckboxRequired] = useState(false);
  const [textInput, setTextInput] = useState("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const selectedElement = elements.find(el => el.id === selectedElementId);

  useEffect(() => {
    if (files.length === 0) {
      setPdfPages([]);
      setPdfDimensions([]);
      setElements([]);
      return;
    }

    const loadPdf = async () => {
      try {
        const arrayBuffer = await files[0].arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const pages: string[] = [];
        const dimensions: { width: number; height: number }[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (context) {
            await page.render({
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            } as any).promise;
            pages.push(canvas.toDataURL());
            dimensions.push({ width: viewport.width, height: viewport.height });
          }
        }

        setPdfPages(pages);
        setPdfDimensions(dimensions);
        setCurrentPage(1);
      } catch (error) {
        console.error("Error loading PDF:", error);
        toast({
          title: "Error",
          description: "Failed to load PDF. Please try a different file.",
          variant: "destructive",
        });
      }
    };

    loadPdf();
  }, [files, toast]);

  useEffect(() => {
    if (signatureMethod === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [signatureMethod]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveDrawnSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { data, width, height } = imageData;
    
    let minX = width, minY = height, maxX = 0, maxY = 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (data[idx] < 250 || data[idx + 1] < 250 || data[idx + 2] < 250) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    if (maxX <= minX || maxY <= minY) {
      toast({
        title: "No signature drawn",
        description: "Please draw your signature before saving.",
        variant: "destructive",
      });
      return;
    }

    const padding = 10;
    const trimmedCanvas = document.createElement('canvas');
    trimmedCanvas.width = (maxX - minX) + padding * 2;
    trimmedCanvas.height = (maxY - minY) + padding * 2;
    const trimmedCtx = trimmedCanvas.getContext('2d');
    if (trimmedCtx) {
      trimmedCtx.fillStyle = 'white';
      trimmedCtx.fillRect(0, 0, trimmedCanvas.width, trimmedCanvas.height);
      trimmedCtx.drawImage(
        canvas,
        minX - padding, minY - padding,
        trimmedCanvas.width, trimmedCanvas.height,
        0, 0,
        trimmedCanvas.width, trimmedCanvas.height
      );
      setSignatureDataUrl(trimmedCanvas.toDataURL('image/png'));
      setActiveTool("signature");
      toast({
        title: "Signature saved",
        description: "Now click on the PDF to place your signature.",
      });
    }
  };

  const generateTypedSignature = () => {
    if (!typedSignature.trim()) {
      toast({
        title: "Enter your name",
        description: "Please type your name to generate a signature.",
        variant: "destructive",
      });
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.font = 'italic 48px "Brush Script MT", cursive, serif';
    const metrics = ctx.measureText(typedSignature);
    const padding = 20;
    
    canvas.width = metrics.width + padding * 2;
    canvas.height = 70;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'italic 48px "Brush Script MT", cursive, serif';
    ctx.fillText(typedSignature, padding, 50);
    
    setSignatureDataUrl(canvas.toDataURL('image/png'));
    setActiveTool("signature");
    toast({
      title: "Signature generated",
      description: "Now click on the PDF to place your signature.",
    });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSignatureDataUrl(event.target?.result as string);
      setActiveTool("signature");
      toast({
        title: "Signature uploaded",
        description: "Now click on the PDF to place your signature.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePdfClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfContainerRef.current) return;
    
    const container = pdfContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const x = e.clientX - rect.left + scrollLeft;
    const y = e.clientY - rect.top + scrollTop;

    if (!activeTool) {
      setSelectedElementId(null);
      return;
    }

    const newElement: PDFElement = {
      id: generateId(),
      type: activeTool,
      x,
      y,
      width: 100,
      height: 40,
      page: currentPage,
      color: toolColor,
      fontSize: toolFontSize,
    };

    switch (activeTool) {
      case "signature":
        if (!signatureDataUrl) {
          toast({
            title: "No signature",
            description: "Please create a signature first.",
            variant: "destructive",
          });
          return;
        }
        newElement.signatureDataUrl = signatureDataUrl;
        newElement.width = 150;
        newElement.height = 60;
        newElement.x = x - 75;
        newElement.y = y - 30;
        break;
      case "text":
        newElement.content = textInput || "Text";
        newElement.width = Math.max(100, (textInput.length || 4) * 10);
        newElement.height = toolFontSize + 10;
        newElement.x = x;
        newElement.y = y;
        break;
      case "checkbox":
        newElement.checked = false;
        newElement.required = isCheckboxRequired;
        newElement.width = 24;
        newElement.height = 24;
        newElement.x = x - 12;
        newElement.y = y - 12;
        break;
      case "rectangle":
        newElement.width = 120;
        newElement.height = 80;
        newElement.x = x - 60;
        newElement.y = y - 40;
        newElement.strokeWidth = 2;
        newElement.filled = false;
        break;
      case "circle":
        newElement.width = 80;
        newElement.height = 80;
        newElement.x = x - 40;
        newElement.y = y - 40;
        newElement.strokeWidth = 2;
        newElement.filled = false;
        break;
      case "line":
        newElement.width = 150;
        newElement.height = 4;
        newElement.x = x - 75;
        newElement.y = y - 2;
        newElement.strokeWidth = 2;
        break;
    }

    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    
    if (activeTool !== "signature") {
      setActiveTool(null);
    }
  }, [activeTool, currentPage, signatureDataUrl, textInput, toolColor, toolFontSize, isCheckboxRequired, toast]);

  const handleElementMouseDown = (e: React.MouseEvent, element: PDFElement) => {
    e.stopPropagation();
    setSelectedElementId(element.id);
    setIsDragging(true);
    
    const container = pdfContainerRef.current;
    if (container) {
      const rect = container.getBoundingClientRect();
      const scrollLeft = container.scrollLeft;
      const scrollTop = container.scrollTop;
      setDragOffset({
        x: e.clientX - rect.left + scrollLeft - element.x,
        y: e.clientY - rect.top + scrollTop - element.y,
      });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedElementId || !pdfContainerRef.current) return;

    const container = pdfContainerRef.current;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;
    const scrollTop = container.scrollTop;
    const x = e.clientX - rect.left + scrollLeft - dragOffset.x;
    const y = e.clientY - rect.top + scrollTop - dragOffset.y;

    setElements(prev => prev.map(el => 
      el.id === selectedElementId 
        ? { ...el, x: Math.max(0, x), y: Math.max(0, y) }
        : el
    ));
  }, [isDragging, selectedElementId, dragOffset]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const deleteElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const updateElement = (id: string, updates: Partial<PDFElement>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const toggleCheckbox = (id: string) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, checked: !el.checked } : el
    ));
  };

  const resizeElement = (id: string, widthDelta: number, heightDelta: number) => {
    setElements(prev => prev.map(el => {
      if (el.id !== id) return el;
      return {
        ...el,
        width: Math.max(20, el.width + widthDelta),
        height: Math.max(20, el.height + heightDelta),
      };
    }));
  };

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
    } : { r: 0, g: 0, b: 0 };
  };

  const applyElements = async () => {
    if (!files.length) {
      toast({
        title: "No PDF",
        description: "Please upload a PDF first.",
        variant: "destructive",
      });
      return;
    }

    const requiredCheckboxes = elements.filter(el => el.type === "checkbox" && el.required && !el.checked);
    if (requiredCheckboxes.length > 0) {
      toast({
        title: "Required fields",
        description: `Please check all ${requiredCheckboxes.length} required checkbox${requiredCheckboxes.length > 1 ? 'es' : ''}.`,
        variant: "destructive",
      });
      return;
    }

    if (elements.length === 0) {
      toast({
        title: "No elements",
        description: "Please add at least one element to the document.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      let metadata: any = null;
      
      if (includeDateStamp) {
        try {
          const metaResponse = await fetch('/api/esign/metadata', { method: 'POST' });
          const metaData = await metaResponse.json();
          if (metaData.success) {
            metadata = metaData.metadata;
          }
        } catch (e) {
          console.warn("Could not fetch signing metadata, using local fallback");
        }
        
        if (!metadata) {
          const now = new Date();
          metadata = {
            formattedDate: now.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            formattedTime: now.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            }),
            ip: 'Not available',
            signingId: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
            serverVerified: false,
          };
        }
      }

      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      for (const element of elements) {
        const page = pages[element.page - 1];
        if (!page) continue;

        const { width: pageWidth, height: pageHeight } = page.getSize();
        const previewImg = pdfContainerRef.current?.querySelector('img');
        const displayedWidth = previewImg?.clientWidth || pdfDimensions[element.page - 1]?.width || 600;
        const displayedHeight = previewImg?.clientHeight || pdfDimensions[element.page - 1]?.height || 800;
        
        const scaleX = pageWidth / displayedWidth;
        const scaleY = pageHeight / displayedHeight;
        
        const pdfX = element.x * scaleX;
        const pdfY = pageHeight - (element.y + element.height) * scaleY;
        const pdfWidth = element.width * scaleX;
        const pdfHeight = element.height * scaleY;
        const color = hexToRgb(element.color || "#000000");

        switch (element.type) {
          case "signature":
            if (element.signatureDataUrl) {
              const signatureBytes = await fetch(element.signatureDataUrl).then(res => res.arrayBuffer());
              const signatureImage = await pdfDoc.embedPng(signatureBytes);
              page.drawImage(signatureImage, {
                x: pdfX,
                y: pdfY,
                width: pdfWidth,
                height: pdfHeight,
              });

              if (includeDateStamp && metadata) {
                const fontSize = 8;
                const lineHeight = 10;
                const stampLines = [
                  `Signed: ${metadata.formattedDate} at ${metadata.formattedTime}`,
                  `IP: ${metadata.ip}`,
                  `Ref: ${metadata.signingId}`,
                ];
                if (signerName.trim()) {
                  stampLines.unshift(`Signer: ${signerName.trim()}`);
                }
                let stampY = pdfY - 5;
                stampLines.forEach((line) => {
                  stampY -= lineHeight;
                  page.drawText(line, {
                    x: pdfX,
                    y: stampY,
                    size: fontSize,
                    font,
                    color: rgb(0.3, 0.3, 0.3),
                  });
                });
              }
            }
            break;

          case "text":
            const text = element.content || "";
            const textFontSize = (element.fontSize || 14) * scaleX * 0.75;
            page.drawText(text, {
              x: pdfX,
              y: pdfY + (pdfHeight * 0.3),
              size: textFontSize,
              font,
              color: rgb(color.r, color.g, color.b),
            });
            break;

          case "checkbox":
            const boxSize = Math.min(pdfWidth, pdfHeight);
            const borderWidth = 1.5 * scaleX;
            
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: boxSize,
              height: boxSize,
              borderColor: element.required ? rgb(0.86, 0.15, 0.15) : rgb(0.3, 0.3, 0.3),
              borderWidth: borderWidth,
            });
            
            if (element.checked) {
              const padding = boxSize * 0.2;
              page.drawLine({
                start: { x: pdfX + padding, y: pdfY + boxSize / 2 },
                end: { x: pdfX + boxSize * 0.4, y: pdfY + padding },
                thickness: 2 * scaleX,
                color: rgb(0.1, 0.5, 0.1),
              });
              page.drawLine({
                start: { x: pdfX + boxSize * 0.4, y: pdfY + padding },
                end: { x: pdfX + boxSize - padding, y: pdfY + boxSize - padding },
                thickness: 2 * scaleX,
                color: rgb(0.1, 0.5, 0.1),
              });
            }
            break;

          case "rectangle":
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: pdfWidth,
              height: pdfHeight,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: (element.strokeWidth || 2) * scaleX,
              color: element.filled ? rgb(color.r, color.g, color.b) : undefined,
              opacity: element.filled ? 0.2 : undefined,
            });
            break;

          case "circle":
            const centerX = pdfX + pdfWidth / 2;
            const centerY = pdfY + pdfHeight / 2;
            const radiusX = pdfWidth / 2;
            const radiusY = pdfHeight / 2;
            page.drawEllipse({
              x: centerX,
              y: centerY,
              xScale: radiusX,
              yScale: radiusY,
              borderColor: rgb(color.r, color.g, color.b),
              borderWidth: (element.strokeWidth || 2) * scaleX,
              color: element.filled ? rgb(color.r, color.g, color.b) : undefined,
              opacity: element.filled ? 0.2 : undefined,
            });
            break;

          case "line":
            page.drawLine({
              start: { x: pdfX, y: pdfY + pdfHeight / 2 },
              end: { x: pdfX + pdfWidth, y: pdfY + pdfHeight / 2 },
              thickness: (element.strokeWidth || 2) * scaleX,
              color: rgb(color.r, color.g, color.b),
            });
            break;
        }
      }

      const signedPdfBytes = await pdfDoc.save();
      const blob = new Blob([signedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `filled-${files[0].name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Document saved!",
        description: `PDF with ${elements.length} element${elements.length > 1 ? 's' : ''} has been downloaded.`,
      });
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAll = () => {
    setFiles([]);
    setSignatureDataUrl(null);
    setElements([]);
    setSelectedElementId(null);
    setPdfPages([]);
    setTypedSignature("");
    setSignerName("");
    setActiveTool(null);
    setTextInput("");
    clearCanvas();
  };

  const currentPageElements = elements.filter(el => el.page === currentPage);

  const renderElement = (element: PDFElement) => {
    const isSelected = selectedElementId === element.id;
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      cursor: 'move',
      outline: isSelected ? '2px solid #7c3aed' : 'none',
      outlineOffset: '2px',
    };

    switch (element.type) {
      case "signature":
        return (
          <div
            key={element.id}
            style={baseStyle}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            data-testid={`element-signature-${element.id}`}
          >
            {element.signatureDataUrl && (
              <img 
                src={element.signatureDataUrl} 
                alt="Signature" 
                className="w-full h-full object-contain pointer-events-none"
                draggable={false}
              />
            )}
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-3 -right-3 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
                data-testid={`button-delete-${element.id}`}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "text":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              color: element.color,
              fontSize: element.fontSize,
              fontFamily: 'Helvetica, Arial, sans-serif',
              display: 'flex',
              alignItems: 'center',
              padding: '2px 4px',
              backgroundColor: isSelected ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
              whiteSpace: 'nowrap',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            data-testid={`element-text-${element.id}`}
          >
            {element.content}
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-3 -right-3 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "checkbox":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            onClick={(e) => { e.stopPropagation(); toggleCheckbox(element.id); }}
            data-testid={`element-checkbox-${element.id}`}
          >
            <div 
              className={`w-full h-full border-2 rounded flex items-center justify-center transition-colors ${
                element.required ? 'border-red-500' : 'border-gray-500'
              } ${element.checked ? 'bg-green-100' : 'bg-white'}`}
            >
              {element.checked && <Check className="w-4 h-4 text-green-600" />}
            </div>
            {element.required && (
              <span className="absolute -top-1 -right-1 text-red-500 text-xs font-bold">*</span>
            )}
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-3 -right-3 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "rectangle":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              border: `${element.strokeWidth || 2}px solid ${element.color}`,
              backgroundColor: element.filled ? `${element.color}20` : 'transparent',
              borderRadius: '2px',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            data-testid={`element-rectangle-${element.id}`}
          >
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-3 -right-3 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "circle":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              border: `${element.strokeWidth || 2}px solid ${element.color}`,
              backgroundColor: element.filled ? `${element.color}20` : 'transparent',
              borderRadius: '50%',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            data-testid={`element-circle-${element.id}`}
          >
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-3 -right-3 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );

      case "line":
        return (
          <div
            key={element.id}
            style={{
              ...baseStyle,
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseDown={(e) => handleElementMouseDown(e, element)}
            data-testid={`element-line-${element.id}`}
          >
            <div 
              className="w-full"
              style={{
                height: element.strokeWidth || 2,
                backgroundColor: element.color,
              }}
            />
            {isSelected && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute -top-3 -right-3 h-6 w-6"
                onClick={(e) => { e.stopPropagation(); deleteElement(element.id); }}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        );
    }
  };

  const howItWorksSteps = [
    { step: 1, title: "Upload PDF", description: "Select the PDF document you want to fill or sign." },
    { step: 2, title: "Add Elements", description: "Add signatures, text, checkboxes, and shapes to your document." },
    { step: 3, title: "Download", description: "Save your completed document with all elements embedded." },
  ];

  const features = [
    { icon: <PenLine className="w-6 h-6" />, title: "E-Signatures", description: "Draw, type, or upload your signature to sign documents." },
    { icon: <FileText className="w-6 h-6" />, title: "Form Filling", description: "Add text fields anywhere to fill in forms and applications." },
    { icon: <CheckSquare className="w-6 h-6" />, title: "Checkboxes", description: "Add checkable boxes with optional required field markers." },
    { icon: <Square className="w-6 h-6" />, title: "Shapes", description: "Draw rectangles, circles, and lines to highlight or annotate." },
    { icon: <Calendar className="w-6 h-6" />, title: "Audit Trail", description: "Signatures include date, time, and IP for verification." },
    { icon: <Shield className="w-6 h-6" />, title: "Private & Secure", description: "All processing happens in your browser - files never uploaded." },
  ];

  const faqItems = [
    { question: "Is this legally binding?", answer: "Electronic signatures are legally valid in most countries. For highly regulated documents, additional verification may be required." },
    { question: "Can I fill in any PDF form?", answer: "Yes! You can add text fields anywhere on the document, making it easy to fill in job applications, contracts, and any other forms." },
    { question: "What are required checkboxes?", answer: "Required checkboxes are marked with a red border and asterisk. You must check them before downloading the document." },
    { question: "Is my document secure?", answer: "Absolutely. All processing happens entirely in your browser. Your PDF and data never get uploaded to any server." },
  ];

  return (
    <>
      <SEO
        title="PDF Fill & Sign Online - Free Form Filler | TymFlo Hub"
        description="Fill and sign PDF documents online for free. Add text fields, signatures, checkboxes, and shapes. Secure, private, and works entirely in your browser."
        canonical="https://tymflohub.com/tools/pdf-sign"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <PenLine className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              PDF Fill & Sign
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fill forms, add signatures, text, checkboxes, and shapes - like HelloSign, but free
            </p>
          </div>

          {/* Tool Section */}
          <div className="grid lg:grid-cols-3 gap-6 mb-12">
            {/* Left Column - Tools */}
            <Card className="p-4 lg:col-span-1">
              <h2 className="text-lg font-bold mb-4">Tools</h2>
              
              {/* Signature Section */}
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">Signature</h3>
                <Tabs value={signatureMethod} onValueChange={(v) => setSignatureMethod(v as any)}>
                  <TabsList className="grid grid-cols-3 mb-2">
                    <TabsTrigger value="draw" data-testid="tab-draw" className="text-xs">
                      <PenLine className="w-3 h-3 mr-1" />
                      Draw
                    </TabsTrigger>
                    <TabsTrigger value="type" data-testid="tab-type" className="text-xs">
                      <Type className="w-3 h-3 mr-1" />
                      Type
                    </TabsTrigger>
                    <TabsTrigger value="upload" data-testid="tab-upload" className="text-xs">
                      <Upload className="w-3 h-3 mr-1" />
                      Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="draw" className="space-y-2">
                    <div className="border rounded-lg p-1 bg-white">
                      <canvas
                        ref={canvasRef}
                        width={280}
                        height={100}
                        className="w-full cursor-crosshair touch-none"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        data-testid="canvas-signature"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearCanvas} data-testid="button-clear">
                        <Trash2 className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                      <Button size="sm" onClick={saveDrawnSignature} data-testid="button-save-drawn">
                        <Check className="w-3 h-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="type" className="space-y-2">
                    <Input
                      placeholder="Type your name..."
                      value={typedSignature}
                      onChange={(e) => setTypedSignature(e.target.value)}
                      className="text-lg"
                      style={{ fontFamily: '"Brush Script MT", cursive' }}
                      data-testid="input-typed-signature"
                    />
                    <Button size="sm" onClick={generateTypedSignature} className="w-full" data-testid="button-generate-typed">
                      <Check className="w-3 h-3 mr-1" />
                      Use Signature
                    </Button>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="text-sm"
                      data-testid="input-upload-signature"
                    />
                  </TabsContent>
                </Tabs>

                {signatureDataUrl && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs text-green-700 mb-1">Signature ready:</p>
                    <img src={signatureDataUrl} alt="Signature" className="h-8 object-contain" />
                  </div>
                )}
              </div>

              {/* Form Tools */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">Form Elements</h3>
                
                {/* Text Tool */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter text..."
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      className="flex-1 text-sm"
                      data-testid="input-text-content"
                    />
                    <Button
                      size="sm"
                      variant={activeTool === "text" ? "default" : "outline"}
                      onClick={() => setActiveTool(activeTool === "text" ? null : "text")}
                      data-testid="button-tool-text"
                    >
                      <Type className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Select value={toolFontSize.toString()} onValueChange={(v) => setToolFontSize(parseInt(v))}>
                      <SelectTrigger className="w-20 h-8 text-xs" data-testid="select-font-size">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_SIZES.map(size => (
                          <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8" data-testid="button-color-picker">
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: toolColor }} />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-3 gap-1">
                          {COLORS.map(c => (
                            <button
                              key={c.value}
                              className={`w-8 h-8 rounded border-2 ${toolColor === c.value ? 'border-primary' : 'border-transparent'}`}
                              style={{ backgroundColor: c.value }}
                              onClick={() => setToolColor(c.value)}
                              title={c.name}
                            />
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Checkbox Tool */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={activeTool === "checkbox" ? "default" : "outline"}
                    onClick={() => setActiveTool(activeTool === "checkbox" ? null : "checkbox")}
                    className="flex-1"
                    data-testid="button-tool-checkbox"
                  >
                    <CheckSquare className="w-4 h-4 mr-2" />
                    Checkbox
                  </Button>
                  <div className="flex items-center gap-1">
                    <Checkbox
                      id="required"
                      checked={isCheckboxRequired}
                      onCheckedChange={(c) => setIsCheckboxRequired(c === true)}
                      data-testid="checkbox-required-toggle"
                    />
                    <Label htmlFor="required" className="text-xs text-red-600">Required</Label>
                  </div>
                </div>

                {/* Shape Tools */}
                <h3 className="text-sm font-semibold text-muted-foreground pt-2">Shapes</h3>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    size="sm"
                    variant={activeTool === "rectangle" ? "default" : "outline"}
                    onClick={() => setActiveTool(activeTool === "rectangle" ? null : "rectangle")}
                    data-testid="button-tool-rectangle"
                  >
                    <Square className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={activeTool === "circle" ? "default" : "outline"}
                    onClick={() => setActiveTool(activeTool === "circle" ? null : "circle")}
                    data-testid="button-tool-circle"
                  >
                    <Circle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={activeTool === "line" ? "default" : "outline"}
                    onClick={() => setActiveTool(activeTool === "line" ? null : "line")}
                    data-testid="button-tool-line"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Options */}
              <div className="mt-6 pt-4 border-t space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Options</h3>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="datestamp"
                    checked={includeDateStamp}
                    onCheckedChange={(c) => setIncludeDateStamp(c === true)}
                    data-testid="checkbox-date-stamp"
                  />
                  <Label htmlFor="datestamp" className="text-sm">Include date/IP stamp on signatures</Label>
                </div>
                <Input
                  placeholder="Signer name (optional)"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="text-sm"
                  data-testid="input-signer-name"
                />
              </div>

              {/* Active Tool Indicator */}
              {activeTool && (
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                  <p className="text-sm font-medium text-primary">
                    Click on PDF to place: {activeTool.charAt(0).toUpperCase() + activeTool.slice(1)}
                  </p>
                </div>
              )}

              {/* Element List */}
              {elements.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    Elements ({elements.length})
                  </h3>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {elements.map((el, idx) => (
                      <div
                        key={el.id}
                        className={`flex items-center justify-between p-2 rounded text-sm cursor-pointer ${
                          selectedElementId === el.id ? 'bg-primary/10' : 'bg-muted/50'
                        }`}
                        onClick={() => {
                          setSelectedElementId(el.id);
                          setCurrentPage(el.page);
                        }}
                      >
                        <span className="capitalize">{el.type} (Page {el.page})</span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={(e) => { e.stopPropagation(); deleteElement(el.id); }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Right Column - PDF Preview */}
            <Card className="p-4 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Document</h2>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={resetAll} data-testid="button-reset">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    onClick={applyElements}
                    disabled={isProcessing || elements.length === 0}
                    data-testid="button-download"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {isProcessing ? "Processing..." : "Download PDF"}
                  </Button>
                </div>
              </div>

              {files.length === 0 ? (
                <FileUpload
                  onFilesChange={setFiles}
                  accept=".pdf"
                  multiple={false}
                  maxSizeMB={50}
                  fileType="pdf"
                />
              ) : pdfPages.length > 0 ? (
                <div className="space-y-4">
                  {/* Page Navigation */}
                  <div className="flex items-center justify-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      data-testid="button-prev-page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {pdfPages.length}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= pdfPages.length}
                      onClick={() => setCurrentPage(p => p + 1)}
                      data-testid="button-next-page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* PDF Canvas */}
                  <div
                    ref={pdfContainerRef}
                    className="relative bg-gray-100 rounded-lg overflow-auto max-h-[600px] cursor-crosshair"
                    onClick={handlePdfClick}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    data-testid="pdf-container"
                  >
                    <img
                      src={pdfPages[currentPage - 1]}
                      alt={`Page ${currentPage}`}
                      className="max-w-full pointer-events-none select-none"
                      data-page={currentPage}
                      draggable={false}
                    />
                    {currentPageElements.map(renderElement)}
                  </div>

                  {/* Selected Element Controls */}
                  {selectedElement && (
                    <Card className="p-3 bg-muted/50">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-sm font-medium capitalize">
                          {selectedElement.type} selected
                        </span>
                        
                        {(selectedElement.type === "rectangle" || selectedElement.type === "circle" || selectedElement.type === "line") && (
                          <>
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => resizeElement(selectedElement.id, -10, -10)}
                              >
                                <ZoomOut className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() => resizeElement(selectedElement.id, 10, 10)}
                              >
                                <ZoomIn className="h-3 w-3" />
                              </Button>
                            </div>
                            {(selectedElement.type === "rectangle" || selectedElement.type === "circle") && (
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  id="filled"
                                  checked={selectedElement.filled}
                                  onCheckedChange={(c) => updateElement(selectedElement.id, { filled: c === true })}
                                />
                                <Label htmlFor="filled" className="text-sm">Filled</Label>
                              </div>
                            )}
                          </>
                        )}

                        {selectedElement.type === "text" && (
                          <Input
                            value={selectedElement.content || ""}
                            onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })}
                            className="w-48 h-7 text-sm"
                            placeholder="Edit text..."
                          />
                        )}

                        {selectedElement.type === "signature" && (
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => resizeElement(selectedElement.id, -20, -8)}
                            >
                              <ZoomOut className="h-3 w-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => resizeElement(selectedElement.id, 20, 8)}
                            >
                              <ZoomIn className="h-3 w-3" />
                            </Button>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteElement(selectedElement.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-muted-foreground">Loading PDF...</p>
                </div>
              )}
            </Card>
          </div>

          {/* SEO Content */}
          <HowItWorks title="How It Works" steps={howItWorksSteps} />
          <Features title="Features" features={features} />
          <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
          <BenefitsBanner
            title="Completely Free"
            description="All form filling and signing features are free with no limits. Consider supporting us!"
            ctaText="Buy Me a Coffee"
            ctaHref="https://buymeacoffee.com/tymflo"
          />
        </div>
      </div>
    </>
  );
}
