import React, { useState, useEffect } from "react";
import { Mic, Send } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  projectColor: string;
}

export default function VoiceCanvasPanel({ projectColor }: Props) {
  const { t } = useTranslation();
  const [voiceIsListening, setVoiceIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState<string[]>([]);
  const [userSpeechInput, setUserSpeechInput] = useState("");

  useEffect(() => {
    setVoiceIsListening(false);
    setUserSpeechInput("");
    setVoiceTranscript([
      t("projectDetails.voiceCanvas.listenPrompt"),
      t("projectDetails.voiceCanvas.systemPrompt"),
    ]);
  }, []);

  const toggleVoiceListening = () => {
    if (voiceIsListening) {
      setVoiceIsListening(false);
      const userPhrases = [
        "How do you reduce VAD latency?",
        "Can you summarize the architecture?",
        "Tell me a joke about robots.",
        "Optimize my TTS buffer size.",
      ];
      const randomUserText =
        userPhrases[Math.floor(Math.random() * userPhrases.length)];

      setVoiceTranscript((prev) => [...prev, `You: ${randomUserText}`]);

      setTimeout(() => {
        let response = "";
        if (randomUserText.includes("latency")) {
          response =
            "VoiceCanvas Agent: We stream audio in 20ms chunks directly into GPU memory to perform VAD classification asynchronously, reducing total latency below 120ms.";
        } else if (randomUserText.includes("architecture")) {
          response =
            "VoiceCanvas Agent: It is a duplex path: User Audio -> VAD (VADStream) -> ASR (Opus-decoded Whisper) -> LLM -> TTS -> Audio playback queue.";
        } else if (randomUserText.includes("joke")) {
          response =
            "VoiceCanvas Agent: Why did the computer squeak? Because someone stepped on its mouse! Ha-ha. Let us get back to engineering.";
        } else {
          response =
            "VoiceCanvas Agent: Excellent query. By minimizing the buffer window size to 1024 samples and using Opus packet-loss concealment, we maintain clear streaming audio quality.";
        }
        setVoiceTranscript((prev) => [...prev, response]);
      }, 1000);
    } else {
      setVoiceIsListening(true);
      setVoiceTranscript((prev) => [
        ...prev,
        "Listening... Speak now and press microphone again when done.",
      ]);
    }
  };

  const handleVoiceTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpeechInput.trim()) return;

    const input = userSpeechInput;
    setVoiceTranscript((prev) => [...prev, `You: ${input}`]);
    setUserSpeechInput("");

    setTimeout(() => {
      setVoiceTranscript((prev) => [
        ...prev,
        `VoiceCanvas Agent: Received text input. Processing audio synthesis backend... Synthesized payload containing ${input.length * 3} samples of expressive voice.`,
      ]);
    }, 800);
  };

  return (
    <div className="sub-panel glass-panel p-6" style={{ borderLeft: `3px solid ${projectColor}` }}>
      <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
        {t("projectDetails.voiceCanvas.voiceTitle")}
      </h3>

      <div className="flex flex-col gap-3">
        <div className="h-[140px] overflow-y-auto bg-black/30 border border-white/[0.03] p-3 rounded-md text-[0.75rem] font-[JetBrains_Mono] flex flex-col gap-1.5">
          {voiceTranscript.map((msg, i) => (
            <div key={i} className="leading-[1.5]">
              <span className={msg.startsWith("You:") ? "text-[#06b6d4]" : "text-[#9ca3af]"}>
                {msg}
              </span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={toggleVoiceListening}
            className={`flex items-center gap-2 font-[Orbitron] text-[0.75rem] font-bold px-4 py-2.5 rounded-md cursor-pointer transition-all duration-300 border ${
              voiceIsListening
                ? "bg-[rgba(239,68,68,0.2)] border-[rgba(239,68,68,0.5)] text-[#ef4444]"
                : "bg-[rgba(6,182,212,0.1)] border-[rgba(6,182,212,0.3)] text-[#06b6d4]"
            }`}
          >
            <Mic size={14} />
            {voiceIsListening
              ? t("projectDetails.voiceCanvas.stopListening")
              : t("projectDetails.voiceCanvas.startListening")}
          </button>

          <form onSubmit={handleVoiceTextSubmit} className="flex gap-2 flex-grow">
            <input
              type="text"
              value={userSpeechInput}
              onChange={(e) => setUserSpeechInput(e.target.value)}
              placeholder={t("projectDetails.voiceCanvas.textPlaceholder")}
              className="bg-black/40 border border-white/[0.08] px-3 py-2 rounded-md text-white font-[JetBrains_Mono] text-[0.75rem] flex-grow outline-none focus:border-[#06b6d4] transition-colors"
            />
            <button
              type="submit"
              className="bg-[#06b6d4] text-white border-none px-4 py-2 rounded-md cursor-pointer flex items-center gap-2 font-[Orbitron] text-[0.7rem] font-bold transition-all duration-300 hover:bg-[#0891b2]"
            >
              <Send size={12} />
              {t("projectDetails.voiceCanvas.send")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
