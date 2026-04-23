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

const getTextsFromInput = async (text, files, emptyMessage) => {
  const trimmed = text.trim();

  const selectedFiles = Array.isArray(files) ? files : [];
  if (!trimmed && !selectedFiles.length) {
    throw new Error(emptyMessage);
  }

  const extractedTexts = selectedFiles.length
    ? await Promise.all(selectedFiles.map((file) => extractTextFromFile(file)))
    : [];

  const cleanedFileTexts = extractedTexts
    .map((value) => value.trim())
    .filter(Boolean);

  if (!trimmed && !cleanedFileTexts.length) {
    throw new Error("We could not read enough text from the selected files.");
  }

  const textParts = [trimmed, ...cleanedFileTexts].filter(Boolean);

  return {
    text: textParts.join("\n\n"),
    textParts
  };
};

export const usePrepFlow = () => {
  const navigate = useNavigate();
  const [workflow, setWorkflow] = useState("pyq");
  const [difficulty, setDifficulty] = useState("medium");
  const [questionCount, setQuestionCount] = useState(DEFAULT_QUESTION_COUNT);
  const [form, setForm] = useState({
    pyqFiles: [],
    pyqText: "",
    syllabusFiles: [],
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
        const questionInput = await getTextsFromInput(
          form.pyqText,
          form.pyqFiles,
          "Upload one or more PYQ files, or paste PYQ text."
        );

        const analysis = await analyzePrep({
          questionPapers: questionInput.textParts,
          difficulty,
          topK: Math.min(Math.max(Math.ceil(questionCount / 2), 5), 30)
        });
        const insights = await fetchInsights({
          topics: normalizeTopicPayload(analysis.mostImportantTopics).map((topic) => ({ name: topic.name, weight: topic.weight })),
          questionCount,
          questionPapers: questionInput.textParts,
          workflow: "pyq"
        });

        const result = {
          ...analysis,
          playlist: [],
          insights,
          meta: {
            workflow,
            title: "Important Questions from PYQ",
            description: `Picked from the most repeated question patterns found in your submitted PYQs.`,
            questionCount
          }
        };

        window.sessionStorage.setItem(SESSION_KEYS.RESULTS, JSON.stringify(result));
        navigate("/dashboard", { state: { result } });
        return;
      }

      if (workflow === "syllabus") {
        const syllabusInput = await getTextsFromInput(
          form.syllabusText,
          form.syllabusFiles,
          "Upload one or more syllabus files, or paste syllabus text."
        );

        const analysis = await analyzePrep({
          syllabus: syllabusInput.text,
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
