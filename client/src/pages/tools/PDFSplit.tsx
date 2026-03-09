import { useState } from "react";
import { FileText, Shield, Zap, Globe, Lock, Scissors, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SEO from "@/components/SEO";
import FAQ from "@/components/FAQ";
import FileUpload from "@/components/FileUpload";
import ProcessingModal from "@/components/ProcessingModal";
import PDFPreview from "@/components/PDFPreview";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";

export default function PDFSplit() {
  const [files, setFiles] = useState<File[]>([]);
  const [startPage, setStartPage] = useState("1");
  const [endPage, setEndPage] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"processing" | "complete" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const { toast } = useToast();

  const handleSplit = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to split",
        variant: "destructive",
      });
      return;
    }

    setModalOpen(true);
    setProcessingStatus("processing");
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("startPage", startPage);
      if (endPage) {
        formData.append("endPage", endPage);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 15, 90));
      }, 300);

      const response = await fetch("/api/pdf/split", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error("Failed to split PDF");
      }

      const data = await response.json();
      setProgress(100);
      setProcessingStatus("complete");
      setDownloadUrl(data.downloadUrl);
      setFileName(data.filename);
    } catch (error) {
      console.error("Split error:", error);
      setProcessingStatus("error");
      toast({
        title: "Error",
        description: "Failed to split PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.location.href = downloadUrl;
      setModalOpen(false);
      setFiles([]);
      setStartPage("1");
      setEndPage("");
      setTotalPages(0);
      toast({
        title: "Download started",
        description: "Your split PDF is downloading",
      });
    }
  };

  const howItWorksSteps = [
    {
      step: 1,
      title: "Upload Your PDF",
      description: "Drag and drop or click to upload the PDF file you want to split.",
    },
    {
      step: 2,
      title: "Select Page Range",
      description: "Specify the start and end pages you want to extract into a new document.",
    },
    {
      step: 3,
      title: "Download Split PDF",
      description: "Get your new PDF containing only the pages you selected, ready in seconds.",
    },
  ];

  const features = [
    {
      icon: <Scissors className="w-6 h-6" />,
      title: "Precise Page Selection",
      description: "Extract exact page ranges or split into multiple documents with ease.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Processing",
      description: "Split large PDF files in seconds with our optimized processing engine.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "All files encrypted with 256-bit TLS. Auto-deleted after 1 hour.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Anywhere",
      description: "Use on any device - Windows, Mac, Linux, iOS, or Android. No installation needed.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without creating an account. Start splitting PDFs immediately.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quality Preserved",
      description: "Original PDF quality maintained. No compression or degradation.",
    },
  ];

  const faqItems = [
    {
      question: "How do I split a PDF into multiple files?",
      answer: "Upload your PDF, specify the start and end page numbers you want to extract, and click 'Split PDF'. You'll receive a new PDF containing only those pages. The original file remains unchanged.",
    },
    {
      question: "Can I split multiple PDFs at once?",
      answer: "Free users can split one PDF at a time with up to 10MB file size. Pro users get batch processing to split multiple PDFs simultaneously and support for files up to 100MB.",
    },
    {
      question: "Is the original PDF modified?",
      answer: "No, we create a new PDF file with your selected pages. The original file remains completely unchanged and is automatically deleted from our servers after 1 hour for your privacy.",
    },
    {
      question: "What page ranges can I extract?",
      answer: "You can extract any continuous range of pages. For example, pages 1-5, pages 10-20, or any custom range. For non-continuous pages, you'll need to run multiple split operations.",
    },
    {
      question: "Is there a limit on file size?",
      answer: "Free users can split PDFs up to 10MB. Pro users can split files up to 100MB. The page count doesn't matter - split PDFs with hundreds of pages.",
    },
  ];

  return (
    <>
      <SEO
        title="Split PDF Files Online - Free PDF Splitter | TymFlo Hub"
        description="Split PDF files and extract specific pages online. Free, fast, and easy-to-use PDF splitter tool."
        canonical="https://tymflohub.com/tools/pdf-split"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Split PDF Files
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Extract specific pages from your PDF documents
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <FileUpload
              accept="application/pdf"
              multiple={false}
              maxFiles={1}
              maxSizeMB={10}
              onFilesChange={setFiles}
              fileType="pdf"
              files={files}
            />

            {files.length > 0 && (
              <div className="mt-8">
                <PDFPreview 
                  file={files[0]} 
                  onPageCountLoaded={(count) => {
                    setTotalPages(count);
                    if (!endPage) {
                      setEndPage(count.toString());
                    }
                  }}
                />
              </div>
            )}

            <div className="mt-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="startPage" className="text-base font-semibold text-primary">
                    Start Page
                  </Label>
                  <Input
                    id="startPage"
                    type="number"
                    min="1"
                    max={totalPages || undefined}
                    placeholder="1"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2"
                    data-testid="input-start-page"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="endPage" className="text-base font-semibold text-primary">
                    End Page
                  </Label>
                  <Input
                    id="endPage"
                    type="number"
                    min="1"
                    max={totalPages || undefined}
                    placeholder={totalPages ? totalPages.toString() : "Last page"}
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    className="h-14 text-lg rounded-xl border-2"
                    data-testid="input-end-page"
                  />
                  {totalPages > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Total pages: {totalPages}
                    </p>
                  )}
                </div>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg"
                disabled={files.length === 0}
                onClick={handleSplit}
                data-testid="button-split-pdf"
              >
                {files.length === 0 ? "Select a PDF" : "Split PDF"}
              </Button>
            </div>
          </div>

        </div>
      </div>

      <HowItWorks title="How to Split PDF Files Online" steps={howItWorksSteps} />

      <Features title="Why Choose TymFlo PDF Splitter?" features={features} />

      <FAQSection title="PDF Splitting FAQs" faqs={faqItems} />

      <BenefitsBanner
        title="Need More PDF Tools?"
        description="Get unlimited access to merge, compress, rotate, and all other PDF tools with TymFlo Pro. Try it free for 7 days."
        ctaText="Explore Pro Features"
        ctaHref="/pricing"
      />

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
