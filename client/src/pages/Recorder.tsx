import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/SEO";
import {
  Monitor,
  Camera,
  Layers,
  Mic,
  MicOff,
  Play,
  Pause,
  Square,
  Download,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  FileText,
  Video,
  Circle,
  CheckCircle,
  ClipboardCopy,
  RotateCcw,
} from "lucide-react";

type RecordMode = "screen" | "camera" | "screen+camera";
type RecordState = "idle" | "recording" | "paused" | "done";
type Tab = "recorder" | "process";

interface ProcessStep {
  id: string;
  screenshot: string;
  title: string;
  description: string;
}

export default function Recorder() {
  const [activeTab, setActiveTab] = useState<Tab>("recorder");

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Screen Recorder & Process Capture - TymFlo Hub"
        description="Record your screen, webcam, or both. Capture step-by-step process guides — all free, no install needed."
      />

      <div className="bg-gradient-to-br from-[#463176] to-[#6b4fa8] text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-white/20 mb-4">
            <Video className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Screen Recorder</h1>
          <p className="text-white/80 text-lg max-w-xl mx-auto">
            Record your screen, camera, or both. Build step-by-step process guides. Free, no install needed.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-1 bg-white border rounded-xl p-1 mb-8 w-fit">
          <button
            onClick={() => setActiveTab("recorder")}
            data-testid="tab-recorder"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "recorder"
                ? "bg-[#463176] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Video className="w-4 h-4" />
            Screen Recorder
          </button>
          <button
            onClick={() => setActiveTab("process")}
            data-testid="tab-process"
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === "process"
                ? "bg-[#463176] text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <FileText className="w-4 h-4" />
            Process Guide
          </button>
        </div>

        {activeTab === "recorder" ? <ScreenRecorderTab /> : <ProcessGuideTab />}
      </div>
    </div>
  );
}

