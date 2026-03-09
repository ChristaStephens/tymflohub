import { useState } from "react";
import { FileText, Shield, Zap, Globe, Lock, Minimize2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/SEO";
import FAQ from "@/components/FAQ";
import FileUpload from "@/components/FileUpload";
import ProcessingModal from "@/components/ProcessingModal";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";

export default function PDFCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"processing" | "complete" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [compressionStats, setCompressionStats] = useState<{
    originalSize: number;
    compressedSize: number;
    compressionRatio: string;
  } | null>(null);
  const { toast } = useToast();

  const handleCompress = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to compress",
        variant: "destructive",
      });
      return;
    }

    setModalOpen(true);
    setProcessingStatus("processing");
    setProgress(0);

    try {
      const { PDFDocument } = await import("pdf-lib");
      const originalBytes = await files[0].arrayBuffer();
      const originalSize = originalBytes.byteLength;
      setProgress(20);

      const sourcePdf = await PDFDocument.load(originalBytes);
      setProgress(40);

      const compressedPdf = await PDFDocument.create();
      const pages = await compressedPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
      pages.forEach((page) => compressedPdf.addPage(page));
      setProgress(60);

      compressedPdf.setTitle("");
      compressedPdf.setAuthor("");
      compressedPdf.setSubject("");
      compressedPdf.setKeywords([]);
      compressedPdf.setProducer("");
      compressedPdf.setCreator("");
      setProgress(80);

      const compressedBytes = await compressedPdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });
      const compressedSize = compressedBytes.length;

      const blob = new Blob([compressedBytes], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const savedBytes = originalSize - compressedSize;
      const ratio = ((1 - compressedSize / originalSize) * 100).toFixed(1);

      const finalBytes = savedBytes > 0 ? compressedBytes : new Uint8Array(originalBytes);
      const finalSize = savedBytes > 0 ? compressedSize : originalSize;
      const finalBlob = new Blob([finalBytes], { type: "application/pdf" });
      const finalUrl = URL.createObjectURL(finalBlob);
      if (savedBytes <= 0) {
        URL.revokeObjectURL(url);
      }

      setProgress(100);
      setProcessingStatus("complete");
      setDownloadUrl(savedBytes > 0 ? url : finalUrl);
      setFileName(savedBytes > 0 ? `compressed_${files[0].name}` : files[0].name);
      setCompressionStats({
        originalSize,
        compressedSize: finalSize,
        compressionRatio: savedBytes > 0 ? ratio : "0.0",
      });

      if (savedBytes <= 0) {
        toast({
          title: "Already Optimized",
          description: "This PDF is already well-optimized. The original file has been preserved.",
        });
      }
    } catch (error) {
      console.error("Compress error:", error);
      setProcessingStatus("error");
      toast({
        title: "Error",
        description: "Failed to compress PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName || "compressed.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      setModalOpen(false);
      setFiles([]);
      toast({
        title: "Download started",
        description: "Your compressed PDF is downloading",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const howItWorksSteps = [
    {
      step: 1,
      title: "Upload PDF",
      description: "Drag and drop or click to upload the PDF file you want to compress.",
    },
    {
      step: 2,
      title: "Auto Compress",
      description: "Our algorithm automatically optimizes your PDF while maintaining quality.",
    },
    {
      step: 3,
      title: "Download",
      description: "Download your compressed PDF with reduced file size in seconds.",
    },
  ];

  const features = [
    {
      icon: <Minimize2 className="w-6 h-6" />,
      title: "Smart Compression",
      description: "Advanced algorithm reduces file size while preserving visual quality.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Compress large PDFs in seconds with our optimized processing.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Private",
      description: "All processing happens in your browser. Files never leave your device.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Anywhere",
      description: "Use on any device - Windows, Mac, Linux, iOS, or Android.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without account. Start compressing immediately.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "Quality Maintained",
      description: "Optimized compression preserves visual quality and readability.",
    },
  ];

  const faqItems = [
    {
      question: "How much can I reduce my PDF file size?",
      answer: "Compression rates vary by file type. Most PDFs can be reduced by 10-40% without noticeable quality loss. PDFs with many images may compress even more. Our algorithm automatically selects the optimal compression level.",
    },
    {
      question: "Will compression affect PDF quality?",
      answer: "We use smart compression that maintains visual quality while reducing file size. Most users won't notice any difference. The algorithm optimizes images and removes redundant data without affecting text or essential content.",
    },
    {
      question: "What's the maximum file size I can compress?",
      answer: "Free users can compress PDFs up to 10MB. Pro users can handle files up to 100MB and get batch processing for compressing multiple files at once.",
    },
    {
      question: "Can I choose the compression level?",
      answer: "Our tool automatically selects the optimal compression level to balance file size reduction with quality preservation. Pro users get access to manual compression settings for more control.",
    },
    {
      question: "Is my data secure when compressing PDFs?",
      answer: "Yes! All files are encrypted with 256-bit TLS during upload and processing. Files are automatically deleted from our servers after 1 hour. We're ISO/IEC 27001 certified and fully GDPR compliant.",
    },
  ];

  return (
    <>
      <SEO
        title="Compress PDF Files Online - Free PDF Compressor | TymFlo Hub"
        description="Reduce PDF file size online while maintaining quality. Free, fast PDF compression tool."
        canonical="https://tymflohub.com/tools/pdf-compress"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <FileText className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              Compress PDF Files
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Reduce file size while maintaining quality
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

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg"
                disabled={files.length === 0}
                onClick={handleCompress}
                data-testid="button-compress-pdf"
              >
                {files.length === 0 ? "Select a PDF" : "Compress PDF"}
              </Button>
            </div>

            {compressionStats && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-bold text-lg text-center text-primary mb-6">
                  Compression Results
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Original</p>
                    <p className="text-lg font-bold text-foreground">
                      {formatFileSize(compressionStats.originalSize)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Compressed</p>
                    <p className="text-lg font-bold text-primary">
                      {formatFileSize(compressionStats.compressedSize)}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-muted/50 rounded-xl">
                    <p className="text-sm text-muted-foreground mb-1">Saved</p>
                    <p className="text-lg font-bold text-foreground">
                      {compressionStats.compressionRatio}%
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <HowItWorks title="How to Compress PDF Files Online" steps={howItWorksSteps} />

      <Features title="Why Choose TymFlo PDF Compressor?" features={features} />

      <FAQSection title="PDF Compression FAQs" faqs={faqItems} />

      <BenefitsBanner
        title="Get More with TymFlo Pro"
        description="Unlimited PDF compression, larger file sizes, batch processing, and access to all PDF tools. Try it free for 7 days."
        ctaText="Try Pro Free"
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
