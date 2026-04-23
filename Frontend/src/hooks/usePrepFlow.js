import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { SESSION_KEYS } from "../constants/app.constants.js";
import { analyzePrep, fetchInsights, fetchPlaylist } from "../services/api.js";
import { extractTextFromPdf } from "../utils/pdf.js";

const normalizeTopicList = (value) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

export const usePrepFlow = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState("text");
  const [difficulty, setDifficulty] = useState("medium");
  const [form, setForm] = useState({
    syllabus: "",
    topicsText: "",
    pdfFile: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const topicPreview = useMemo(() => normalizeTopicList(form.topicsText), [form.topicsText]);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      let syllabus = form.syllabus.trim();
      const topics = inputMode === "topics" ? topicPreview : [];

      if (inputMode === "pdf") {
        if (!form.pdfFile) {
          throw new Error("Upload a PDF before analyzing.");
        }
        syllabus = await extractTextFromPdf(form.pdfFile);
      }

      const analyzePayload = {
        syllabus: inputMode === "text" || inputMode === "pdf" ? syllabus : undefined,
        topics: inputMode === "topics" ? topics : undefined,
        difficulty
      };

      const analysis = await analyzePrep(analyzePayload);
      const topicPayload = analysis.mostImportantTopics.map((topic) => ({
        name: topic.name,
        weight: topic.weight,
        score: topic.score,
        adjustedScore: topic.adjustedScore,
        priority: topic.priority
      }));

      const [playlist, insights] = await Promise.all([
        fetchPlaylist({ topics: topicPayload }),
        fetchInsights({
          topics: topicPayload.map((topic) => ({ name: topic.name, weight: topic.weight }))
        })
      ]);

      const result = {
        ...analysis,
        playlist,
        insights
      };

      window.sessionStorage.setItem(SESSION_KEYS.RESULTS, JSON.stringify(result));
      navigate("/dashboard", { state: { result } });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    difficulty,
    error,
    form,
    inputMode,
    isSubmitting,
    topicPreview,
    setDifficulty,
    setInputMode,
    submit,
    updateField
  };
};
