import { useState, useCallback } from "react";
import { Trash2, Shield, Zap, Globe, Lock, CheckCircle, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SEO from "@/components/SEO";
import FileUpload from "@/components/FileUpload";
import ProcessingModal from "@/components/ProcessingModal";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageThumbnail {
  pageNumber: number;
  dataUrl: string;
  selected: boolean;
}

export default function PDFDeletePages() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageThumbnails, setPageThumbnails] = useState<PageThumbnail[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"processing" | "complete" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const generateThumbnails = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const thumbnails: PageThumbnail[] = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const scale = 0.3;
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise;

        thumbnails.push({
          pageNumber: i,
          dataUrl: canvas.toDataURL("image/jpeg", 0.7),
          selected: false,
        });
      }

      setPageThumbnails(thumbnails);
    } catch (error) {
      console.error("Error generating thumbnails:", error);
      toast({
        title: "Error",
        description: "Failed to load PDF pages. Please try a different file.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleFilesChange = useCallback((newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      generateThumbnails(newFiles[0]);
    } else {
      setPageThumbnails([]);
    }
  }, [generateThumbnails]);

  const togglePageSelection = (pageNumber: number) => {
    setPageThumbnails((prev) =>
      prev.map((p) =>
        p.pageNumber === pageNumber ? { ...p, selected: !p.selected } : p
      )
    );
  };

  const selectedCount = pageThumbnails.filter((p) => p.selected).length;
  const remainingPages = pageThumbnails.length - selectedCount;

  const handleDeletePages = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file first",
        variant: "destructive",
      });
      return;
    }

    if (selectedCount === 0) {
      toast({
        title: "No pages selected",
        description: "Please select at least one page to delete",
        variant: "destructive",
      });
      return;
    }

    if (remainingPages === 0) {
      toast({
        title: "Cannot delete all pages",
        description: "At least one page must remain in the PDF",
        variant: "destructive",
      });
      return;
    }

    setModalOpen(true);
    setProcessingStatus("processing");
    setProgress(0);

    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      setProgress(30);

      const pagesToDelete = pageThumbnails
        .filter((p) => p.selected)
        .map((p) => p.pageNumber - 1)
        .sort((a, b) => b - a);

      for (const pageIndex of pagesToDelete) {
        pdfDoc.removePage(pageIndex);
      }

      setProgress(70);

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      setProgress(100);
      setProcessingStatus("complete");
      setDownloadUrl(url);
      setFileName(files[0].name.replace(".pdf", "_modified.pdf"));
    } catch (error) {
      console.error("Delete pages error:", error);
      setProcessingStatus("error");
      toast({
        title: "Error",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setModalOpen(false);
      setFiles([]);
      setPageThumbnails([]);
      toast({
        title: "Download started",
        description: "Your modified PDF is downloading",
      });
    }
  };

  const howItWorksSteps = [
    {
      step: 1,
      title: "Upload Your PDF",
      description: "Drag and drop or click to upload the PDF file you want to edit.",
    },
    {
      step: 2,
      title: "Select Pages to Delete",
      description: "Click on the pages you want to remove. Selected pages are highlighted.",
    },
    {
      step: 3,
      title: "Download Modified PDF",
      description: "Get your new PDF with unwanted pages removed, ready in seconds.",
    },
  ];

  const features = [
    {
      icon: <Trash2 className="w-6 h-6" />,
      title: "Visual Page Selection",
      description: "See thumbnails of all pages and click to select which ones to delete.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Instant Processing",
      description: "Delete pages from large PDFs in seconds with client-side processing.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Private",
      description: "Your files never leave your browser. All processing happens locally.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Everywhere",
      description: "Use on any device - Windows, Mac, Linux, iOS, or Android. No installation.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without creating an account. Start editing PDFs immediately.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quality Preserved",
      description: "Original PDF quality maintained. No compression or degradation.",
    },
  ];

  const faqItems = [
    {
      question: "How do I delete pages from a PDF?",
      answer: "Upload your PDF, click on the page thumbnails you want to delete (they'll be highlighted), then click 'Delete Selected Pages'. You'll get a new PDF with those pages removed.",
    },
    {
      question: "Can I delete multiple pages at once?",
      answer: "Yes! You can select as many pages as you want to delete. Just click on each page you want to remove. All selected pages will be deleted when you click the delete button.",
    },
    {
      question: "Is my PDF uploaded to a server?",
      answer: "No! All processing happens directly in your browser. Your PDF never leaves your device, ensuring complete privacy and security for sensitive documents.",
    },
    {
      question: "Can I undo the deletion?",
      answer: "The original file is never modified. We create a new PDF without the deleted pages. Keep your original file if you might need those pages later.",
    },
    {
      question: "What's the maximum file size?",
      answer: "Since processing happens in your browser, you can work with files up to 100MB depending on your device's memory. For very large files, processing may take a bit longer.",
    },
  ];

  return (
    <>
      <SEO
        title="Delete PDF Pages Online - Free PDF Page Remover | TymFlo Hub"
        description="Remove unwanted pages from your PDF documents online. Free, fast, and private PDF page deletion tool."
        canonical="https://tymflohub.com/tools/pdf-delete-pages"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <Trash2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Delete PDF Pages
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Remove unwanted pages from your PDF documents
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <FileUpload
              accept="application/pdf"
              multiple={false}
              maxFiles={1}
              maxSizeMB={100}
              onFilesChange={handleFilesChange}
              fileType="pdf"
              files={files}
            />

            {loading && (
              <div className="mt-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
                <p className="text-muted-foreground">Loading PDF pages...</p>
              </div>
            )}

            {pageThumbnails.length > 0 && !loading && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-lg">
                      {pageThumbnails.length} pages
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    {selectedCount > 0 && (
                      <span className="text-sm text-destructive font-medium">
                        {selectedCount} page{selectedCount > 1 ? "s" : ""} selected for deletion
                      </span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setPageThumbnails((prev) =>
                          prev.map((p) => ({ ...p, selected: false }))
                        )
                      }
                      disabled={selectedCount === 0}
                      data-testid="button-clear-selection"
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  Click on pages to select them for deletion. Selected pages will be removed from your PDF.
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
                  {pageThumbnails.map((page) => (
                    <div
                      key={page.pageNumber}
                      onClick={() => togglePageSelection(page.pageNumber)}
                      className={`relative cursor-pointer group transition-all duration-200 rounded-lg overflow-hidden border-2 ${
                        page.selected
                          ? "border-destructive ring-2 ring-destructive/30"
                          : "border-gray-200 hover:border-primary/50"
                      }`}
                      data-testid={`page-thumbnail-${page.pageNumber}`}
                    >
                      <img
                        src={page.dataUrl}
                        alt={`Page ${page.pageNumber}`}
                        className={`w-full h-auto ${
                          page.selected ? "opacity-50" : ""
                        }`}
                      />
                      
                      {page.selected && (
                        <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
                          <div className="bg-destructive text-white rounded-full p-2">
                            <X className="w-6 h-6" />
                          </div>
                        </div>
                      )}

                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={page.selected}
                          className={`${
                            page.selected
                              ? "bg-destructive border-destructive"
                              : "bg-white/90"
                          }`}
                        />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-center text-xs py-1">
                        Page {page.pageNumber}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="text-sm text-muted-foreground">
                    {remainingPages === pageThumbnails.length ? (
                      "Select pages to delete"
                    ) : (
                      <>
                        <span className="font-medium text-foreground">
                          {remainingPages}
                        </span>{" "}
                        page{remainingPages !== 1 ? "s" : ""} will remain after deletion
                      </>
                    )}
                  </div>
                  <Button
                    onClick={handleDeletePages}
                    disabled={selectedCount === 0 || remainingPages === 0}
                    size="lg"
                    className="bg-destructive hover:bg-destructive/90 text-white"
                    data-testid="button-delete-pages"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete {selectedCount > 0 ? `${selectedCount} Page${selectedCount > 1 ? "s" : ""}` : "Selected Pages"}
                  </Button>
                </div>
              </div>
            )}
          </div>

          <HowItWorks title="How It Works" steps={howItWorksSteps} />
          <Features title="Why Use Our PDF Page Remover?" features={features} />
          <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
          <BenefitsBanner 
            title="Need More Features?"
            description="Upgrade to Pro for unlimited PDF processing, batch operations, and priority support."
            ctaText="View Plans"
            ctaHref="/pricing"
          />
        </div>
      </div>

      <ProcessingModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        status={processingStatus}
        progress={progress}
        onDownload={handleDownload}
        fileName={fileName}
      />
    </>
  );
}
