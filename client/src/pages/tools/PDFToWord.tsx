import { useState, useCallback, useRef } from "react";
import { FileText, Upload, Download, Loader2, FileType, CheckCircle, AlertTriangle, Sparkles, Image, Type, Layout, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";
import * as pdfjsLib from "pdfjs-dist";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, ImageRun, AlignmentType, PageBreak, convertInchesToTwip, BorderStyle } from "docx";
import { saveAs } from "file-saver";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface ExtractedContent {
  type: "heading" | "paragraph" | "image";
  text?: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  fontSize?: number;
  bold?: boolean;
  imageData?: Uint8Array;
  width?: number;
  height?: number;
  pageNumber?: number;
}

interface ConversionStats {
  pages: number;
  textBlocks: number;
  images: number;
  headings: number;
}

export default function PDFToWord() {
  const [file, setFile] = useState<File | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [stats, setStats] = useState<ConversionStats | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
      setStats(null);
    } else {
      toast({ title: "Invalid File", description: "Please drop a PDF file.", variant: "destructive" });
    }
  }, [toast]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
      setStats(null);
    } else if (selectedFile) {
      toast({ title: "Invalid File", description: "Please select a PDF file.", variant: "destructive" });
    }
  };

  const detectHeadingLevel = (fontSize: number, avgFontSize: number, maxFontSize: number, textLength: number, isBold: boolean): 1 | 2 | 3 | 4 | 5 | 6 | null => {
    if (fontSize < avgFontSize * 1.1) return null;
    if (textLength > 200) return null;
    
    const ratio = fontSize / maxFontSize;
    if (ratio >= 0.85 || fontSize >= 24) return 1;
    if (ratio >= 0.7 || fontSize >= 18) return 2;
    if (ratio >= 0.55 || fontSize >= 14) return 3;
    if (isBold && fontSize >= avgFontSize * 1.1) return 4;
    return null;
  };

  interface TextItem {
    str: string;
    x: number;
    y: number;
    height: number;
    width: number;
    fontName?: string;
  }

  const extractTextFromPage = async (page: pdfjsLib.PDFPageProxy): Promise<ExtractedContent[]> => {
    const textContent = await page.getTextContent();
    const contents: ExtractedContent[] = [];
    const rawItems = textContent.items as any[];
    
    if (rawItems.length === 0) return contents;

    const items: TextItem[] = rawItems
      .filter(item => item.str && item.str.trim() !== "")
      .map(item => ({
        str: item.str,
        x: item.transform?.[4] || 0,
        y: item.transform?.[5] || 0,
        height: item.height || 12,
        width: item.width || 0,
        fontName: item.fontName || "",
      }));

    if (items.length === 0) return contents;

    let maxFontSize = 12;
    let totalFontSize = 0;
    items.forEach(item => {
      if (item.height > maxFontSize) maxFontSize = item.height;
      totalFontSize += item.height;
    });
    const avgFontSize = totalFontSize / items.length;

    items.sort((a, b) => {
      const yDiff = b.y - a.y;
      if (Math.abs(yDiff) > avgFontSize * 0.5) return yDiff;
      return a.x - b.x;
    });

    interface TextLine {
      items: TextItem[];
      y: number;
      avgFontSize: number;
    }

    const lines: TextLine[] = [];
    let currentLine: TextItem[] = [];
    let currentLineY = items[0]?.y || 0;

    for (const item of items) {
      if (currentLine.length === 0) {
        currentLine.push(item);
        currentLineY = item.y;
      } else if (Math.abs(item.y - currentLineY) < avgFontSize * 0.5) {
        currentLine.push(item);
      } else {
        currentLine.sort((a, b) => a.x - b.x);
        const lineAvgFont = currentLine.reduce((sum, i) => sum + i.height, 0) / currentLine.length;
        lines.push({ items: currentLine, y: currentLineY, avgFontSize: lineAvgFont });
        currentLine = [item];
        currentLineY = item.y;
      }
    }
    if (currentLine.length > 0) {
      currentLine.sort((a, b) => a.x - b.x);
      const lineAvgFont = currentLine.reduce((sum, i) => sum + i.height, 0) / currentLine.length;
      lines.push({ items: currentLine, y: currentLineY, avgFontSize: lineAvgFont });
    }

    let currentParagraph: TextLine[] = [];
    let lastLineFontSize = avgFontSize;

    const flushParagraph = () => {
      if (currentParagraph.length === 0) return;
      
      const text = currentParagraph
        .map(line => line.items.map(i => i.str).join(""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
      
      if (!text) {
        currentParagraph = [];
        return;
      }

      const paragraphFontSize = currentParagraph[0].avgFontSize;
      const isBold = currentParagraph[0].items[0]?.fontName?.toLowerCase().includes("bold") || false;
      const headingLevel = detectHeadingLevel(paragraphFontSize, avgFontSize, maxFontSize, text.length, isBold);
      
      if (headingLevel) {
        contents.push({
          type: "heading",
          text,
          level: headingLevel,
          fontSize: paragraphFontSize,
          bold: true,
        });
      } else {
        contents.push({
          type: "paragraph",
          text,
          fontSize: paragraphFontSize,
        });
      }
      currentParagraph = [];
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineFontSize = line.avgFontSize;
      
      const fontSizeChanged = Math.abs(lineFontSize - lastLineFontSize) > 2;
      const largeVerticalGap = i > 0 && Math.abs(lines[i-1].y - line.y) > avgFontSize * 2;
      
      if ((fontSizeChanged || largeVerticalGap) && currentParagraph.length > 0) {
        flushParagraph();
      }
      
      currentParagraph.push(line);
      lastLineFontSize = lineFontSize;
    }
    
    flushParagraph();

    return contents;
  };

  const extractImagesFromPage = async (page: pdfjsLib.PDFPageProxy, pageNum: number): Promise<ExtractedContent[]> => {
    const images: ExtractedContent[] = [];
    
    try {
      const operatorList = await page.getOperatorList();
      const objs = page.objs as any;
      
      for (let i = 0; i < operatorList.fnArray.length; i++) {
        const fn = operatorList.fnArray[i];
        
        if (fn === pdfjsLib.OPS.paintImageXObject) {
          const imageName = operatorList.argsArray[i][0];
          
          try {
            const imgData = objs.get(imageName);
            if (imgData && imgData.data) {
              const canvas = document.createElement("canvas");
              canvas.width = imgData.width;
              canvas.height = imgData.height;
              const ctx = canvas.getContext("2d");
              
              if (ctx) {
                const imageData = ctx.createImageData(imgData.width, imgData.height);
                
                if (imgData.data.length === imgData.width * imgData.height * 4) {
                  imageData.data.set(imgData.data);
                } else if (imgData.data.length === imgData.width * imgData.height * 3) {
                  for (let j = 0, k = 0; j < imgData.data.length; j += 3, k += 4) {
                    imageData.data[k] = imgData.data[j];
                    imageData.data[k + 1] = imgData.data[j + 1];
                    imageData.data[k + 2] = imgData.data[j + 2];
                    imageData.data[k + 3] = 255;
                  }
                }
                
                ctx.putImageData(imageData, 0, 0);
                
                const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, "image/png"));
                if (blob) {
                  const arrayBuffer = await blob.arrayBuffer();
                  images.push({
                    type: "image",
                    imageData: new Uint8Array(arrayBuffer),
                    width: Math.min(imgData.width, 600),
                    height: Math.min(imgData.height, 400),
                    pageNumber: pageNum,
                  });
                }
              }
            }
          } catch {
            // Skip this image if extraction fails
          }
        }
      }
    } catch {
      // Image extraction failed, continue without images
    }
    
    return images;
  };

  const convertToWord = async () => {
    if (!file) return;

    setIsConverting(true);
    setProgress(0);
    setProgressMessage("Loading PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      setProgress(10);
      setProgressMessage(`Analyzing ${numPages} pages...`);

      const allContent: ExtractedContent[] = [];
      let totalImages = 0;
      let totalHeadings = 0;
      let totalTextBlocks = 0;

      for (let i = 1; i <= numPages; i++) {
        setProgress(10 + (i / numPages) * 60);
        setProgressMessage(`Processing page ${i} of ${numPages}...`);

        const page = await pdf.getPage(i);
        
        const textContent = await extractTextFromPage(page);
        const images = await extractImagesFromPage(page, i);
        
        if (i > 1 && (textContent.length > 0 || images.length > 0)) {
          allContent.push({ type: "paragraph", text: "", pageNumber: i });
        }
        
        allContent.push(...textContent);
        allContent.push(...images);

        totalImages += images.length;
        totalHeadings += textContent.filter(c => c.type === "heading").length;
        totalTextBlocks += textContent.filter(c => c.type === "paragraph").length;
      }

      setProgress(75);
      setProgressMessage("Creating Word document...");

      const docChildren: Paragraph[] = [];

      for (const content of allContent) {
        if (content.type === "heading" && content.text) {
          const headingLevelMap: Record<number, typeof HeadingLevel[keyof typeof HeadingLevel]> = {
            1: HeadingLevel.HEADING_1,
            2: HeadingLevel.HEADING_2,
            3: HeadingLevel.HEADING_3,
            4: HeadingLevel.HEADING_4,
            5: HeadingLevel.HEADING_5,
            6: HeadingLevel.HEADING_6,
          };

          docChildren.push(
            new Paragraph({
              heading: headingLevelMap[content.level || 1],
              children: [
                new TextRun({
                  text: content.text,
                  bold: true,
                  size: content.level === 1 ? 48 : content.level === 2 ? 36 : content.level === 3 ? 28 : 24,
                }),
              ],
              spacing: { before: 240, after: 120 },
            })
          );
        } else if (content.type === "paragraph" && content.text) {
          docChildren.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: content.text,
                  size: 24,
                }),
              ],
              spacing: { after: 120 },
            })
          );
        } else if (content.type === "image" && content.imageData) {
          try {
            const maxWidth = 500;
            const maxHeight = 350;
            let width = content.width || 200;
            let height = content.height || 150;
            
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = Math.round(height * ratio);
            }
            if (height > maxHeight) {
              const ratio = maxHeight / height;
              height = maxHeight;
              width = Math.round(width * ratio);
            }

            docChildren.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: content.imageData,
                    transformation: {
                      width,
                      height,
                    },
                    type: "png",
                  }),
                ],
                spacing: { before: 120, after: 120 },
              })
            );
          } catch {
            // Skip image if it fails to insert
          }
        } else if (content.type === "paragraph" && !content.text && content.pageNumber && content.pageNumber > 1) {
          docChildren.push(
            new Paragraph({
              children: [new PageBreak()],
            })
          );
        }
      }

      if (docChildren.length === 0) {
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({
                text: "No text content could be extracted from this PDF. The PDF may contain only images or use embedded fonts that cannot be read.",
                size: 24,
              }),
            ],
          })
        );
      }

      setProgress(90);
      setProgressMessage("Generating file...");

      const doc = new Document({
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: convertInchesToTwip(1),
                  right: convertInchesToTwip(1),
                  bottom: convertInchesToTwip(1),
                  left: convertInchesToTwip(1),
                },
              },
            },
            children: docChildren,
          },
        ],
        styles: {
          paragraphStyles: [
            {
              id: "Normal",
              name: "Normal",
              basedOn: "Normal",
              next: "Normal",
              run: {
                font: "Calibri",
                size: 24,
              },
              paragraph: {
                spacing: { line: 276 },
              },
            },
          ],
        },
      });

      const blob = await Packer.toBlob(doc);
      const fileName = file.name.replace(/\.pdf$/i, "") + ".docx";
      saveAs(blob, fileName);

      setProgress(100);
      setProgressMessage("Conversion complete!");
      setStats({
        pages: numPages,
        textBlocks: totalTextBlocks,
        images: totalImages,
        headings: totalHeadings,
      });

      toast({
        title: "Conversion Complete!",
        description: `Successfully converted ${numPages} pages to Word format.`,
      });
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast({
        title: "Conversion Failed",
        description: error.message || "Failed to convert PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const resetConverter = () => {
    setFile(null);
    setStats(null);
    setProgress(0);
    setProgressMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const howItWorksSteps = [
    { step: 1, title: "Upload PDF", description: "Select or drag & drop your PDF file into the converter." },
    { step: 2, title: "Extract Content", description: "We analyze text, headings, images, and layout from each page." },
    { step: 3, title: "Download Word", description: "Get an editable .docx file with preserved formatting." },
  ];

  const features = [
    { icon: <Type className="w-6 h-6" />, title: "Editable Text", description: "All text is fully editable in Word with preserved formatting." },
    { icon: <Layout className="w-6 h-6" />, title: "Heading Detection", description: "Automatically detects and preserves heading hierarchy (H1-H4)." },
    { icon: <Image className="w-6 h-6" />, title: "Movable Images", description: "Images are embedded and can be moved/resized in Word." },
    { icon: <FileType className="w-6 h-6" />, title: "Page Breaks", description: "Maintains page structure with proper page breaks." },
    { icon: <Sparkles className="w-6 h-6" />, title: "AI-Ready PDFs", description: "Works great with PDFs generated from AI tools like ChatGPT." },
    { icon: <Download className="w-6 h-6" />, title: "Instant Download", description: "Get your Word document instantly - processed locally." },
  ];

  const faqItems = [
    { question: "What PDF files work best?", answer: "PDFs with selectable text work best. PDFs created from Word, Google Docs, or AI tools like ChatGPT convert with excellent quality. Scanned document images may not extract text properly." },
    { question: "Are images preserved?", answer: "Yes! Images embedded in the PDF are extracted and placed in the Word document. You can move and resize them freely in Word." },
    { question: "Are headings preserved?", answer: "Yes! We analyze font sizes to detect headings (H1-H4) and preserve the hierarchy in Word, making your document properly structured." },
    { question: "Is this free?", answer: "Yes! PDF to Word conversion is completely free with no limits. Convert as many documents as you need." },
    { question: "Is my file secure?", answer: "Absolutely. All processing happens in your browser. Your files never leave your device and are not uploaded to any server." },
  ];

  return (
    <>
      <SEO
        title="PDF to Word Converter - Free Online | TymFlo Hub"
        description="Convert PDF files to editable Word documents free. Preserves text, headings, images, and formatting. Works with AI-generated PDFs. No signup required."
        canonical="https://tymflohub.com/tools/pdf-to-word"
        keywords="pdf to word, convert pdf, pdf converter, docx converter, free pdf to word, editable word document"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <FileType className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              PDF to Word Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert PDF files to editable Word documents with preserved text, headings, and images
            </p>
          </div>

          <Card className="bg-white dark:bg-card rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                data-testid="dropzone-pdf"
              >
                <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <h3 className="text-xl font-semibold mb-2">Drop your PDF here</h3>
                <p className="text-muted-foreground mb-4">or click to browse</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-pdf-file"
                />
                <Button variant="outline" data-testid="button-browse">
                  <FileText className="w-4 h-4 mr-2" />
                  Select PDF File
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={resetConverter} disabled={isConverting} data-testid="button-remove-file">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {isConverting && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">{progressMessage}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )}

                {stats && !isConverting && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-700 dark:text-green-400">Conversion Complete!</span>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.pages}</div>
                        <div className="text-xs text-muted-foreground">Pages</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.headings}</div>
                        <div className="text-xs text-muted-foreground">Headings</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.textBlocks}</div>
                        <div className="text-xs text-muted-foreground">Paragraphs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{stats.images}</div>
                        <div className="text-xs text-muted-foreground">Images</div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={convertToWord}
                    disabled={isConverting}
                    className="flex-1 h-12"
                    data-testid="button-convert"
                  >
                    {isConverting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Converting...
                      </>
                    ) : stats ? (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Convert Again
                      </>
                    ) : (
                      <>
                        <FileType className="w-5 h-5 mr-2" />
                        Convert to Word
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={resetConverter} disabled={isConverting} data-testid="button-new-file">
                    New File
                  </Button>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    Best Results Tips
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Works best with PDFs that have selectable text (not scanned images)</li>
                    <li>PDFs from AI tools (ChatGPT, Claude) convert excellently</li>
                    <li>Complex layouts may need minor adjustments in Word</li>
                  </ul>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      <HowItWorks title="How PDF to Word Works" steps={howItWorksSteps} />

      <Features title="PDF to Word Features" features={features} />

      <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
    </>
  );
}
