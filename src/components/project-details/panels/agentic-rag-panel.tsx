import React, { useState } from "react";
import { Search, Database } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  projectColor: string;
}

export default function AgenticRagPanel({ projectColor }: Props) {
  const { t } = useTranslation();
  const [ragQuery, setRagQuery] = useState("");
  const [ragResults, setRagResults] = useState<
    { title: string; score: number; text: string }[]
  >([]);

  const handleRagSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ragQuery.trim()) return;

    const mockResults = [
      {
        title: "episodic_memory_graph.db L45",
        score: 0.942,
        text: "Episodic memory logs user-agent chat history sequentially, representing it as node chains to keep chat context and relationships.",
      },
      {
        title: "vector_index_standard_embeddings.bin L110",
        score: 0.887,
        text: "Vector search retrieves similar text blocks using cosine distance metrics: cos(A,B) = (A·B)/(||A|| ||B||) to find relevant chunks.",
      },
      {
        title: "knowledge_base_nlp_basics.pdf L88",
        score: 0.725,
        text: "Token-based embeddings in transformer models use positional encoding and attention mechanisms to understand query semantics and intent beyond keyword matching.",
      },
    ];
    setRagResults(mockResults);
  };

  return (
    <div className="sub-panel glass-panel p-6" style={{ borderLeft: `3px solid ${projectColor}` }}>
      <h3 className="font-[Orbitron] text-base font-bold tracking-[0.05em] mb-4 text-white border-b border-white/[0.05] pb-2">
        {t("projectDetails.agenticRag.queryTitle")}
      </h3>
      <div className="flex flex-col gap-4">
        <form onSubmit={handleRagSearch} className="flex gap-2 mb-4">
          <div className="relative flex-grow">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
            />
            <input
              type="text"
              value={ragQuery}
              onChange={(e) => setRagQuery(e.target.value)}
              placeholder={t("projectDetails.agenticRag.queryPlaceholder")}
              className="bg-black/40 border border-[rgba(59,130,246,0.3)] pl-9 pr-4 py-2.5 rounded-md text-white font-[JetBrains_Mono] text-[0.8rem] flex-grow outline-none focus:border-[#3b82f6] focus:shadow-[0_0_10px_rgba(59,130,246,0.2)] transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            className="bg-[#3b82f6] text-white border-none font-[Orbitron] text-[0.8rem] font-bold px-5 py-2.5 rounded-md cursor-pointer flex items-center gap-2 transition-all duration-300 hover:bg-[#2563eb]"
          >
            {t("projectDetails.agenticRag.queryButton")}
          </button>
        </form>

        <div className="flex flex-col gap-2">
          {ragResults.length > 0 ? (
            ragResults.map((res, i) => (
              <div
                key={i}
                className="bg-white/[0.01] border border-white/[0.04] rounded-lg p-4"
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-[JetBrains_Mono] text-[0.75rem] text-[#3b82f6]">
                    {res.title}
                  </span>
                  <span className="font-[JetBrains_Mono] text-[0.65rem] text-[#fbbf24]">
                    {t("projectDetails.agenticRag.similarity")}:{" "}
                    {res.score.toFixed(3)}
                  </span>
                </div>
                <p className="text-[0.75rem] text-[#9ca3af] leading-[1.4]">
                  {res.text}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center p-8 border-[1.5px] border-dashed border-white/[0.05] rounded-lg text-[#9ca3af] text-[0.8rem]">
              <Database size={24} className="mx-auto mb-2 opacity-30" />
              {t("projectDetails.agenticRag.noQuery")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
