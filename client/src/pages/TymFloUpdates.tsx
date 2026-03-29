import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  CheckCircle2,
  Flag,
  Upload,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import tymfloIconPath from "@assets/Tymflo-icon-crlPng_-_Copy_1767738458395.png";

interface ActivityItem { id: number; date: string; text: string; }
interface Metric { label: string; value: string; note: string; }
interface ApprovalItem { id: number; type: string; title: string; preview: string; platform: string; scheduledFor: string; status: "pending" | "approved" | "flagged"; }
interface BriefItem { category: string; text: string; }
interface ChatMessage { role: "user" | "assistant"; content: string; }

export default function TymFloUpdates() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <style>{`
        .tf-coral { color: #F69679; }
        .tf-bg-coral { background-color: #F69679; }
        .tf-bg-coral-faint { background-color: #FEF3EF; }
        .tf-border-coral { border-color: #F69679; }
        .tf-section-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #F69679;
        }
        .tf-divider {
          height: 3px;
          width: 32px;
          background: #F69679;
          border-radius: 2px;
          margin-bottom: 20px;
        }
        .tf-card {
          background: white;
          border: 1px solid #F0EDE8;
          border-radius: 10px;
        }
        .tf-btn {
          background: #F69679;
          color: white;
          border: none;
          border-radius: 6px;
          padding: 10px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: opacity 0.15s;
        }
        .tf-btn:hover { opacity: 0.88; }
        .tf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .section-anchor { scroll-margin-top: 80px; }
      `}</style>

      {/* Page hero */}
      <div className="border-b border-[#F0EDE8] bg-white">
        <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 md:py-10">
          <p className="tf-section-label mb-2">Your Marketing, Handled</p>
          <h1 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">TymFlo Updates</h1>
          <p className="text-[#888] mt-1.5 text-base">What's done. What's moving. What's next.</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-8 py-8 space-y-14">

        {/* ── QUICK REQUEST ─────────────────────────────────────────── */}
        <QuickRequest />

        {/* ── DONE ──────────────────────────────────────────────────── */}
        <section id="done" className="section-anchor">
          <p className="tf-section-label">Done</p>
          <div className="tf-divider" />
          <div className="grid md:grid-cols-3 gap-5">
            <div className="md:col-span-2">
              <ActivityFeed />
            </div>
            <div className="flex flex-col gap-4">
              <MetricsSnapshot />
            </div>
          </div>
        </section>

        {/* ── MOVING ────────────────────────────────────────────────── */}
        <section id="moving" className="section-anchor">
          <p className="tf-section-label">Moving</p>
          <div className="tf-divider" />
          <ApprovalsSection />
        </section>

        {/* ── NEXT ──────────────────────────────────────────────────── */}
        <section id="next" className="section-anchor">
          <p className="tf-section-label">Next</p>
          <div className="tf-divider" />
          <WeeklyBrief />
        </section>

        {/* ── DOCUMENT SUMMARY ──────────────────────────────────────── */}
        <section id="documents" className="section-anchor">
          <p className="tf-section-label">Documents</p>
          <div className="tf-divider" />
          <DocumentSummary />
        </section>

        {/* ── ASK TYMFLO ────────────────────────────────────────────── */}
        <section id="chat" className="section-anchor">
          <p className="tf-section-label">Ask TymFlo</p>
          <div className="tf-divider" />
          <ChatSection />
        </section>

      </div>

      {/* Bottom padding */}
      <div className="h-16" />
    </div>
  );
}

