import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  LayoutDashboard,
  CheckSquare,
  FileText,
  MessageSquare,
  Send,
  CheckCircle2,
  Flag,
  Upload,
  ArrowRight,
  Menu,
  X,
  ExternalLink,
} from "lucide-react";
import tymfloLogoPath from "@assets/Tymflo-horizontal-crlPng_1761361152989.png";
import tymfloIconPath from "@assets/Tymflo-icon-crlPng_-_Copy_1767738458395.png";

type Section = "dashboard" | "approvals" | "documents" | "chat";

interface ActivityItem {
  id: number;
  date: string;
  text: string;
}

interface Metric {
  label: string;
  value: string;
  note: string;
}

interface ApprovalItem {
  id: number;
  type: string;
  title: string;
  preview: string;
  platform: string;
  scheduledFor: string;
  status: "pending" | "approved" | "flagged";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const NAV_ITEMS = [
  { id: "dashboard" as Section, label: "Overview", icon: LayoutDashboard },
  { id: "approvals" as Section, label: "Approvals", icon: CheckSquare },
  { id: "documents" as Section, label: "Documents", icon: FileText },
  { id: "chat" as Section, label: "Ask TymFlo", icon: MessageSquare },
];

export default function ClientPortal() {
  const [section, setSection] = useState<Section>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#FAFAF8]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .tf-coral { color: #F69679; }
        .tf-bg-coral { background-color: #F69679; }
        .tf-border-coral { border-color: #F69679; }
        .tf-bg-coral-light { background-color: #FEF3EF; }
        .tf-btn {
          background-color: #F69679;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 20px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .tf-btn:hover { opacity: 0.88; }
        .tf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .portal-sidebar {
          width: 240px;
          min-height: 100vh;
          background: white;
          border-right: 1px solid #F0EDE8;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          color: #6B6B6B;
          transition: all 0.15s;
          margin: 2px 8px;
          font-weight: 450;
        }
        .nav-item:hover { background: #FEF3EF; color: #F69679; }
        .nav-item.active { background: #FEF3EF; color: #F69679; font-weight: 600; }
        @media (max-width: 768px) {
          .portal-sidebar { display: none; }
          .portal-sidebar.open { display: flex; position: fixed; top: 0; left: 0; z-index: 50; height: 100vh; }
        }
      `}</style>

      {/* Sidebar */}
      <div className={`portal-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="p-5 border-b border-[#F0EDE8]">
          <img src={tymfloLogoPath} alt="TymFlo" className="h-7 w-auto" />
        </div>
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${section === item.id ? "active" : ""}`}
              onClick={() => { setSection(item.id); setSidebarOpen(false); }}
              data-testid={`nav-${item.id}`}
            >
              <item.icon size={16} />
              {item.label}
            </div>
          ))}
        </nav>
        <div className="p-5 border-t border-[#F0EDE8]">
          <p className="text-xs text-[#B0ADA8]">Client Portal</p>
          <p className="text-xs text-[#B0ADA8] mt-0.5">Powered by TymFlo</p>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-[#F0EDE8]">
          <img src={tymfloIconPath} alt="TymFlo" className="h-8 w-auto" />
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[#6B6B6B]">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        <main className="flex-1 overflow-auto">
          {section === "dashboard" && <DashboardSection />}
          {section === "approvals" && <ApprovalsSection />}
          {section === "documents" && <DocumentsSection />}
          {section === "chat" && <ChatSection />}
        </main>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function DashboardSection() {
  const [request, setRequest] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const submitMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest("POST", "/api/portal/request", { text }),
    onSuccess: () => {
      setSubmitted(true);
      setRequest("");
      toast({ title: "Request received", description: "Your team will handle it." });
    },
  });

  const { data: activityData } = useQuery<{ items: ActivityItem[] }>({
    queryKey: ["/api/portal/activity"],
  });

  const { data: metricsData } = useQuery<{ metrics: Metric[] }>({
    queryKey: ["/api/portal/metrics"],
  });

  const activity = activityData?.items ?? defaultActivity;
  const metrics = metricsData?.metrics ?? defaultMetrics;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Good to see you.</h1>
        <p className="text-[#888] mt-1 text-sm">Here's what's happening with your marketing.</p>
      </div>

      {/* Request box — always at top */}
      <div className="mb-8 bg-white rounded-xl border border-[#F0EDE8] p-5 shadow-sm">
        <p className="text-xs font-semibold text-[#F69679] uppercase tracking-wider mb-3">Quick Request</p>
        {submitted ? (
          <div className="flex items-center gap-3 py-2">
            <CheckCircle2 size={20} className="text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-[#1A1A1A]">Got it — your team is on it.</p>
              <button
                className="text-xs text-[#F69679] mt-0.5 underline"
                onClick={() => setSubmitted(false)}
              >
                Send another request
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <Textarea
              placeholder="Type anything — a quick note, a change, a heads up. One sentence is enough."
              value={request}
              onChange={(e) => setRequest(e.target.value)}
              className="flex-1 resize-none text-sm border-[#E8E4DE] bg-[#FAFAF8] min-h-[60px]"
              data-testid="input-request"
            />
            <button
              className="tf-btn flex-shrink-0 h-[60px] px-4"
              onClick={() => { if (request.trim()) submitMutation.mutate(request.trim()); }}
              disabled={!request.trim() || submitMutation.isPending}
              data-testid="button-submit-request"
            >
              <Send size={15} />
              {submitMutation.isPending ? "Sending…" : "Send"}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Activity feed */}
        <div className="md:col-span-2 bg-white rounded-xl border border-[#F0EDE8] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EDE8]">
            <p className="font-semibold text-[#1A1A1A] text-sm">What TymFlo Did This Week</p>
          </div>
          <div className="divide-y divide-[#F7F4F0]">
            {activity.map((item) => (
              <div key={item.id} className="px-5 py-4" data-testid={`activity-item-${item.id}`}>
                <p className="text-xs text-[#B0ADA8] mb-1">{item.date}</p>
                <p className="text-sm text-[#3A3A3A] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics snapshot */}
        <div className="flex flex-col gap-4">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-[#F0EDE8] shadow-sm p-5"
              data-testid={`metric-card-${i}`}
            >
              <p className="text-2xl font-bold text-[#1A1A1A]">{m.value}</p>
              <p className="text-xs font-semibold text-[#F69679] uppercase tracking-wider mt-1 mb-2">{m.label}</p>
              <p className="text-xs text-[#888] leading-relaxed">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── APPROVALS ────────────────────────────────────────────── */
function ApprovalsSection() {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery<{ items: ApprovalItem[] }>({
    queryKey: ["/api/portal/approvals"],
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "flagged" }) =>
      apiRequest("POST", "/api/portal/approve", { id, status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["/api/portal/approvals"] });
      toast({
        title: status === "approved" ? "Approved" : "Flagged for review",
        description: status === "approved"
          ? "Your team will publish this as scheduled."
          : "Your team will make adjustments.",
      });
    },
  });

  const items = data?.items ?? defaultApprovals;
  const pending = items.filter((i) => i.status === "pending");
  const decided = items.filter((i) => i.status !== "pending");

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Content Sign-Off</h1>
        <p className="text-[#888] mt-1 text-sm">Green check or red flag — that's all it takes.</p>
      </div>

      {pending.length === 0 && (
        <div className="bg-white rounded-xl border border-[#F0EDE8] p-10 text-center shadow-sm">
          <CheckCircle2 size={36} className="text-green-400 mx-auto mb-3" />
          <p className="font-medium text-[#1A1A1A]">You're all caught up.</p>
          <p className="text-sm text-[#888] mt-1">No content waiting for your sign-off right now.</p>
        </div>
      )}

      <div className="flex flex-col gap-4 mb-8">
        {pending.map((item) => (
          <ApprovalCard
            key={item.id}
            item={item}
            onDecide={(status) => approveMutation.mutate({ id: item.id, status })}
            isPending={approveMutation.isPending}
          />
        ))}
      </div>

      {decided.length > 0 && (
        <>
          <p className="text-xs font-semibold text-[#B0ADA8] uppercase tracking-wider mb-3">Already reviewed</p>
          <div className="flex flex-col gap-3">
            {decided.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#F0EDE8] p-4 flex items-center justify-between shadow-sm opacity-60"
                data-testid={`approval-decided-${item.id}`}
              >
                <div>
                  <p className="text-sm font-medium text-[#3A3A3A]">{item.title}</p>
                  <p className="text-xs text-[#B0ADA8]">{item.platform} · {item.scheduledFor}</p>
                </div>
                {item.status === "approved" ? (
                  <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Flag size={18} className="text-red-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ApprovalCard({
  item,
  onDecide,
  isPending,
}: {
  item: ApprovalItem;
  onDecide: (status: "approved" | "flagged") => void;
  isPending: boolean;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#F0EDE8] shadow-sm overflow-hidden" data-testid={`approval-card-${item.id}`}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <Badge variant="outline" className="text-xs mb-2 border-[#F0EDE8] text-[#888]">
              {item.type} · {item.platform}
            </Badge>
            <p className="font-semibold text-[#1A1A1A] text-sm">{item.title}</p>
            <p className="text-xs text-[#B0ADA8] mt-0.5">Scheduled: {item.scheduledFor}</p>
          </div>
        </div>
        <div className="bg-[#FAFAF8] rounded-lg p-4 border border-[#F0EDE8]">
          <p className="text-sm text-[#3A3A3A] leading-relaxed">{item.preview}</p>
        </div>
      </div>
      <div className="px-5 pb-5 flex gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold border border-green-100 hover:bg-green-100 transition-colors"
          onClick={() => onDecide("approved")}
          disabled={isPending}
          data-testid={`button-approve-${item.id}`}
        >
          <CheckCircle2 size={16} />
          Looks good
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold border border-red-100 hover:bg-red-100 transition-colors"
          onClick={() => onDecide("flagged")}
          disabled={isPending}
          data-testid={`button-flag-${item.id}`}
        >
          <Flag size={16} />
          Flag for team
        </button>
      </div>
    </div>
  );
}

/* ─── DOCUMENTS ──────────────────────────────────────────────── */
function DocumentsSection() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const summarizeMutation = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/portal/summarize", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error("Failed to summarize");
      return res.json() as Promise<{ summary: string }>;
    },
    onSuccess: (data) => {
      setSummary(data.summary);
    },
    onError: () => {
      toast({ title: "Couldn't process file", description: "Try a PDF, PNG, or CSV under 10MB.", variant: "destructive" });
    },
  });

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setSummary(null); }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setSummary(null); }
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Document Summary</h1>
        <p className="text-[#888] mt-1 text-sm">Drop a file, get the key takeaways. No reading required.</p>
      </div>

      {/* Drop zone */}
      <div
        className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer mb-6 ${
          dragging ? "border-[#F69679] bg-[#FEF3EF]" : "border-[#E8E4DE] bg-white"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        data-testid="dropzone-document"
      >
        <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
          <Upload size={32} className={dragging ? "text-[#F69679]" : "text-[#C4BFB8]"} />
          <p className="mt-4 text-sm font-medium text-[#3A3A3A]">
            {file ? file.name : "Drop your file here"}
          </p>
          <p className="text-xs text-[#B0ADA8] mt-1">PDF, PNG, or CSV — up to 10MB</p>
          {file && !summary && (
            <button
              className="tf-btn mt-4"
              onClick={(e) => { e.stopPropagation(); summarizeMutation.mutate(file); }}
              disabled={summarizeMutation.isPending}
              data-testid="button-summarize"
            >
              {summarizeMutation.isPending ? "Reading…" : "Get Summary"}
              {!summarizeMutation.isPending && <ArrowRight size={14} />}
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx"
          className="hidden"
          onChange={handleFileChange}
          data-testid="input-file"
        />
      </div>

      {/* Summary result */}
      {summary && (
        <div className="bg-white rounded-xl border border-[#F0EDE8] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EDE8] flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1A1A1A]">Summary</p>
            <Badge variant="outline" className="text-xs border-[#F0EDE8] text-[#888]">{file?.name}</Badge>
          </div>
          <div className="p-5">
            <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-wrap" data-testid="text-summary">{summary}</p>
          </div>
          <div className="px-5 pb-5">
            <button
              className="text-xs text-[#F69679] underline"
              onClick={() => { setFile(null); setSummary(null); if (fileRef.current) fileRef.current.value = ""; }}
              data-testid="button-upload-new"
            >
              Upload a different file
            </button>
          </div>
        </div>
      )}

      {summarizeMutation.isPending && (
        <div className="bg-white rounded-xl border border-[#F0EDE8] shadow-sm p-8 text-center">
          <div className="w-8 h-8 border-2 border-[#F69679] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#888]">Reading your file…</p>
        </div>
      )}
    </div>
  );
}

/* ─── CHAT ───────────────────────────────────────────────────── */
function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi — I'm your TymFlo assistant. Ask me anything about your account, what's going live, or how your marketing is performing. I'll give you a straight answer.",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest("POST", "/api/portal/chat", { message: text, history: messages }) as Promise<{ reply: string }>,
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
    onError: () => {
      toast({ title: "Couldn't reach TymFlo AI", description: "Try again in a moment.", variant: "destructive" });
    },
  });

  function send() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    chatMutation.mutate(text);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-57px)] md:h-screen">
      {/* Header */}
      <div className="px-6 md:px-8 py-5 border-b border-[#F0EDE8] bg-white">
        <h1 className="text-xl font-semibold text-[#1A1A1A]">Ask TymFlo Anything</h1>
        <p className="text-xs text-[#888] mt-0.5">Your marketing assistant — no email required.</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-6 md:px-8 py-6 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            data-testid={`chat-message-${i}`}
          >
            {msg.role === "assistant" && (
              <img src={tymfloIconPath} alt="" className="w-7 h-7 mr-3 flex-shrink-0 mt-0.5 opacity-80" />
            )}
            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#F69679] text-white"
                  : "bg-white border border-[#F0EDE8] text-[#3A3A3A] shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {chatMutation.isPending && (
          <div className="flex justify-start">
            <img src={tymfloIconPath} alt="" className="w-7 h-7 mr-3 flex-shrink-0 opacity-80" />
            <div className="bg-white border border-[#F0EDE8] rounded-xl px-4 py-3 shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F69679] animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F69679] animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-[#F69679] animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-6 md:px-8 py-4 border-t border-[#F0EDE8] bg-white">
        <div className="flex gap-3 max-w-3xl mx-auto">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask anything about your marketing…"
            className="flex-1 resize-none text-sm border-[#E8E4DE] bg-[#FAFAF8] min-h-[44px] max-h-[120px]"
            data-testid="input-chat"
          />
          <button
            className="tf-btn flex-shrink-0 px-4 h-[44px]"
            onClick={send}
            disabled={!input.trim() || chatMutation.isPending}
            data-testid="button-send-chat"
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-xs text-[#B0ADA8] mt-2 text-center">
          Responses are AI-generated based on your TymFlo account context.
        </p>
      </div>
    </div>
  );
}

/* ─── DEFAULT DATA ────────────────────────────────────────────── */
const defaultActivity: ActivityItem[] = [
  { id: 1, date: "March 28, 2026", text: "Posted 3 times to Instagram. Engagement is up 18% from last week." },
  { id: 2, date: "March 27, 2026", text: "Sent email campaign to 1,240 contacts. Open rate: 34% — above industry average." },
  { id: 3, date: "March 26, 2026", text: "Updated your Google Business profile with new hours and 2 fresh photos." },
  { id: 4, date: "March 25, 2026", text: "Published 1 LinkedIn article and boosted your top-performing post from last month." },
  { id: 5, date: "March 24, 2026", text: "Researched and drafted next week's content — 7 posts ready for review." },
];

const defaultMetrics: Metric[] = [
  { label: "Website Visitors", value: "1,847", note: "Up 12% from last month. Your product page is getting the most traffic." },
  { label: "Emails Sent", value: "3,621", note: "Sent across 3 campaigns. Your Wednesday email is performing best." },
  { label: "Top Post", value: "6.2K", note: "Your Tuesday reel reached 6,200 people — highest this quarter." },
];

const defaultApprovals: ApprovalItem[] = [
  {
    id: 1,
    type: "Email",
    title: "April Newsletter — Spring Offer",
    preview: "Subject: Something big is coming your way this April...\n\nHi [First Name],\n\nWe've been working behind the scenes on something that's going to make your spring a lot easier. Stay tuned — you'll want to be first to know.",
    platform: "Mailchimp",
    scheduledFor: "April 2, 2026",
    status: "pending",
  },
  {
    id: 2,
    type: "Instagram Post",
    title: "Behind-the-scenes team photo",
    preview: "Caption: The team that makes it happen. Every week, same mission — results for our clients. No smoke. No mirrors. Just work.\n\n#TymFlo #MarketingDoneForYou #SmallBusiness",
    platform: "Instagram",
    scheduledFor: "April 3, 2026",
    status: "pending",
  },
  {
    id: 3,
    type: "Google Ad",
    title: "Spring Campaign — Search Ad",
    preview: "Headline: Marketing That Runs Itself\nDescription: Stop managing your marketing. Let TymFlo handle it — results without the meetings. Book a free strategy call today.",
    platform: "Google Ads",
    scheduledFor: "April 5, 2026",
    status: "approved",
  },
];
