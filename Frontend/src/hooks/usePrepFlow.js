import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  DEFAULT_QUESTION_COUNT,
  DIFFICULTY_PLAYLIST_SIZE,
  SESSION_KEYS
} from "../constants/app.constants.js";
import { analyzePrep, fetchInsights, fetchPlaylist } from "../services/api.js";
import { extractTextFromFile } from "../utils/extractors.js";

const normalizeTopicList = (value) =>
  value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);

const normalizeTopicPayload = (topics) => topics.map((topic) => ({
  name: topic.name,
  weight: topic.weight,
  score: topic.score,
  adjustedScore: topic.adjustedScore,
  priority: topic.priority
}));

const getTextFromInput = async (text, file, emptyMessage) => {
  const trimmed = text.trim();
  if (trimmed) {
    return trimmed;
  }

  if (!file) {
    throw new Error(emptyMessage);
  }

  const extracted = await extractTextFromFile(file);
  if (!extracted.trim()) {
    throw new Error("We could not read enough text from that file.");
  }

  return extracted;
};

export const usePrepFlow = () => {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState("pyq");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [form, setForm] = useState({
    pyqFile: null,
    pyqText: "",
    syllabusFile: null,
    syllabusText: "",
    topicsText: ""
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

      if (workflow === "pyq") {
        const questionText = await getTextFromInput(
          form.pyqText,
          form.pyqFile,
          "Upload a PYQ file or paste PYQ text."
        );

        const analysis = await analyzePrep({
          questionPapers: [questionText],
          difficulty,
          topK: Math.min(Math.max(Math.ceil(questionCount / 2), 5), 30)
        });
        const topicPayload = normalizeTopicPayload(analysis.mostImportantTopics);
        const insights = await fetchInsights({
          topics: topicPayload.map((topic) => ({ name: topic.name, weight: topic.weight })),
          questionCount
        });

        const result = {
          ...analysis,
          playlist: [],
          insights,
          meta: {
            workflow,
            title: "Important Questions from PYQ",
            description: `Generated from previous year questions with a target of ${questionCount} questions.`
          }
        };

        window.sessionStorage.setItem(SESSION_KEYS.RESULTS, JSON.stringify(result));
        navigate("/dashboard", { state: { result } });
        return;
      }

      if (workflow === "syllabus") {
        const syllabus = await getTextFromInput(
          form.syllabusText,
          form.syllabusFile,
          "Upload a syllabus file or paste syllabus text."
        );

        const analysis = await analyzePrep({
          syllabus,
          difficulty
        });
        const topicPayload = normalizeTopicPayload(analysis.mostImportantTopics);
        const [playlist, insights] = await Promise.all([
          fetchPlaylist({
            topics: topicPayload,
            maxVideosPerTopic: DIFFICULTY_PLAYLIST_SIZE[difficulty]
          }),
          fetchInsights({
            topics: topicPayload.map((topic) => ({ name: topic.name, weight: topic.weight })),
            questionCount: DEFAULT_QUESTION_COUNT
          })
        ]);

        const result = {
          ...analysis,
          playlist,
          insights,
          meta: {
            workflow,
            title: "Syllabus Playlist",
            description: `Built from syllabus text with ${difficulty} difficulty videos.`
          }
        };

        window.sessionStorage.setItem(SESSION_KEYS.RESULTS, JSON.stringify(result));
        navigate("/dashboard", { state: { result } });
        return;
      }

      const topics = topicPreview;
      if (!topics.length) {
        throw new Error("Enter at least one topic name.");
      }

      const analysis = await analyzePrep({
        topics,
        difficulty,
        topK: Math.min(Math.max(topics.length, 3), 30)
      });
      const topicPayload = normalizeTopicPayload(analysis.mostImportantTopics);
      const playlist = await fetchPlaylist({
        topics: topicPayload,
        maxVideosPerTopic: DIFFICULTY_PLAYLIST_SIZE[difficulty]
      });

      const result = {
        ...analysis,
        playlist,
        insights: null,
        meta: {
          workflow,
          title: "Topic Playlist",
          description: `Playlist built from ${topics.length} topic names.`
        }
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
    isSubmitting,
    questionCount,
    setDifficulty,
    setQuestionCount,
    setWorkflow,
    submit,
    topicPreview,
    updateField,
    workflow
  };
};
