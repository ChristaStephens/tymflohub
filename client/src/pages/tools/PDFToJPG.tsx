import { useState } from "react";
import { Image, Shield, Zap, Globe, Lock, Download, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import SEO from "@/components/SEO";
import FileUpload from "@/components/FileUpload";
import ProcessingModal from "@/components/ProcessingModal";
import { useToast } from "@/hooks/use-toast";
import { HowItWorks, Features, FAQSection, BenefitsBanner } from "@/components/SEOContent";
import * as pdfjs from 'pdfjs-dist';

// Configure PDF.js worker - use jsdelivr CDN which works better in Replit
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export default function PDFToJPG() {
  const [files, setFiles] = useState<File[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<"processing" | "complete" | "error">("processing");
  const [progress, setProgress] = useState(0);
  const [convertedImages, setConvertedImages] = useState<{ dataUrl: string; pageNum: number }[]>([]);
  const { toast } = useToast();

  const handleConvert = async () => {
    if (files.length === 0) {
      toast({
        title: "No file selected",
        description: "Please select a PDF file to convert",
        variant: "destructive",
      });
      return;
    }

    setModalOpen(true);
    setProcessingStatus("processing");
    setProgress(0);
    setConvertedImages([]);

    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const images: { dataUrl: string; pageNum: number }[] = [];

      // Convert each page
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better quality
        
        // Create canvas
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (!context) {
          throw new Error("Failed to get canvas context");
        }

        // Render PDF page to canvas
        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas,
        } as any).promise;

        // Convert canvas to JPG data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        images.push({ dataUrl, pageNum });

        // Update progress
        setProgress(Math.round((pageNum / numPages) * 100));
      }

      setConvertedImages(images);
      setProcessingStatus("complete");
      toast({
        title: "Conversion complete",
        description: `Successfully converted ${images.length} page${images.length > 1 ? 's' : ''} to JPG`,
      });
    } catch (error) {
      console.error("PDF to JPG conversion error:", error);
      setProcessingStatus("error");
      toast({
        title: "Error",
        description: "Failed to convert PDF to JPG. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = (dataUrl: string, pageNum: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `page-${pageNum}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    convertedImages.forEach(({ dataUrl, pageNum }) => {
      setTimeout(() => downloadImage(dataUrl, pageNum), pageNum * 100);
    });
    toast({
      title: "Download started",
      description: `Downloading ${convertedImages.length} image${convertedImages.length > 1 ? 's' : ''}`,
    });
  };

  const howItWorksSteps = [
    {
      step: 1,
      title: "Upload Your PDF",
      description: "Drag and drop or click to upload the PDF file you want to convert to JPG images.",
    },
    {
      step: 2,
      title: "Automatic Conversion",
      description: "Each page is automatically converted to a high-quality JPG image with optimal settings.",
    },
    {
      step: 3,
      title: "Download Images",
      description: "Download individual pages or all images at once. Files are ready instantly.",
    },
  ];

  const features = [
    {
      icon: <Image className="w-6 h-6" />,
      title: "High Quality Output",
      description: "Convert PDF pages to JPG with excellent quality and resolution preservation.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Fast Processing",
      description: "Convert multi-page PDFs in seconds with our optimized client-side processing.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "100% Private",
      description: "All conversion happens in your browser. Your files never leave your device.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Offline",
      description: "Once loaded, works without internet connection. Perfect for sensitive documents.",
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "No Registration",
      description: "Free to use without creating an account. Start converting immediately.",
    },
    {
      icon: <CheckCircle className="w-6 h-6" />,
      title: "All Pages Supported",
      description: "Convert single or multi-page PDFs to individual JPG images.",
    },
  ];

  const faqItems = [
    {
      question: "How does PDF to JPG conversion work?",
      answer: "Our tool renders each PDF page at high resolution and converts it to a JPG image. All processing happens in your browser, so your files remain completely private and never get uploaded to our servers.",
    },
    {
      question: "Can I convert multi-page PDFs?",
      answer: "Yes! Each page of your PDF will be converted to a separate JPG image. You can download them individually or all at once.",
    },
    {
      question: "What quality will the JPG images be?",
      answer: "We use high-resolution rendering (2x scale) with 95% JPG quality to ensure your images look sharp and clear while maintaining reasonable file sizes.",
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely! Unlike other tools, our PDF to JPG converter runs entirely in your web browser. Your PDF never gets uploaded to any server, making it 100% private and secure.",
    },
    {
      question: "Do I need to install any software?",
      answer: "No installation required! This tool works entirely in your web browser on any device - Windows, Mac, Linux, iOS, or Android.",
    },
    {
      question: "What's the file size limit?",
      answer: "Since processing happens in your browser, the limit depends on your device's memory. Most modern devices can handle PDFs up to 50MB easily. Larger files may take longer to process.",
    },
  ];

  return (
    <>
      <SEO
        title="Convert PDF to JPG Online - Free PDF to Image Converter | TymFlo Hub"
        description="Convert PDF pages to JPG images online. Free, secure, and fast PDF to JPG converter with no upload required."
        canonical="https://tymflohub.com/tools/pdf-to-jpg"
      />

      <div className="min-h-screen bg-gradient-to-b from-accent/20 to-background py-12">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 mb-6">
              <Image className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
              PDF to JPG Converter
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Convert PDF pages to high-quality JPG images instantly
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <FileUpload
              accept="application/pdf"
              multiple={false}
              maxFiles={1}
              maxSizeMB={50}
              onFilesChange={setFiles}
              fileType="pdf"
              files={files}
            />

            <div className="mt-8">
              <Button
                size="lg"
                className="w-full h-14 rounded-xl text-lg"
                disabled={files.length === 0}
                onClick={handleConvert}
                data-testid="button-convert-pdf-to-jpg"
              >
                {files.length === 0 ? "Select a PDF" : "Convert to JPG"}
              </Button>
            </div>

            {convertedImages.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-primary">
                    Converted Images ({convertedImages.length})
                  </h3>
                  <Button
                    onClick={downloadAllImages}
                    variant="outline"
                    data-testid="button-download-all"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {convertedImages.map(({ dataUrl, pageNum }) => (
                    <Card key={pageNum} className="p-4">
                      <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden mb-3">
                        <img
                          src={dataUrl}
                          alt={`Page ${pageNum}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => downloadImage(dataUrl, pageNum)}
                        data-testid={`button-download-page-${pageNum}`}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Page {pageNum}
                      </Button>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <HowItWorks title="How to Convert PDF to JPG" steps={howItWorksSteps} />

      <Features title="Why Choose TymFlo PDF to JPG Converter?" features={features} />

      <FAQSection title="PDF to JPG Conversion FAQs" faqs={faqItems} />

      <BenefitsBanner
        title="Need More PDF Tools?"
        description="Get unlimited access to merge, split, compress, and all other PDF tools with TymFlo Pro. Try it free for 7 days."
        ctaText="Explore Pro Features"
        ctaHref="/pricing"
      />

      <ProcessingModal
        open={modalOpen && processingStatus !== "complete"}
        onOpenChange={setModalOpen}
        status={processingStatus}
        progress={progress}
        onDownload={() => {
          setModalOpen(false);
        }}
        fileName="Converted Images"
      />
    </>
  );
}
