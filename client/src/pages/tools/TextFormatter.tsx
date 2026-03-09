import { useState } from "react";
import { Wand2, Copy, Check, Trash2, Bold, Heading1, List, Code } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
}

function stripMarkdown(md: string): string {
  return md
    .replace(/#{1,6}\s?/g, "") // headers
    .replace(/(\*\*|__)(.*?)\1/g, "$2") // bold
    .replace(/(\*|_)(.*?)\1/g, "$2") // italic
    .replace(/~~(.*?)~~/g, "$1") // strikethrough
    .replace(/`{1,3}[^`]*`{1,3}/g, (match) => match.replace(/`/g, "")) // code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // images
    .replace(/^\s*[-*+]\s+/gm, "") // unordered lists
    .replace(/^\s*\d+\.\s+/gm, "") // ordered lists
    .replace(/^\s*>\s+/gm, "") // blockquotes
    .replace(/---+/g, "") // horizontal rules
    .trim();
}

function textToMarkdown(text: string, format: string): string {
  const lines = text.split("\n");
  
  switch (format) {
    case "heading1":
      return lines.map(l => l.trim() ? `# ${l}` : l).join("\n");
    case "heading2":
      return lines.map(l => l.trim() ? `## ${l}` : l).join("\n");
    case "heading3":
      return lines.map(l => l.trim() ? `### ${l}` : l).join("\n");
    case "bold":
      return lines.map(l => l.trim() ? `**${l}**` : l).join("\n");
    case "italic":
      return lines.map(l => l.trim() ? `*${l}*` : l).join("\n");
    case "bulletlist":
      return lines.map(l => l.trim() ? `- ${l}` : l).join("\n");
    case "numberedlist":
      return lines.map((l, i) => l.trim() ? `${i + 1}. ${l}` : l).join("\n");
    case "blockquote":
      return lines.map(l => l.trim() ? `> ${l}` : l).join("\n");
    case "code":
      return "```\n" + text + "\n```";
    case "inlinecode":
      return lines.map(l => l.trim() ? `\`${l}\`` : l).join("\n");
    default:
      return text;
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, " ") // multiple spaces to single
    .replace(/\n{3,}/g, "\n\n") // multiple newlines to double
    .trim();
}

function removeExtraSpaces(text: string): string {
  return text.replace(/  +/g, " ").trim();
}

function removeLineBreaks(text: string): string {
  return text.replace(/\n+/g, " ").trim();
}

export default function TextFormatter() {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!outputText) return;
    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const applyAction = (action: string) => {
    let result = inputText;
    
    switch (action) {
      case "strip-html":
        result = stripHtml(inputText);
        break;
      case "strip-markdown":
        result = stripMarkdown(inputText);
        break;
      case "clean":
        result = cleanText(inputText);
        break;
      case "remove-spaces":
        result = removeExtraSpaces(inputText);
        break;
      case "remove-linebreaks":
        result = removeLineBreaks(inputText);
        break;
      default:
        if (action.startsWith("md-")) {
          result = textToMarkdown(inputText, action.replace("md-", ""));
        }
    }
    
    setOutputText(result);
  };

  const howItWorksSteps = [
    { step: 1, title: "Paste Text", description: "Enter your text that needs formatting." },
    { step: 2, title: "Choose Action", description: "Select a formatting action to apply." },
    { step: 3, title: "Copy Result", description: "Copy the formatted text to use anywhere." },
  ];

  const features = [
    { icon: <Trash2 className="w-6 h-6" />, title: "Strip Markup", description: "Remove HTML or Markdown formatting." },
    { icon: <Bold className="w-6 h-6" />, title: "Add Formatting", description: "Convert text to Markdown with headers, bold, lists." },
    { icon: <Wand2 className="w-6 h-6" />, title: "Clean Text", description: "Remove extra spaces and line breaks." },
  ];

  const faqItems = [
    { question: "What is Markdown?", answer: "Markdown is a lightweight markup language for creating formatted text using simple symbols like # for headers and ** for bold." },
    { question: "Can I remove HTML tags?", answer: "Yes! Use the 'Strip HTML' option to remove all HTML tags and keep only the text content." },
    { question: "How do I clean up messy text?", answer: "Use 'Clean Text' to normalize spaces and line breaks, or use specific options like 'Remove Extra Spaces'." },
  ];

  return (
    <>
      <SEO
        title="Text Formatter - Clean & Format Text Online | TymFlo Hub"
        description="Free text formatter tool. Remove HTML/Markdown, add formatting, clean up messy text, and convert to Markdown."
        canonical="https://tymflohub.com/tools/text-formatter"
        keywords="text formatter, remove html, markdown converter, clean text"
      />

      <div className="py-8 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Text Formatter</h1>
            </div>
            <p className="text-muted-foreground">
              Clean up text, remove markup, or add formatting
            </p>
          </div>

          <Card className="p-6 mb-8">
            <Tabs defaultValue="remove" className="mb-6">
              <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
                <TabsTrigger value="remove">Remove Markup</TabsTrigger>
                <TabsTrigger value="add">Add Markup</TabsTrigger>
                <TabsTrigger value="clean">Clean Text</TabsTrigger>
              </TabsList>

              <TabsContent value="remove" className="mt-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => applyAction("strip-html")} data-testid="button-strip-html">
                    Strip HTML
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("strip-markdown")} data-testid="button-strip-markdown">
                    Strip Markdown
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="add" className="mt-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-heading1")} data-testid="button-h1">
                    <Heading1 className="w-4 h-4 mr-1" /> H1
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-heading2")} data-testid="button-h2">
                    H2
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-heading3")} data-testid="button-h3">
                    H3
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-bold")} data-testid="button-bold">
                    <Bold className="w-4 h-4 mr-1" /> Bold
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-italic")} data-testid="button-italic">
                    Italic
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-bulletlist")} data-testid="button-bullet">
                    <List className="w-4 h-4 mr-1" /> Bullets
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-numberedlist")} data-testid="button-numbered">
                    Numbered
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-blockquote")} data-testid="button-quote">
                    Quote
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("md-code")} data-testid="button-codeblock">
                    <Code className="w-4 h-4 mr-1" /> Code Block
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="clean" className="mt-4">
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => applyAction("clean")} data-testid="button-clean">
                    Clean All
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("remove-spaces")} data-testid="button-remove-spaces">
                    Remove Extra Spaces
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => applyAction("remove-linebreaks")} data-testid="button-remove-lines">
                    Remove Line Breaks
                  </Button>
                </div>
              </TabsContent>
            </Tabs>

            {/* Input */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">Input Text</label>
              <Textarea
                placeholder="Paste your text here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="min-h-32 resize-none font-mono text-sm"
                data-testid="textarea-input"
              />
            </div>

            {/* Output */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Result</label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!outputText}
                  data-testid="button-copy"
                >
                  {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
              <div 
                className="min-h-32 p-4 bg-muted rounded-md font-mono text-sm whitespace-pre-wrap"
                data-testid="text-output"
              >
                {outputText || <span className="text-muted-foreground">Formatted text will appear here...</span>}
              </div>
            </div>
          </Card>

          <div className="space-y-12">
            <HowItWorks title="How It Works" steps={howItWorksSteps} />
            <Features title="Features" features={features} />
            <FAQSection title="Frequently Asked Questions" faqs={faqItems} />
          </div>
        </div>
      </div>
    </>
  );
}
