import { useState, useMemo } from "react";
import { FileText, Clock, Hash, Type } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import SEO from "@/components/SEO";
import { HowItWorks, Features, FAQSection } from "@/components/SEOContent";

function analyzeText(text: string) {
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  const lines = text.split(/\n/).length;
  
  // Reading time (average 200 words per minute)
  const readingTimeMinutes = Math.ceil(words / 200);
  // Speaking time (average 150 words per minute)
  const speakingTimeMinutes = Math.ceil(words / 150);

  return {
    characters,
    charactersNoSpaces,
    words,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
    speakingTimeMinutes,
  };
}

export default function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => analyzeText(text), [text]);

  const statCards = [
    { label: "Words", value: stats.words, icon: FileText },
    { label: "Characters", value: stats.characters, icon: Hash },
    { label: "Characters (no spaces)", value: stats.charactersNoSpaces, icon: Type },
    { label: "Sentences", value: stats.sentences, icon: FileText },
    { label: "Paragraphs", value: stats.paragraphs, icon: FileText },
    { label: "Lines", value: stats.lines, icon: FileText },
  ];

  const howItWorksSteps = [
    { step: 1, title: "Paste Text", description: "Enter or paste your text in the box." },
    { step: 2, title: "View Stats", description: "See word count, character count, and more." },
    { step: 3, title: "Estimate Time", description: "Get reading and speaking time estimates." },
  ];

  const features = [
    { icon: <Hash className="w-6 h-6" />, title: "Detailed Stats", description: "Words, characters, sentences, paragraphs, and lines." },
    { icon: <Clock className="w-6 h-6" />, title: "Time Estimates", description: "Reading and speaking time calculations." },
    { icon: <FileText className="w-6 h-6" />, title: "Real-Time", description: "Stats update as you type." },
  ];

  const faqItems = [
    { question: "How is reading time calculated?", answer: "Based on an average reading speed of 200 words per minute." },
    { question: "How is speaking time calculated?", answer: "Based on an average speaking pace of 150 words per minute." },
    { question: "What counts as a paragraph?", answer: "Text blocks separated by two or more line breaks." },
  ];

  return (
    <>
      <SEO
        title="Word Counter - Count Words, Characters & More | TymFlo Hub"
        description="Free online word counter. Count words, characters, sentences, paragraphs, and get reading time estimates."
        canonical="https://tymflohub.com/tools/word-counter"
        keywords="word counter, character counter, word count, reading time"
      />

      <div className="py-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 min-h-[calc(100vh-4rem)]">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold">Word Counter</h1>
            </div>
            <p className="text-muted-foreground">
              Count words, characters, and estimate reading time
            </p>
          </div>

          <Card className="p-6 mb-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="text-center p-3 bg-muted rounded-lg"
                  data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Time Estimates */}
            <div className="flex gap-4 mb-6 justify-center">
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>{stats.readingTimeMinutes}</strong> min read
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                <Clock className="w-4 h-4 text-primary" />
                <span className="text-sm">
                  <strong>{stats.speakingTimeMinutes}</strong> min speak
                </span>
              </div>
            </div>

            {/* Text Input */}
            <Textarea
              placeholder="Type or paste your text here to count words and characters..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-64 resize-none text-base"
              data-testid="textarea-input"
            />
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
