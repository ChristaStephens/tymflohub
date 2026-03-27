import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  Monitor, Camera, Layers, Mic, MicOff, Play, Pause, Square,
  Download, Trash2, Plus, ChevronUp, ChevronDown, FileText, Video,
  Circle, CheckCircle, ClipboardCopy, RotateCcw, Scissors, Info,
  GripVertical, Image, PenLine, Bookmark, AlertCircle, FolderOpen,
  BookOpen, X, Clock,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type RecordMode = "screen" | "camera" | "screen+camera";
type RecordState = "idle" | "recording" | "paused" | "done";
type Tab = "recorder" | "process";

interface ProcessStep {
  id: string;
  screenshot: string;
  title: string;
  description: string;
}

interface SavedGuide {
  id: string;
  title: string;
  steps: ProcessStep[];
  savedAt: string;
}

// ─── Guide Library (IndexedDB) ────────────────────────────────────────────────

async function dbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("tymflo-guides", 1);
    req.onupgradeneeded = e => {
      (e.target as IDBOpenDBRequest).result.createObjectStore("guides", { keyPath: "id" });
    };
    req.onsuccess = e => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

async function dbSave(title: string, steps: ProcessStep[]): Promise<void> {
  const db = await dbOpen();
  const rec: SavedGuide = { id: Date.now().toString(), title: title || "Untitled Guide", steps, savedAt: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("guides", "readwrite");
    tx.objectStore("guides").put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbLoadAll(): Promise<SavedGuide[]> {
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("guides", "readonly");
    const req = tx.objectStore("guides").getAll();
    req.onsuccess = () => resolve((req.result as SavedGuide[]).sort((a, b) => b.savedAt.localeCompare(a.savedAt)));
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await dbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("guides", "readwrite");
    tx.objectStore("guides").delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ─── BookmarkletLink helper ───────────────────────────────────────────────────
// Sets href via ref after mount so React never sees javascript: in JSX

function BookmarkletLink({ code, className, children, ...rest }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { code: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => { if (ref.current) ref.current.href = code; }, [code]);
  return (
    <a ref={ref} href="#" draggable className={className} {...rest}>
      {children}
    </a>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function Recorder() {
  const [activeTab, setActiveTab] = useState<Tab>("recorder");
  const [importedSteps, setImportedSteps] = useState<ProcessStep[] | null>(null);
  const [importedTitle, setImportedTitle] = useState("");
  const [importPending, setImportPending] = useState(false);

  // Message listener lives here so it fires even before Process Guide tab mounts
  useEffect(() => {
    if (window.opener) window.opener.postMessage({ type: "tymflo_ready" }, "*");

    const handler = (e: MessageEvent) => {
      if (e.data?.type === "tymflo_import" && Array.isArray(e.data.steps)) {
        setImportedSteps(e.data.steps);
        setImportedTitle(e.data.title || "");
        setImportPending(true);
        setActiveTab("process");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Screen Recorder & Process Capture - TymFlo Hub"
        description="Record your screen, webcam, or both. Capture step-by-step process guides — all free, no install needed."
      />
      <div className="bg-gradient-to-br from-[#463176] to-[#6b4fa8] text-white py-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-4">
            <Video className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Screen Recorder</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Record your screen, camera, or both. Build step-by-step guides. Free, no install.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-8 w-fit">
          {([["recorder", Video, "Screen Recorder"], ["process", FileText, "Process Guide"]] as const).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              data-testid={`tab-${id}`}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id ? "bg-[#463176] text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {id === "process" && importPending && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#F69679] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {activeTab === "recorder"
          ? <ScreenRecorderTab />
          : <ProcessGuideTab
              importedSteps={importedSteps}
              importedTitle={importedTitle}
              onImportConsumed={() => { setImportedSteps(null); setImportedTitle(""); setImportPending(false); }}
            />
        }
      </div>
    </div>
  );
}

// ─── Screen Recorder Tab ──────────────────────────────────────────────────────

function ScreenRecorderTab() {
  const { toast } = useToast();
  const [mode, setMode] = useState<RecordMode>("screen");
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordingName, setRecordingName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isTrimming, setIsTrimming] = useState(false);
  const [showTrimmer, setShowTrimmer] = useState(false);
  const [trimSupported, setTrimSupported] = useState(true);
  const [liveStream, setLiveStream] = useState<MediaStream | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const camStreamRef = useRef<MediaStream | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<number | null>(null);

  const fmt = (s: number) =>
    `${String(Math.floor(Math.abs(s) / 60)).padStart(2, "0")}:${String(Math.floor(Math.abs(s) % 60)).padStart(2, "0")}`;

  useEffect(() => {
    setTrimSupported("captureStream" in document.createElement("video"));
    return cleanup;
  }, []);

  useEffect(() => {
    const video = previewRef.current;
    if (!video) return;
    if (liveStream) { video.srcObject = liveStream; video.play().catch(() => {}); }
    else video.srcObject = null;
  }, [liveStream]);

  const cleanup = () => {
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    camStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current = null; camStreamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };

  const waitForReady = (v: HTMLVideoElement) =>
    new Promise<void>(r => { if (v.readyState >= 2) r(); else { v.addEventListener("loadeddata", () => r(), { once: true }); setTimeout(r, 2500); } });

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      const audioCfg = micEnabled ? { echoCancellation: true, noiseSuppression: true } : false;
      let recordStream: MediaStream;

      if (mode === "screen") {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
        screenStreamRef.current = screen;
        if (micEnabled) {
          try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: audioCfg, video: false });
            const actx = new AudioContext(), dest = actx.createMediaStreamDestination();
            if (screen.getAudioTracks().length) actx.createMediaStreamSource(screen).connect(dest);
            actx.createMediaStreamSource(mic).connect(dest);
            recordStream = new MediaStream([...screen.getVideoTracks(), ...dest.stream.getTracks()]);
          } catch { recordStream = screen; }
        } else { recordStream = screen; }
        setLiveStream(recordStream);
        screen.getVideoTracks()[0]?.addEventListener("ended", doStop);

      } else if (mode === "camera") {
        const cam = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, frameRate: 30 }, audio: audioCfg });
        camStreamRef.current = cam;
        recordStream = cam;
        setLiveStream(cam);

      } else {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
        const cam = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240, facingMode: "user" }, audio: audioCfg });
        screenStreamRef.current = screen; camStreamRef.current = cam;

        const sv = Object.assign(document.createElement("video"), { srcObject: screen, muted: true, autoplay: true, playsInline: true });
        const cv = Object.assign(document.createElement("video"), { srcObject: cam, muted: true, autoplay: true, playsInline: true });
        await Promise.all([sv.play(), cv.play()]);
        await Promise.all([waitForReady(sv), waitForReady(cv)]);

        const canvas = document.createElement("canvas"); canvas.width = 1280; canvas.height = 720;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(sv, 0, 0, 1280, 720);

        const pip = { r: 110, mx: 1280 - 126, my: 720 - 126 };
        const draw = () => {
          ctx.drawImage(sv, 0, 0, 1280, 720);
          ctx.save(); ctx.beginPath(); ctx.arc(pip.mx, pip.my, pip.r, 0, Math.PI * 2); ctx.clip();
          ctx.drawImage(cv, pip.mx - pip.r, pip.my - pip.r, pip.r * 2, pip.r * 2); ctx.restore();
          ctx.beginPath(); ctx.arc(pip.mx, pip.my, pip.r + 2, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.lineWidth = 3; ctx.stroke();
          animRef.current = requestAnimationFrame(draw);
        };
        draw();

        const audioTracks: MediaStreamTrack[] = [];
        try {
          const actx = new AudioContext(), dest = actx.createMediaStreamDestination();
          if (screen.getAudioTracks().length) actx.createMediaStreamSource(screen).connect(dest);
          if (cam.getAudioTracks().length) actx.createMediaStreamSource(cam).connect(dest);
          audioTracks.push(...dest.stream.getTracks());
        } catch { /* ignore */ }

        recordStream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...audioTracks]);
        setLiveStream(recordStream);
        screen.getVideoTracks()[0]?.addEventListener("ended", doStop);
      }

      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"]
        .find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
      const recorder = new MediaRecorder(recordStream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        setTrimStart(0); setTrimEnd(0); setShowTrimmer(false); setLiveStream(null); cleanup();
        setRecordState("done");
      };
      recorder.start(100);
      setRecordState("recording"); setElapsed(0); setVideoUrl(null);
      timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.toLowerCase().includes("denied") && !msg.toLowerCase().includes("cancel")) {
        toast({ title: "Could not start recording", description: msg, variant: "destructive" });
      }
    }
  };

  function doStop() {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
  }

  const downloadFull = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${recordingName || "tymflo-recording"}-${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
    toast({ title: "Downloading…" });
  };

  const downloadTrimmed = async () => {
    if (!videoUrl || !trimSupported) return;
    setIsTrimming(true);
    try {
      const cap = document.createElement("video");
      cap.src = videoUrl; cap.preload = "auto";
      await new Promise<void>((res, rej) => {
        cap.onloadedmetadata = () => res();
        cap.onerror = () => rej(new Error("Load failed"));
        cap.load(); setTimeout(() => rej(new Error("Load timeout")), 10000);
      });
      cap.currentTime = trimStart;
      await new Promise<void>((res, rej) => {
        cap.onseeked = () => res();
        cap.onerror = () => rej(new Error("Seek failed"));
        setTimeout(() => rej(new Error("Seek timeout")), 5000);
      });

      type CapVid = HTMLVideoElement & { captureStream(): MediaStream };
      const stream = (cap as CapVid).captureStream();
      const mimeType = ["video/webm;codecs=vp9,opus", "video/webm"].find(m => MediaRecorder.isTypeSupported(m)) ?? "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        cap.pause();
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a"); a.href = url;
        a.download = `${recordingName || "tymflo"}-trimmed.webm`; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setIsTrimming(false);
        toast({ title: "Trimmed clip downloaded!" });
      };
      recorder.start(100);
      await cap.play();
      const poll = setInterval(() => {
        if (cap.currentTime >= trimEnd) { clearInterval(poll); recorder.stop(); }
      }, 80);
    } catch (e) {
      setIsTrimming(false);
      toast({ title: "Trim failed", description: "Use Chrome or Edge for trim export.", variant: "destructive" });
    }
  };

  const reset = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null); setRecordState("idle"); setElapsed(0);
    setRecordingName(""); setShowTrimmer(false); cleanup();
  };

  const modes = [
    { id: "screen" as RecordMode, label: "Screen Only", Icon: Monitor, desc: "Full screen or a browser tab" },
    { id: "camera" as RecordMode, label: "Camera Only", Icon: Camera, desc: "Webcam recording" },
    { id: "screen+camera" as RecordMode, label: "Screen + Camera", Icon: Layers, desc: "Screen with webcam circle overlay" },
  ];

  return (
    <div className="space-y-5">
      {recordState === "idle" && (
        <>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {modes.map(({ id, label, Icon, desc }) => (
                <button key={id} data-testid={`mode-${id}`} onClick={() => setMode(id)}
                  className={`relative flex flex-col gap-3 p-4 rounded-xl border-2 text-left transition-all ${mode === id ? "border-[#463176] bg-[#463176]/5" : "border-gray-200 hover:border-gray-300"}`}>
                  {mode === id && <CheckCircle className="absolute top-3 right-3 w-4 h-4 text-[#463176]" />}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${mode === id ? "bg-[#463176] text-white" : "bg-gray-100 text-gray-500"}`}><Icon className="w-5 h-5" /></div>
                  <div><div className="font-semibold text-gray-900 text-sm">{label}</div><div className="text-xs text-gray-500 mt-0.5">{desc}</div></div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-5">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Audio</h2>
            <button data-testid="toggle-mic" onClick={() => setMicEnabled(!micEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-medium transition-colors ${micEnabled ? "border-[#463176] bg-[#463176]/5 text-[#463176]" : "border-gray-200 text-gray-500"}`}>
              {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              Microphone {micEnabled ? "On" : "Off"}
            </button>
          </div>

          <div className="flex justify-center pt-1">
            <Button size="lg" data-testid="button-start-recording" onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white gap-2 px-10 text-base">
              <Circle className="w-4 h-4 fill-white" /> Start Recording
            </Button>
          </div>
        </>
      )}

      {(recordState === "recording" || recordState === "paused") && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="bg-gray-950 relative aspect-video">
            <video ref={previewRef} autoPlay playsInline muted className="w-full h-full object-contain" data-testid="video-preview" />
            {recordState === "paused" && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-xl font-semibold">Paused</span>
              </div>
            )}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${recordState === "recording" ? "bg-red-500 animate-pulse" : "bg-yellow-400"}`} />
              <span className="bg-black/70 text-white text-sm font-mono px-2 py-0.5 rounded">{fmt(elapsed)}</span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-center gap-3 bg-gray-50">
            {recordState === "recording"
              ? <Button variant="outline" onClick={() => { mediaRecorderRef.current?.pause(); if (timerRef.current) clearInterval(timerRef.current); setRecordState("paused"); }} data-testid="button-pause" className="gap-2"><Pause className="w-4 h-4" /> Pause</Button>
              : <Button variant="outline" onClick={() => { mediaRecorderRef.current?.resume(); timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000); setRecordState("recording"); }} data-testid="button-resume" className="gap-2"><Play className="w-4 h-4" /> Resume</Button>}
            <Button onClick={doStop} data-testid="button-stop" className="bg-red-500 hover:bg-red-600 text-white gap-2">
              <Square className="w-4 h-4 fill-white" /> Stop
            </Button>
          </div>
        </div>
      )}

      {recordState === "done" && videoUrl && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="bg-gray-950 aspect-video">
            <video ref={playbackRef} src={videoUrl} controls className="w-full h-full object-contain" data-testid="video-playback"
              onLoadedMetadata={e => {
                const dur = (e.target as HTMLVideoElement).duration;
                if (isFinite(dur)) { setVideoDuration(dur); setTrimEnd(dur); }
              }} />
          </div>

          <div className="p-5 space-y-5">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Recording name</label>
              <Input placeholder="my-screen-recording" value={recordingName} onChange={e => setRecordingName(e.target.value)} data-testid="input-recording-name" className="max-w-sm" />
            </div>

            {/* Trim */}
            <div className="border rounded-xl overflow-hidden">
              <button onClick={() => setShowTrimmer(!showTrimmer)} data-testid="button-toggle-trimmer"
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700"><Scissors className="w-4 h-4 text-[#463176]" /> Trim Clip</div>
                <span className="text-xs text-gray-400">{showTrimmer ? "Hide" : "Show"}</span>
              </button>
              {showTrimmer && (
                <div className="px-5 pb-5 pt-4 border-t space-y-4 bg-gray-50">
                  {!trimSupported && (
                    <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> Trim export requires Chrome or Edge.
                    </div>
                  )}
                  {videoDuration > 0 && (
                    <>
                      <div className="flex gap-4 text-sm text-gray-500">
                        <span>Full: <strong className="text-gray-800">{fmt(videoDuration)}</strong></span>
                        <span>Trimmed: <strong className="text-[#463176]">{fmt(trimEnd - trimStart)}</strong></span>
                      </div>
                      <div className="relative h-8 bg-gray-200 rounded-lg overflow-hidden">
                        <div className="absolute top-0 h-full bg-[#463176]/20 border-x-2 border-[#463176]"
                          style={{ left: `${(trimStart / videoDuration) * 100}%`, width: `${((trimEnd - trimStart) / videoDuration) * 100}%` }} />
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500 font-mono pointer-events-none">
                          {fmt(trimStart)} → {fmt(trimEnd)}
                        </div>
                      </div>
                      {[["Start", trimStart, (v: number) => { if (v < trimEnd - 0.5) { setTrimStart(v); if (playbackRef.current) playbackRef.current.currentTime = v; } }, "slider-trim-start"],
                        ["End", trimEnd, (v: number) => { if (v > trimStart + 0.5) setTrimEnd(v); }, "slider-trim-end"]].map(([label, val, onChange, tid]) => (
                        <div key={tid as string} className="flex items-center gap-3">
                          <label className="text-xs font-medium text-gray-500 w-10 shrink-0">{label as string}</label>
                          <input type="range" min={0} max={videoDuration} step={0.1} value={val as number}
                            onChange={e => (onChange as (v: number) => void)(parseFloat(e.target.value))}
                            className="flex-1 accent-[#463176]" data-testid={tid as string} />
                          <span className="text-xs font-mono text-gray-600 w-10 text-right">{fmt(val as number)}</span>
                        </div>
                      ))}
                      <Button onClick={downloadTrimmed} disabled={isTrimming || !trimSupported} data-testid="button-download-trimmed" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
                        <Download className="w-4 h-4" />
                        {isTrimming ? "Exporting… (plays in real-time)" : `Export Trimmed (${fmt(trimEnd - trimStart)})`}
                      </Button>
                      {isTrimming && <p className="text-xs text-gray-400">Takes as long as the clip duration — plays through once to encode.</p>}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Library tip */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700 flex gap-3">
              <FolderOpen className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <strong>Video Library:</strong> Download your recording and save it to a folder on your computer or Google Drive. Videos are too large to store in the browser — downloading is the right approach.
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button onClick={downloadFull} data-testid="button-download" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
                <Download className="w-4 h-4" /> Download Full (.webm)
              </Button>
              <Button variant="outline" onClick={reset} data-testid="button-new-recording" className="gap-2">
                <RotateCcw className="w-4 h-4" /> New Recording
              </Button>
            </div>
            <p className="text-xs text-gray-400">Nothing is uploaded — recordings stay on your device.</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Process Guide Tab ────────────────────────────────────────────────────────

function ProcessGuideTab({
  importedSteps,
  importedTitle,
  onImportConsumed,
}: {
  importedSteps: ProcessStep[] | null;
  importedTitle: string;
  onImportConsumed: () => void;
}) {
  const { toast } = useToast();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [guideTitle, setGuideTitle] = useState("");
  const [capturing, setCapturing] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [importBanner, setImportBanner] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [savedGuides, setSavedGuides] = useState<SavedGuide[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const idRef = useRef(0);

  const tymfloUrl = `${window.location.origin}${import.meta.env.BASE_URL.replace(/\/$/, "")}`;

  // Simplified bookmarklet — just opens the persistent popup
  const bookmarkletCode = `javascript:(function(){var u='${tymfloUrl}/capture-popup.html';var f='width=290,height=460,popup=yes,left='+(screen.availWidth-305)+',top=50';var w=window.open(u,'tymflo_cap',f);if(!w)alert('Allow popups for this site to use TymFlo Capture (check address bar).');})();`;

  // Receive imported steps from parent
  useEffect(() => {
    if (importedSteps && importedSteps.length > 0) {
      setSteps(importedSteps);
      if (importedTitle) setGuideTitle(importedTitle);
      setImportBanner(true);
      setExpandedStep(importedSteps[0]?.id ?? null);
      onImportConsumed();
      toast({ title: `${importedSteps.length} steps imported from capture session!` });
    }
  }, [importedSteps]);

  const loadLibrary = async () => {
    setLibraryLoading(true);
    try { setSavedGuides(await dbLoadAll()); } catch { /* ignore */ }
    setLibraryLoading(false);
  };

  const saveToLibrary = async () => {
    if (!steps.length) { toast({ title: "No steps to save", variant: "destructive" }); return; }
    try {
      await dbSave(guideTitle, steps);
      toast({ title: "Guide saved to library!" });
      if (showLibrary) loadLibrary();
    } catch {
      toast({ title: "Save failed", description: "Browser storage error", variant: "destructive" });
    }
  };

  const loadGuide = (g: SavedGuide) => {
    setSteps(g.steps);
    setGuideTitle(g.title);
    setShowLibrary(false);
    setExpandedStep(g.steps[0]?.id ?? null);
    toast({ title: "Guide loaded!" });
  };

  const deleteGuide = async (id: string) => {
    await dbDelete(id);
    setSavedGuides(prev => prev.filter(g => g.id !== id));
  };

  const capture = async () => {
    setCountdown(3);
    await new Promise<void>(res => {
      let c = 3;
      const t = setInterval(() => { c--; setCountdown(c); if (c <= 0) { clearInterval(t); res(); } }, 1000);
    });
    setCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      let dataUrl = "";
      try {
        type IC = { grabFrame(): Promise<ImageBitmap> };
        const IC = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => IC }).ImageCapture;
        if (IC) {
          const bitmap = await new IC(track).grabFrame(); track.stop();
          const canvas = document.createElement("canvas");
          canvas.width = bitmap.width; canvas.height = bitmap.height;
          canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
          dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        } else throw new Error("no IC");
      } catch {
        const video = document.createElement("video");
        video.srcObject = stream; video.muted = true;
        await video.play(); await new Promise(r => setTimeout(r, 400));
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 1280; canvas.height = video.videoHeight || 720;
        canvas.getContext("2d")!.drawImage(video, 0, 0);
        dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        stream.getTracks().forEach(t => t.stop());
      }
      const id = String(++idRef.current);
      setSteps(prev => [...prev, { id, screenshot: dataUrl, title: `Step ${prev.length + 1}`, description: "" }]);
      setExpandedStep(id);
      toast({ title: "Step captured" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.toLowerCase().includes("denied") && !msg.toLowerCase().includes("cancel")) {
        toast({ title: "Capture failed", variant: "destructive" });
      }
    } finally { setCapturing(false); setCountdown(0); }
  };

  const update = (id: string, f: "title" | "description", v: string) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [f]: v } : s));

  const remove = (id: string) => {
    setSteps(prev => {
      const next = prev.filter(s => s.id !== id);
      return next.map((s, i) => ({ ...s, title: s.title.match(/^Step \d+$/) ? `Step ${i + 1}` : s.title }));
    });
    if (expandedStep === id) setExpandedStep(null);
  };

  const move = (id: string, dir: "up" | "down") =>
    setSteps(prev => {
      const i = prev.findIndex(s => s.id === id);
      if ((dir === "up" && i === 0) || (dir === "down" && i === prev.length - 1)) return prev;
      const n = [...prev], j = dir === "up" ? i - 1 : i + 1;
      [n[i], n[j]] = [n[j], n[i]]; return n;
    });

  // HTML export with Tango-style hover magnifier
  const exportHTML = () => {
    if (!steps.length) { toast({ title: "No steps yet", variant: "destructive" }); return; }
    const title = guideTitle || "Process Guide";

    const magnifierJS = `<script>(function(){
  var mag=null,magImg=null;
  function ensureMag(){
    if(mag)return;
    mag=document.createElement('div');
    mag.style.cssText='position:fixed;pointer-events:none;z-index:9999;border-radius:12px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,.55);border:2px solid #463176;width:420px;height:270px;display:none;background:#000';
    magImg=document.createElement('img');
    magImg.style.cssText='position:absolute;transform-origin:top left;max-width:none;max-height:none;';
    mag.appendChild(magImg);
    document.body.appendChild(mag);
  }
  document.querySelectorAll('.step-img').forEach(function(img){
    img.style.cursor='zoom-in';
    img.title='Hover to zoom';
    img.addEventListener('mouseenter',function(){
      ensureMag();
      magImg.src=this.src;
      mag.style.display='block';
    });
    img.addEventListener('mouseleave',function(){if(mag)mag.style.display='none';});
    img.addEventListener('mousemove',function(e){
      if(!mag||!magImg.naturalWidth)return;
      var r=this.getBoundingClientRect();
      var xp=(e.clientX-r.left)/r.width;
      var yp=(e.clientY-r.top)/r.height;
      var sc=2.8,ow=420,oh=270;
      var nw=magImg.naturalWidth*sc,nh=magImg.naturalHeight*sc;
      magImg.style.width=nw+'px';magImg.style.height=nh+'px';
      magImg.style.left=Math.min(0,-(xp*nw-ow/2))+'px';
      magImg.style.top=Math.min(0,-(yp*nh-oh/2))+'px';
      var mx=e.clientX+28,my=e.clientY-135;
      if(mx+420>window.innerWidth)mx=e.clientX-448;
      if(my<8)my=8;
      if(my+270>window.innerHeight-8)my=window.innerHeight-278;
      mag.style.left=mx+'px';mag.style.top=my+'px';
    });
    img.addEventListener('click',function(){
      var w=window.open('','_blank');
      w.document.write('<html><body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="'+this.src+'" style="max-width:100%;max-height:100vh;object-fit:contain"></body></html>');
    });
  });
})();<\/script>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
*{box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f7;margin:0;color:#1a1a2e}
.hdr{background:linear-gradient(135deg,#463176,#6b4fa8);color:#fff;padding:48px 24px;text-align:center}
.hdr h1{margin:0 0 8px;font-size:2rem;font-weight:700}
.hdr p{margin:0;opacity:.75;font-size:.95rem}
.body{max-width:820px;margin:0 auto;padding:40px 24px}
.step{background:#fff;border-radius:14px;margin-bottom:28px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.06)}
.sh{display:flex;align-items:center;gap:14px;padding:16px 22px;border-bottom:1px solid #f0f0f0;background:#fafafa}
.sn{width:36px;height:36px;border-radius:50%;background:#463176;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;flex-shrink:0}
.st{font-weight:600;font-size:1rem;color:#1a1a2e}
.si{width:100%;display:block;cursor:zoom-in;transition:opacity .15s}
.si:hover{opacity:.97}
.sd{padding:16px 22px;font-size:.93rem;color:#4b5563;line-height:1.7;white-space:pre-wrap}
.zoom-hint{padding:6px 22px 0;font-size:11px;color:#9ca3af;font-style:italic}
footer{text-align:center;padding:36px;color:#9ca3af;font-size:.8rem}
footer a{color:#463176;text-decoration:none}
</style>
</head>
<body>
<div class="hdr">
  <h1>${title}</h1>
  <p>${steps.length} steps &middot; ${new Date().toLocaleDateString()}</p>
</div>
<div class="body">
${steps.map((s, i) => `<div class="step">
  <div class="sh"><div class="sn">${i + 1}</div><div class="st">${s.title}</div></div>
  ${s.screenshot ? `<div class="zoom-hint">Hover over image to zoom in &middot; Click to open full size</div><img class="step-img" src="${s.screenshot}" alt="${s.title}" style="display:block;width:100%"/>` : ""}
  ${s.description ? `<div class="sd">${s.description.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>` : ""}
</div>`).join("\n")}
</div>
<footer>Created with <a href="${tymfloUrl}/">TymFlo Hub</a></footer>
${magnifierJS}
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${guideTitle || "process-guide"}.html`; a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported! Hover over screenshots to zoom in." });
  };

  const copyMarkdown = () => {
    if (!steps.length) { toast({ title: "No steps yet", variant: "destructive" }); return; }
    const md = `# ${guideTitle || "Process Guide"}\n\n${steps.map((s, i) => `## Step ${i + 1}: ${s.title}${s.description ? `\n\n${s.description}` : ""}`).join("\n\n")}`;
    navigator.clipboard.writeText(md);
    toast({ title: "Markdown copied!" });
  };

  return (
    <div className="space-y-5">
      {importBanner && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div className="flex-1 text-sm text-green-800"><strong>Steps imported!</strong> Review and edit them below, then export your guide.</div>
          <button onClick={() => setImportBanner(false)} className="text-green-600 hover:text-green-800"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Bookmarklet installer */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="px-5 pt-5 pb-4 border-b bg-gradient-to-r from-[#463176]/5 to-transparent">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#463176] text-white flex items-center justify-center shrink-0"><Bookmark className="w-5 h-5" /></div>
            <div>
              <h2 className="font-semibold text-gray-900">Capture on Any Website</h2>
              <p className="text-sm text-gray-500 mt-0.5">Drag the button to your bookmarks bar. Click it on any page — a popup opens that stays visible as you navigate to other tabs.</p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap items-center gap-4">
            <BookmarkletLink
              code={bookmarkletCode}
              data-testid="bookmarklet-link"
              onClick={e => { e.preventDefault(); toast({ title: "Drag this button to your bookmarks bar!", description: "Then click it on any page to open the capture popup." }); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#463176] text-white rounded-lg font-medium text-sm cursor-grab active:cursor-grabbing select-none shadow-sm hover:bg-[#5a3f91] transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              TymFlo Capture
            </BookmarkletLink>
            <span className="text-sm text-gray-400">← Drag to your bookmarks bar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {[
              ["1. Install", "Drag the button above to your browser's bookmarks bar once."],
              ["2. Capture", "On any page, click the bookmark. A small popup appears — choose Entire Screen to capture across all tabs. Click Capture for each step."],
              ["3. Import", "Click Done in the popup — TymFlo Hub opens automatically and your steps appear here instantly."],
            ].map(([t, d]) => (
              <div key={t} className="bg-gray-50 rounded-lg p-3">
                <div className="font-semibold text-gray-700 mb-1">{t}</div>
                <div className="text-gray-500 text-xs leading-relaxed">{d}</div>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>The popup window is separate from your browser tabs — it stays open as you navigate. When prompted, choose <strong>Entire Screen</strong> to capture across all tabs. Works on Chrome &amp; Edge.</span>
          </div>
        </div>
      </div>

      {/* Manual capture */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Manual Screenshot Capture</h2>
        <p className="text-xs text-gray-500 mb-3">3-second countdown so you can switch windows before capture.</p>
        {countdown > 0 ? (
          <div className="flex items-center gap-4 py-2">
            <div className="text-4xl font-bold text-[#463176] animate-pulse w-10 text-center">{countdown}</div>
            <div className="text-sm text-gray-500">Switch to the window you want to capture…</div>
          </div>
        ) : (
          <Button onClick={capture} disabled={capturing} data-testid="button-capture-step" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
            <Image className="w-4 h-4" />
            {capturing ? "Capturing…" : "Capture Step"}
          </Button>
        )}
      </div>

      {/* Guide title */}
      {steps.length > 0 && (
        <div className="bg-white rounded-xl border p-5">
          <label className="text-sm font-medium text-gray-700 block mb-2">Guide Title</label>
          <Input placeholder="e.g. How to submit a support ticket" value={guideTitle} onChange={e => setGuideTitle(e.target.value)} data-testid="input-guide-title" className="max-w-lg" />
        </div>
      )}

      {/* Steps */}
      {steps.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-gray-600">Steps ({steps.length})</h3>
          </div>

          {steps.map((step, idx) => {
            const open = expandedStep === step.id;
            return (
              <div key={step.id} className="bg-white rounded-xl border overflow-hidden" data-testid={`step-card-${step.id}`}>
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => setExpandedStep(open ? null : step.id)}>
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-[#463176] text-white flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</div>
                  {step.screenshot && <img src={step.screenshot} alt="" className="h-8 w-14 object-cover rounded border shrink-0" />}
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{step.title}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={e => { e.stopPropagation(); move(step.id, "up"); }} disabled={idx === 0} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronUp className="w-3.5 h-3.5" /></button>
                    <button onClick={e => { e.stopPropagation(); move(step.id, "down"); }} disabled={idx === steps.length - 1} className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30"><ChevronDown className="w-3.5 h-3.5" /></button>
                    <button onClick={e => { e.stopPropagation(); remove(step.id); }} className="p-1.5 rounded hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
                {open && (
                  <div className="border-t">
                    {step.screenshot && <div className="bg-gray-950 max-h-72 overflow-hidden"><img src={step.screenshot} alt={step.title} className="w-full object-contain max-h-72" /></div>}
                    <div className="p-4 space-y-3 bg-gray-50">
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-1"><PenLine className="w-3 h-3" /> Title</label>
                        <Input value={step.title} onChange={e => update(step.id, "title", e.target.value)} data-testid={`input-title-${step.id}`} className="text-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center gap-1 mb-1"><PenLine className="w-3 h-3" /> Instruction</label>
                        <Textarea placeholder="Describe what to do in this step…" value={step.description} onChange={e => update(step.id, "description", e.target.value)} data-testid={`textarea-desc-${step.id}`} rows={2} className="resize-none text-sm bg-white" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <button onClick={capture} disabled={capturing || countdown > 0}
            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-400 hover:border-[#463176] hover:text-[#463176] transition-colors flex items-center justify-center gap-2"
            data-testid="button-add-step">
            <Plus className="w-4 h-4" />
            {countdown > 0 ? `Capturing in ${countdown}…` : "Add Another Step"}
          </button>

          {/* Export & Library */}
          <div className="bg-white rounded-xl border p-4 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Export Guide</h3>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={exportHTML} data-testid="button-export-html" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
                  <Download className="w-4 h-4" /> Export as HTML
                </Button>
                <Button variant="outline" onClick={copyMarkdown} data-testid="button-copy-md" className="gap-2">
                  <ClipboardCopy className="w-4 h-4" /> Copy Markdown
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">The exported HTML file includes hover-to-zoom on screenshots. Keep it as your saved guide.</p>
            </div>

            <div className="border-t pt-3">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Browser Library</h3>
              <div className="flex gap-3 flex-wrap">
                <Button variant="outline" onClick={saveToLibrary} data-testid="button-save-library" className="gap-2">
                  <BookOpen className="w-4 h-4" /> Save to Library
                </Button>
                <Button variant="outline" onClick={() => { setShowLibrary(!showLibrary); if (!showLibrary) loadLibrary(); }} data-testid="button-open-library" className="gap-2">
                  <FolderOpen className="w-4 h-4" /> {showLibrary ? "Hide" : "Open"} Library
                </Button>
                <Button variant="outline" onClick={() => { setSteps([]); setGuideTitle(""); setExpandedStep(null); setImportBanner(false); }}
                  data-testid="button-clear" className="gap-2 text-red-500 border-red-200 hover:bg-red-50 ml-auto">
                  <Trash2 className="w-4 h-4" /> Clear
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Saves to your browser's local storage. Guides remain until you clear browser data.</p>
            </div>
          </div>
        </div>
      )}

      {/* Library panel */}
      {showLibrary && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Saved Guides</h3>
            <button onClick={() => setShowLibrary(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>
          <div className="p-4">
            {libraryLoading ? (
              <p className="text-sm text-gray-500 text-center py-4">Loading…</p>
            ) : savedGuides.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No saved guides yet. Click "Save to Library" to save the current guide.</p>
            ) : (
              <div className="space-y-2">
                {savedGuides.map(g => (
                  <div key={g.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-800 truncate">{g.title}</div>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(g.savedAt).toLocaleDateString()} · {g.steps.length} steps
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => loadGuide(g)} className="shrink-0 gap-1">
                      <FolderOpen className="w-3 h-3" /> Load
                    </Button>
                    <button onClick={() => deleteGuide(g.id)} className="p-1.5 rounded hover:bg-red-50 text-red-400 shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {steps.length === 0 && countdown === 0 && !capturing && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-200">
          <Image className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No steps yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">Use the bookmarklet to capture steps on any website — it follows you across tabs</p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <BookmarkletLink
              code={bookmarkletCode}
              onClick={e => { e.preventDefault(); toast({ title: "Drag the button to your bookmarks bar!" }); }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#463176] text-white rounded-lg font-medium text-sm cursor-grab"
            >
              <Bookmark className="w-4 h-4" /> TymFlo Capture
            </BookmarkletLink>
            <span className="text-gray-300">or</span>
            <Button onClick={capture} variant="outline" className="gap-2"><Image className="w-4 h-4" /> Manual Capture</Button>
          </div>
        </div>
      )}
    </div>
  );
}