/* ─── QUICK REQUEST ──────────────────────────────────────────────── */
function QuickRequest() {
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (t: string) => apiRequest("POST", "/api/portal/request", { text: t }),
    onSuccess: () => { setSent(true); setText(""); toast({ title: "Request received", description: "Your team will handle it." }); },
  });

  return (
    <div className="tf-card p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="tf-section-label">Quick Request</p>
        <span className="text-xs text-[#B0ADA8]">One line is enough</span>
      </div>
      {sent ? (
        <div className="flex items-center gap-3 py-1">
          <CheckCircle2 size={18} className="text-green-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-[#1A1A1A]">Received — your team is on it.</p>
            <button className="text-xs text-[#F69679] underline mt-0.5" onClick={() => setSent(false)}>Send another</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3">
          <Textarea
            placeholder="A quick note, a change, a heads up — your team will handle it."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="flex-1 resize-none text-sm border-[#E8E4DE] bg-[#FAFAF8] min-h-[56px]"
            data-testid="input-quick-request"
          />
          <button
            className="tf-btn flex-shrink-0 h-[56px] px-4"
            onClick={() => { if (text.trim()) mutation.mutate(text.trim()); }}
            disabled={!text.trim() || mutation.isPending}
            data-testid="button-send-request"
          >
            <Send size={14} />
            {mutation.isPending ? "Sending…" : "Send"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── ACTIVITY FEED ──────────────────────────────────────────────── */
function ActivityFeed() {
  const { data } = useQuery<{ items: ActivityItem[] }>({ queryKey: ["/api/portal/activity"] });
  const items = data?.items ?? defaultActivity;

  return (
    <div className="tf-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F0EDE8]">
        <p className="text-sm font-semibold text-[#1A1A1A]">What TymFlo Did This Week</p>
      </div>
      <div className="divide-y divide-[#F7F4F0]">
        {items.map((item) => (
          <div key={item.id} className="px-5 py-4" data-testid={`activity-${item.id}`}>
            <p className="text-xs text-[#B0ADA8] mb-1">{item.date}</p>
            <p className="text-sm text-[#3A3A3A] leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── METRICS ────────────────────────────────────────────────────── */
function MetricsSnapshot() {
  const { data } = useQuery<{ metrics: Metric[] }>({ queryKey: ["/api/portal/metrics"] });
  const metrics = data?.metrics ?? defaultMetrics;

  return (
    <>
      {metrics.map((m, i) => (
        <div key={i} className="tf-card shadow-sm p-5" data-testid={`metric-${i}`}>
          <p className="text-2xl font-bold text-[#1A1A1A]">{m.value}</p>
          <p className="tf-section-label mt-1 mb-2">{m.label}</p>
          <p className="text-xs text-[#888] leading-relaxed">{m.note}</p>
        </div>
      ))}
    </>
  );
}

/* ─── APPROVALS ──────────────────────────────────────────────────── */
function ApprovalsSection() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data } = useQuery<{ items: ApprovalItem[] }>({ queryKey: ["/api/portal/approvals"] });

  const approveMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: "approved" | "flagged" }) =>
      apiRequest("POST", "/api/portal/approve", { id, status }),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ["/api/portal/approvals"] });
      toast({
        title: status === "approved" ? "Approved" : "Flagged for review",
        description: status === "approved" ? "Scheduled to go out as planned." : "Your team will make adjustments.",
      });
    },
  });

  const items = data?.items ?? defaultApprovals;
  const pending = items.filter((i) => i.status === "pending");
  const decided = items.filter((i) => i.status !== "pending");

  if (pending.length === 0 && decided.length === 0) {
    return (
      <div className="tf-card p-10 text-center shadow-sm">
        <CheckCircle2 size={32} className="text-green-400 mx-auto mb-3" />
        <p className="font-medium text-[#1A1A1A]">Nothing waiting on you.</p>
        <p className="text-sm text-[#888] mt-1">All content is either approved or in progress.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pending.length > 0 && (
        <div className="space-y-3">
          {pending.map((item) => (
            <ApprovalCard
              key={item.id}
              item={item}
              onDecide={(status) => approveMutation.mutate({ id: item.id, status })}
              isPending={approveMutation.isPending}
            />
          ))}
        </div>
      )}
      {decided.length > 0 && (
        <div>
          <p className="text-xs text-[#B0ADA8] font-semibold uppercase tracking-wider mb-2 mt-4">Already reviewed</p>
          <div className="space-y-2">
            {decided.map((item) => (
              <div key={item.id} className="tf-card p-4 flex items-center justify-between opacity-55 shadow-sm" data-testid={`decided-${item.id}`}>
                <div>
                  <p className="text-sm font-medium text-[#3A3A3A]">{item.title}</p>
                  <p className="text-xs text-[#B0ADA8]">{item.platform} · {item.scheduledFor}</p>
                </div>
                {item.status === "approved"
                  ? <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                  : <Flag size={16} className="text-red-400 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ item, onDecide, isPending }: { item: ApprovalItem; onDecide: (s: "approved" | "flagged") => void; isPending: boolean; }) {
  return (
    <div className="tf-card shadow-sm overflow-hidden" data-testid={`approval-${item.id}`}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <Badge variant="outline" className="text-xs border-[#F0EDE8] text-[#888]">{item.type}</Badge>
          <Badge variant="outline" className="text-xs border-[#F0EDE8] text-[#888]">{item.platform}</Badge>
          <span className="text-xs text-[#B0ADA8] ml-auto">{item.scheduledFor}</span>
        </div>
        <p className="font-semibold text-[#1A1A1A] text-sm mb-3">{item.title}</p>
        <div className="bg-[#FAFAF8] rounded-lg p-4 border border-[#F0EDE8]">
          <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-line">{item.preview}</p>
        </div>
      </div>
      <div className="px-5 pb-5 flex gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-50 text-green-700 text-sm font-semibold border border-green-100 hover:bg-green-100 transition-colors"
          onClick={() => onDecide("approved")}
          disabled={isPending}
          data-testid={`btn-approve-${item.id}`}
        >
          <CheckCircle2 size={15} /> Looks good
        </button>
        <button
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold border border-red-100 hover:bg-red-100 transition-colors"
          onClick={() => onDecide("flagged")}
          disabled={isPending}
          data-testid={`btn-flag-${item.id}`}
        >
          <Flag size={15} /> Flag for team
        </button>
      </div>
    </div>
  );
}

/* ─── WEEKLY BRIEF ───────────────────────────────────────────────── */
function WeeklyBrief() {
  const { data } = useQuery<{ items: BriefItem[]; weekOf: string }>({ queryKey: ["/api/portal/brief"] });
  const items = data?.items ?? defaultBrief;
  const weekOf = data?.weekOf ?? "March 24–28, 2026";

  return (
    <div className="tf-card shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-[#F0EDE8] flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-sm font-semibold text-[#1A1A1A]">This Week's Brief</p>
          <p className="text-xs text-[#B0ADA8] mt-0.5">Curated by TymFlo · {weekOf}</p>
        </div>
        <Badge variant="outline" className="text-xs border-[#F0EDE8] text-[#888]">5 things worth knowing</Badge>
      </div>
      <div className="divide-y divide-[#F7F4F0]">
        {items.map((item, i) => (
          <div key={i} className="px-5 py-4" data-testid={`brief-item-${i}`}>
            <p className="tf-section-label mb-1.5">{item.category}</p>
            <p className="text-sm text-[#3A3A3A] leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="px-5 py-3 bg-[#FAFAF8] border-t border-[#F0EDE8]">
        <p className="text-xs text-[#B0ADA8]">TymFlo filters what matters. No links, no rabbit holes — just what you need to know.</p>
      </div>
    </div>
  );
}

/* ─── DOCUMENT SUMMARY ───────────────────────────────────────────── */
function DocumentSummary() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (f: File) => {
      const fd = new FormData();
      fd.append("file", f);
      const res = await fetch("/api/portal/summarize", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ summary: string }>;
    },
    onSuccess: (d) => setSummary(d.summary),
    onError: () => toast({ title: "Couldn't process file", description: "Try a PDF, PNG, or CSV under 10MB.", variant: "destructive" }),
  });

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); setSummary(null); }
  }

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border-2 border-dashed transition-colors cursor-pointer ${dragging ? "border-[#F69679] bg-[#FEF3EF]" : "border-[#E8E4DE] bg-white"}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        data-testid="dropzone"
      >
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
          <Upload size={28} className={dragging ? "text-[#F69679]" : "text-[#C4BFB8]"} />
          <p className="mt-3 text-sm font-medium text-[#3A3A3A]">{file ? file.name : "Drop a file here"}</p>
          <p className="text-xs text-[#B0ADA8] mt-1">PDF, PNG, or CSV — up to 10MB</p>
          {file && !summary && (
            <button
              className="tf-btn mt-4"
              onClick={(e) => { e.stopPropagation(); mutation.mutate(file); }}
              disabled={mutation.isPending}
              data-testid="btn-summarize"
            >
              {mutation.isPending ? "Reading…" : "Get Summary"} {!mutation.isPending && <ArrowRight size={13} />}
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); setSummary(null); } }} data-testid="input-file" />
      </div>

      {mutation.isPending && (
        <div className="tf-card p-8 text-center shadow-sm">
          <div className="w-7 h-7 border-2 border-[#F69679] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#888]">Reading your file…</p>
        </div>
      )}

      {summary && (
        <div className="tf-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#F0EDE8] flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[#1A1A1A]">Summary</p>
            <Badge variant="outline" className="text-xs border-[#F0EDE8] text-[#888] truncate max-w-[180px]">{file?.name}</Badge>
          </div>
          <div className="p-5">
            <p className="text-sm text-[#3A3A3A] leading-relaxed whitespace-pre-wrap" data-testid="summary-text">{summary}</p>
          </div>
          <div className="px-5 pb-5">
            <button className="text-xs text-[#F69679] underline" onClick={() => { setFile(null); setSummary(null); if (fileRef.current) fileRef.current.value = ""; }} data-testid="btn-new-file">Upload a different file</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── CHAT ───────────────────────────────────────────────────────── */
function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: "assistant",
    content: "Hi — I'm your TymFlo assistant. Ask me anything about your account, what's going live, how your marketing is performing, or what's coming next. I'll give you a straight answer.",
  }]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (text: string) =>
      apiRequest("POST", "/api/portal/chat", { message: text, history: messages }) as Promise<{ reply: string }>,
    onSuccess: (data) => {
      setMessages((p) => [...p, { role: "assistant", content: data.reply }]);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    },
    onError: () => toast({ title: "Couldn't reach TymFlo AI", variant: "destructive" }),
  });

  function send() {
    const t = input.trim();
    if (!t) return;
    setMessages((p) => [...p, { role: "user", content: t }]);
    setInput("");
    mutation.mutate(t);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div className="tf-card shadow-sm overflow-hidden">
      {/* Messages */}
      <div className="p-5 space-y-4 min-h-[240px] max-h-[400px] overflow-y-auto">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} data-testid={`msg-${i}`}>
            {msg.role === "assistant" && (
              <img src={tymfloIconPath} alt="" className="w-6 h-6 mr-2.5 flex-shrink-0 mt-0.5 opacity-75" />
            )}
            <div className={`max-w-[78%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "bg-[#F69679] text-white" : "bg-[#FAFAF8] border border-[#F0EDE8] text-[#3A3A3A]"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {mutation.isPending && (
          <div className="flex justify-start">
            <img src={tymfloIconPath} alt="" className="w-6 h-6 mr-2.5 flex-shrink-0 opacity-75" />
            <div className="bg-[#FAFAF8] border border-[#F0EDE8] rounded-xl px-4 py-3">
              <div className="flex gap-1.5 items-center h-4">
                {[0, 150, 300].map((d) => (
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#F69679] animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-5 pb-5 pt-2 border-t border-[#F0EDE8] flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask anything about your marketing…"
          className="flex-1 resize-none text-sm border-[#E8E4DE] bg-[#FAFAF8] min-h-[44px] max-h-[100px]"
          data-testid="input-chat"
        />
        <button
          className="tf-btn flex-shrink-0 px-4 h-[44px]"
          onClick={send}
          disabled={!input.trim() || mutation.isPending}
          data-testid="btn-send-chat"
        >
          <Send size={14} />
        </button>
      </div>
      <p className="text-xs text-[#B0ADA8] text-center pb-4">AI responses are based on your TymFlo account context.</p>
    </div>
  );
}

/* ─── DEFAULT DATA ───────────────────────────────────────────────── */
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
  { id: 1, type: "Email", title: "April Newsletter — Spring Offer", preview: "Subject: Something big is coming your way this April...\n\nHi [First Name],\n\nWe've been working behind the scenes on something that's going to make your spring a lot easier. Stay tuned — you'll want to be first to know.", platform: "Mailchimp", scheduledFor: "April 2, 2026", status: "pending" },
  { id: 2, type: "Instagram Post", title: "Behind-the-scenes team photo", preview: "Caption: The team that makes it happen. Every week, same mission — results for our clients. No smoke. No mirrors. Just work.\n\n#TymFlo #MarketingDoneForYou #SmallBusiness", platform: "Instagram", scheduledFor: "April 3, 2026", status: "pending" },
  { id: 3, type: "Google Ad", title: "Spring Campaign — Search Ad", preview: "Headline: Marketing That Runs Itself\nDescription: Stop managing your marketing. Let TymFlo handle it — results without the meetings. Book a free strategy call today.", platform: "Google Ads", scheduledFor: "April 5, 2026", status: "approved" },
];

const defaultBrief: BriefItem[] = [
  { category: "Consumer Trends", text: "Consumers are responding more to trust signals than price — businesses with consistent brand messaging are seeing higher retention even in tighter economic conditions." },
  { category: "Local Market", text: "Detroit-area small business formation is up 8% year-over-year, with service businesses leading — competition in your sector is growing, and visibility matters more now." },
  { category: "Platform Changes", text: "Instagram's algorithm is now favoring accounts that post consistently 3–4x per week — TymFlo's posting cadence is already aligned with this shift." },
  { category: "AI Watch", text: "AI-generated search answers now appear for 75% of service-based business searches — visibility in those results depends heavily on review volume and structured website content." },
  { category: "Business Climate", text: "Consumer spending on professional services held steady in Q1 even as retail pulled back — service businesses like yours are in a strong position heading into Q2." },
];
