import { useEffect, useState } from "react";
import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import * as pdfjs from "pdfjs-dist";

// Configure PDF.js worker - use jsdelivr CDN which works better in Replit
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  file: File;
  onPageCountLoaded?: (count: number) => void;
}

export default function PDFPreview({ file, onPageCountLoaded }: PDFPreviewProps) {
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPDF = async () => {
      setLoading(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const numPages = pdf.numPages;
        
        setPageCount(numPages);
        if (onPageCountLoaded) {
          onPageCountLoaded(numPages);
        }

        // Generate thumbnails for first 10 pages (or all if fewer)
        const thumbsToGenerate = Math.min(numPages, 10);
        const thumbPromises = [];

        for (let i = 1; i <= thumbsToGenerate; i++) {
          thumbPromises.push(generateThumbnail(pdf, i));
        }

        const thumbs = await Promise.all(thumbPromises);
        setThumbnails(thumbs);
        setLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setLoading(false);
      }
    };

    loadPDF();
  }, [file, onPageCountLoaded]);

  const generateThumbnail = async (pdf: any, pageNum: number): Promise<string> => {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    return canvas.toDataURL();
  };

  if (loading) {
    return (
      <Card className="p-8 text-center">
        <FileText className="w-12 h-12 mx-auto mb-4 text-primary animate-pulse" />
        <p className="text-muted-foreground">Loading PDF preview...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg text-primary">
          PDF Preview ({pageCount} pages)
        </h3>
        {thumbnails.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-2">
              Page {currentPage} of {Math.min(thumbnails.length, pageCount)}
            </span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(thumbnails.length, p + 1))}
              disabled={currentPage === thumbnails.length}
              data-testid="button-next-page"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {thumbnails.length > 0 && (
        <Card className="p-4 bg-muted/30">
          <img
            src={thumbnails[currentPage - 1]}
            alt={`Page ${currentPage}`}
            className="w-full h-auto rounded-lg border-2 border-border"
            data-testid="image-pdf-preview"
          />
        </Card>
      )}

      <div className="grid grid-cols-5 gap-2">
        {thumbnails.map((thumb, index) => (
          <button
            key={index}
            onClick={() => setCurrentPage(index + 1)}
            className={`relative rounded-lg border-2 transition-all hover-elevate ${
              currentPage === index + 1
                ? "border-primary ring-2 ring-primary/20"
                : "border-border"
            }`}
            data-testid={`button-thumbnail-${index + 1}`}
          >
            <img
              src={thumb}
              alt={`Page ${index + 1}`}
              className="w-full h-auto rounded"
            />
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
              {index + 1}
            </div>
          </button>
        ))}
        {pageCount > 10 && (
          <div className="flex items-center justify-center text-xs text-muted-foreground border-2 border-dashed border-border rounded-lg p-2">
            +{pageCount - 10} more
          </div>
        )}
      </div>
    </div>
  );
}