function ScreenRecorderTab() {
  const { toast } = useToast();
  const [mode, setMode] = useState<RecordMode>("screen");
  const [micEnabled, setMicEnabled] = useState(true);
  const [recordState, setRecordState] = useState<RecordState>("idle");
  const [recordingName, setRecordingName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const playbackRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animRef = useRef<number | null>(null);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  useEffect(() => {
    return () => {
      stopAllStreams();
      if (timerRef.current) clearInterval(timerRef.current);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  const stopAllStreams = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    cameraStreamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    cameraStreamRef.current = null;
  };

  const startRecording = async () => {
    try {
      chunksRef.current = [];
      let finalStream: MediaStream;

      const audioConstraints = micEnabled ? { echoCancellation: true, noiseSuppression: true } : false;

      if (mode === "screen") {
        const screen = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        if (micEnabled) {
          try {
            const mic = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints, video: false });
            const ctx = new AudioContext();
            const dest = ctx.createMediaStreamDestination();
            if (screen.getAudioTracks().length) ctx.createMediaStreamSource(screen).connect(dest);
            ctx.createMediaStreamSource(mic).connect(dest);
            finalStream = new MediaStream([...screen.getVideoTracks(), ...dest.stream.getTracks()]);
          } catch {
            finalStream = screen;
          }
        } else {
          finalStream = screen;
        }
        streamRef.current = screen;

        if (previewRef.current) {
          previewRef.current.srcObject = finalStream;
          previewRef.current.play();
        }
      } else if (mode === "camera") {
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: audioConstraints,
        });
        finalStream = cam;
        cameraStreamRef.current = cam;
        if (previewRef.current) {
          previewRef.current.srcObject = cam;
          previewRef.current.play();
        }
      } else {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        const cam = await navigator.mediaDevices.getUserMedia({
          video: { width: 320, height: 240, facingMode: "user" },
          audio: audioConstraints,
        });
        streamRef.current = screen;
        cameraStreamRef.current = cam;

        const canvas = document.createElement("canvas");
        canvas.width = 1280;
        canvas.height = 720;
        canvasRef.current = canvas;
        const ctx = canvas.getContext("2d")!;

        const screenVid = document.createElement("video");
        screenVid.srcObject = screen;
        screenVid.play();

        const camVid = document.createElement("video");
        camVid.srcObject = cam;
        camVid.play();

        const draw = () => {
          ctx.drawImage(screenVid, 0, 0, 1280, 720);
          const pip = { w: 240, h: 180, margin: 16 };
          ctx.save();
          ctx.beginPath();
          ctx.arc(1280 - pip.w / 2 - pip.margin, 720 - pip.h / 2 - pip.margin, pip.w / 2, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(camVid, 1280 - pip.w - pip.margin, 720 - pip.h - pip.margin, pip.w, pip.h);
          ctx.restore();
          animRef.current = requestAnimationFrame(draw);
        };
        setTimeout(draw, 500);

        const canvasStream = canvas.captureStream(30);
        const audioTracks: MediaStreamTrack[] = [];
        if (micEnabled) {
          const audioCtx = new AudioContext();
          const dest = audioCtx.createMediaStreamDestination();
          if (screen.getAudioTracks().length) audioCtx.createMediaStreamSource(screen).connect(dest);
          if (cam.getAudioTracks().length) audioCtx.createMediaStreamSource(cam).connect(dest);
          audioTracks.push(...dest.stream.getTracks());
        }
        finalStream = new MediaStream([...canvasStream.getVideoTracks(), ...audioTracks]);

        if (previewRef.current) {
          previewRef.current.srcObject = finalStream;
          previewRef.current.play();
        }
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
        ? "video/webm;codecs=vp9"
        : "video/webm";

      const recorder = new MediaRecorder(finalStream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        if (animRef.current) cancelAnimationFrame(animRef.current);
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        stopAllStreams();
        if (previewRef.current) {
          previewRef.current.srcObject = null;
        }
        setRecordState("done");
      };

      recorder.start(250);
      setRecordState("recording");
      setElapsed(0);
      setVideoUrl(null);

      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

      screen?.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorder.state !== "inactive") stopRecording();
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      if (!msg.includes("denied") && !msg.includes("cancel")) {
        toast({ title: "Recording failed", description: msg, variant: "destructive" });
      }
    }
  };

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordState("paused");
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
      setRecordState("recording");
    }
  };

  const downloadRecording = () => {
    if (!videoUrl) return;
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = `${recordingName || "tymflo-recording"}-${new Date().toISOString().slice(0, 10)}.webm`;
    a.click();
    toast({ title: "Download started", description: "Your recording is downloading." });
  };

  const resetRecorder = () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setRecordState("idle");
    setElapsed(0);
    setRecordingName("");
    stopAllStreams();
    if (timerRef.current) clearInterval(timerRef.current);
    if (animRef.current) cancelAnimationFrame(animRef.current);
  };

  const modes: { id: RecordMode; label: string; icon: typeof Monitor; desc: string }[] = [
    { id: "screen", label: "Screen", icon: Monitor, desc: "Record your entire screen or a tab" },
    { id: "camera", label: "Camera", icon: Camera, desc: "Record from your webcam only" },
    { id: "screen+camera", label: "Screen + Camera", icon: Layers, desc: "Screen with webcam overlay (picture-in-picture)" },
  ];

  return (
    <div className="space-y-6">
      {recordState === "idle" && (
        <>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Recording Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {modes.map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.id}
                    data-testid={`mode-${m.id}`}
                    onClick={() => setMode(m.id)}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-colors ${
                      mode === m.id
                        ? "border-[#463176] bg-[#463176]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${mode === m.id ? "bg-[#463176] text-white" : "bg-gray-100 text-gray-600"}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{m.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{m.desc}</div>
                    </div>
                    {mode === m.id && (
                      <CheckCircle className="w-4 h-4 text-[#463176] absolute top-3 right-3" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-4">Options</h2>
            <div className="flex flex-wrap gap-4 items-center">
              <button
                data-testid="toggle-mic"
                onClick={() => setMicEnabled(!micEnabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                  micEnabled ? "border-[#463176] bg-[#463176]/5 text-[#463176]" : "border-gray-200 text-gray-500"
                }`}
              >
                {micEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                Microphone {micEnabled ? "On" : "Off"}
              </button>
              <p className="text-xs text-gray-400">
                Browser will ask for permission when you start recording.
              </p>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              data-testid="button-start-recording"
              onClick={startRecording}
              className="bg-red-500 hover:bg-red-600 text-white gap-2 px-8"
            >
              <Circle className="w-4 h-4 fill-white" />
              Start Recording
            </Button>
          </div>
        </>
      )}

      {(recordState === "recording" || recordState === "paused") && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="bg-gray-900 relative aspect-video">
            <video
              ref={previewRef}
              muted
              className="w-full h-full object-contain"
              data-testid="video-preview"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${recordState === "recording" ? "bg-red-500 animate-pulse" : "bg-yellow-400"}`} />
              <Badge className="bg-black/60 text-white border-0 font-mono text-sm">
                {formatTime(elapsed)}
              </Badge>
              {recordState === "paused" && (
                <Badge className="bg-yellow-400/90 text-yellow-900 border-0 text-xs">PAUSED</Badge>
              )}
            </div>
          </div>
          <div className="p-4 flex items-center justify-center gap-3">
            {recordState === "recording" ? (
              <Button variant="outline" onClick={pauseRecording} data-testid="button-pause" className="gap-2">
                <Pause className="w-4 h-4" /> Pause
              </Button>
            ) : (
              <Button variant="outline" onClick={resumeRecording} data-testid="button-resume" className="gap-2">
                <Play className="w-4 h-4" /> Resume
              </Button>
            )}
            <Button onClick={stopRecording} data-testid="button-stop" className="bg-red-500 hover:bg-red-600 text-white gap-2">
              <Square className="w-4 h-4 fill-white" /> Stop Recording
            </Button>
          </div>
        </div>
      )}

      {recordState === "done" && videoUrl && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="bg-gray-900 aspect-video">
              <video
                ref={playbackRef}
                src={videoUrl}
                controls
                className="w-full h-full object-contain"
                data-testid="video-playback"
              />
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Recording name</label>
                <Input
                  placeholder="my-screen-recording"
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                  data-testid="input-recording-name"
                />
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button onClick={downloadRecording} data-testid="button-download" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
                  <Download className="w-4 h-4" /> Download (.webm)
                </Button>
                <Button variant="outline" onClick={resetRecorder} data-testid="button-new-recording" className="gap-2">
                  <RotateCcw className="w-4 h-4" /> New Recording
                </Button>
              </div>
              <p className="text-xs text-gray-400">
                Recordings are saved locally to your device. Nothing is uploaded to any server.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
        <strong>Tip:</strong> Recordings are saved as .webm files, compatible with Chrome, Firefox, and Edge.
        For MP4 conversion, open the file in VLC or use an online converter.
      </div>
    </div>
  );
}

function ProcessGuideTab() {
  const { toast } = useToast();
  const [steps, setSteps] = useState<ProcessStep[]>([]);
  const [guideTitle, setGuideTitle] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const stepIdCounter = useRef(0);

  const captureScreenshot = async () => {
    setIsCapturing(true);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new (window as unknown as { ImageCapture: new (t: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> } }).ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();

      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
      const dataUrl = canvas.toDataURL("image/png");

      const id = String(++stepIdCounter.current);
      setSteps((prev) => [
        ...prev,
        {
          id,
          screenshot: dataUrl,
          title: `Step ${prev.length + 1}`,
          description: "",
        },
      ]);
      toast({ title: "Step captured", description: `Step ${steps.length + 1} screenshot added.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (!msg.includes("denied") && !msg.includes("cancel")) {
        toast({ title: "Capture failed", description: "Could not take screenshot.", variant: "destructive" });
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const updateStep = (id: string, field: "title" | "description", value: string) => {
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const deleteStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const moveStep = (id: string, dir: "up" | "down") => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === id);
      if ((dir === "up" && idx === 0) || (dir === "down" && idx === prev.length - 1)) return prev;
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  };

  const exportGuide = () => {
    if (steps.length === 0) {
      toast({ title: "No steps yet", description: "Capture at least one step first.", variant: "destructive" });
      return;
    }
    const title = guideTitle || "Process Guide";
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${title}</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:0 24px;color:#1a1a2e}
  h1{font-size:2rem;font-weight:700;margin-bottom:8px;color:#463176}
  .step{margin:32px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
  .step-header{padding:16px 20px;background:#f9fafb;border-bottom:1px solid #e5e7eb;display:flex;align-items:center;gap:12px}
  .step-num{background:#463176;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0}
  .step-title{font-weight:600;font-size:1rem}
  .step-img{width:100%;display:block}
  .step-desc{padding:16px 20px;font-size:0.95rem;color:#374151;line-height:1.6}
  footer{margin-top:48px;text-align:center;color:#9ca3af;font-size:0.8rem}
</style>
</head>
<body>
<h1>${title}</h1>
<p style="color:#6b7280;margin-bottom:32px">Generated with TymFlo Hub &middot; ${new Date().toLocaleDateString()}</p>
${steps
  .map(
    (s, i) => `<div class="step">
  <div class="step-header"><div class="step-num">${i + 1}</div><div class="step-title">${s.title}</div></div>
  ${s.screenshot ? `<img class="step-img" src="${s.screenshot}" alt="Step ${i + 1}"/>` : ""}
  ${s.description ? `<div class="step-desc">${s.description}</div>` : ""}
</div>`
  )
  .join("")}
<footer>Created with <a href="https://christastephens.github.io/tymflohub/" style="color:#463176">TymFlo Hub</a></footer>
</body>
</html>`;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${guideTitle || "process-guide"}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Guide exported!", description: "Open the .html file in any browser." });
  };

  const copyMarkdown = () => {
    if (steps.length === 0) {
      toast({ title: "No steps yet", description: "Add steps first.", variant: "destructive" });
      return;
    }
    const md = `# ${guideTitle || "Process Guide"}\n\n${steps
      .map((s, i) => `## Step ${i + 1}: ${s.title}\n\n${s.description || ""}`)
      .join("\n\n")}`;
    navigator.clipboard.writeText(md);
    toast({ title: "Copied!", description: "Markdown copied to clipboard." });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Guide Title</h2>
        <p className="text-sm text-gray-500 mb-3">Name your process guide</p>
        <Input
          placeholder="e.g. How to onboard a new client"
          value={guideTitle}
          onChange={(e) => setGuideTitle(e.target.value)}
          data-testid="input-guide-title"
          className="max-w-lg"
        />
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Capture Steps</h2>
            <p className="text-sm text-gray-500">Click the button below to take a screenshot for each step.</p>
          </div>
          <Badge className="bg-[#463176]/10 text-[#463176] border-0">
            {steps.length} {steps.length === 1 ? "step" : "steps"}
          </Badge>
        </div>

        <Button
          onClick={captureScreenshot}
          disabled={isCapturing}
          data-testid="button-capture-step"
          className="gap-2 bg-[#463176] hover:bg-[#5a3f91]"
        >
          <Plus className="w-4 h-4" />
          {isCapturing ? "Select screen to capture..." : "Capture Next Step"}
        </Button>
      </div>

      {steps.length > 0 && (
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={step.id} className="bg-white rounded-xl border overflow-hidden" data-testid={`step-card-${step.id}`}>
              <div className="flex items-center gap-3 px-5 py-3 bg-gray-50 border-b">
                <div className="w-7 h-7 rounded-full bg-[#463176] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </div>
                <Input
                  value={step.title}
                  onChange={(e) => updateStep(step.id, "title", e.target.value)}
                  data-testid={`input-step-title-${step.id}`}
                  className="flex-1 border-0 bg-transparent p-0 text-sm font-semibold focus-visible:ring-0 h-auto"
                  placeholder="Step title..."
                />
                <div className="flex items-center gap-1 ml-auto">
                  <button
                    onClick={() => moveStep(step.id, "up")}
                    disabled={idx === 0}
                    data-testid={`button-move-up-${step.id}`}
                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveStep(step.id, "down")}
                    disabled={idx === steps.length - 1}
                    data-testid={`button-move-down-${step.id}`}
                    className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteStep(step.id)}
                    data-testid={`button-delete-step-${step.id}`}
                    className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {step.screenshot && (
                <div className="border-b bg-gray-900">
                  <img
                    src={step.screenshot}
                    alt={step.title}
                    className="w-full object-contain max-h-80"
                  />
                </div>
              )}

              <div className="p-4">
                <Textarea
                  placeholder="Add a description or instruction for this step..."
                  value={step.description}
                  onChange={(e) => updateStep(step.id, "description", e.target.value)}
                  data-testid={`textarea-step-desc-${step.id}`}
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>
            </div>
          ))}

          <div className="flex gap-3 flex-wrap pt-2">
            <Button onClick={exportGuide} data-testid="button-export-guide" className="gap-2 bg-[#463176] hover:bg-[#5a3f91]">
              <Download className="w-4 h-4" /> Export as HTML
            </Button>
            <Button variant="outline" onClick={copyMarkdown} data-testid="button-copy-markdown" className="gap-2">
              <ClipboardCopy className="w-4 h-4" /> Copy Markdown
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setSteps([]);
                setGuideTitle("");
              }}
              data-testid="button-clear-guide"
              className="gap-2 text-red-500 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </Button>
          </div>
        </div>
      )}

      {steps.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No steps yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Capture Next Step" to take your first screenshot</p>
        </div>
      )}
    </div>
  );
}
