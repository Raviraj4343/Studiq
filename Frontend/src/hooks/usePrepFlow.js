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

const TOPIC_TEXT_NOISE = new Set([
  "syllabus",
  "unit",
  "module",
  "course",
  "subject",
  "semester",
  "credits",
  "total",
  "hours"
]);

const normalizeTopicCandidate = (value) => value
  .toLowerCase()
  .replace(/[^a-z0-9\s]/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const extractTopicsFromTextParts = (textParts, limit = 12) => {
  if (!Array.isArray(textParts) || !textParts.length) {
    return [];
  }

  const seen = new Set();
  const extracted = [];

  const pushTopic = (candidate) => {
    const normalized = normalizeTopicCandidate(candidate);
    if (!normalized || normalized.length < 4 || normalized.length > 70) {
      return;
    }

    const tokens = normalized.split(" ").filter(Boolean);
    if (!tokens.length || tokens.length > 8) {
      return;
    }
    if (tokens.every((token) => TOPIC_TEXT_NOISE.has(token))) {
      return;
    }

    const key = tokens.join(" ");
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    extracted.push(tokens.map((token) => token[0].toUpperCase() + token.slice(1)).join(" "));
  };

  for (const part of textParts) {
    const lines = part
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length >= 4);

    for (const line of lines) {
      const splitItems = line.split(/[,:;|]/).map((item) => item.trim()).filter(Boolean);
      if (!splitItems.length) {
        continue;
      }

      splitItems.forEach(pushTopic);
      if (extracted.length >= limit) {
        return extracted;
      }
    }
  }

  return extracted;
};

const mergeTopicPayloadWithExtractedTopics = (topicPayload, extractedTopics) => {
  const merged = [...topicPayload];
  const existing = new Set(topicPayload.map((topic) => normalizeTopicCandidate(topic.name)));

  for (const topicName of extractedTopics) {
    const normalized = normalizeTopicCandidate(topicName);
    if (!normalized || existing.has(normalized)) {
      continue;
    }

    existing.add(normalized);
    merged.push({
      name: topicName,
      weight: 0.25,
      score: 0.25,
      adjustedScore: 0.25,
      priority: "medium"
    });
  }

  return merged;
};

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

const requestPlaylistSubjectName = () => {
  const previousValue = window.sessionStorage.getItem(SESSION_KEYS.PLAYLIST_SUBJECT) || "";
  const entered = window.prompt(
    "For a better playlist, please enter your full subject name (example: Data Structures and Algorithms):",
    previousValue
  );

  if (entered === null) {
    throw new Error("Subject name is required to generate a better playlist.");
  }

  const normalized = entered.trim().replace(/\s+/g, " ");
  if (normalized.length < 3) {
    throw new Error("Please enter a valid full subject name for better playlist generation.");
  }

  window.sessionStorage.setItem(SESSION_KEYS.PLAYLIST_SUBJECT, normalized);
  return normalized;
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
        const subjectName = requestPlaylistSubjectName();

        const analysis = await analyzePrep({
          syllabus: syllabusInput.text,
          difficulty
        });
        const topicPayload = normalizeTopicPayload(analysis.mostImportantTopics);
        const extractedTopics = extractTopicsFromTextParts(syllabusInput.textParts, 12);
        const playlistTopicPayload = mergeTopicPayloadWithExtractedTopics(topicPayload, extractedTopics);
        const [playlist, insights] = await Promise.all([
          fetchPlaylist({
            topics: playlistTopicPayload,
            maxVideosPerTopic: DIFFICULTY_PLAYLIST_SIZE[difficulty],
            subjectName
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
      const subjectName = requestPlaylistSubjectName();

      const analysis = await analyzePrep({
        topics,
        difficulty,
        topK: Math.min(Math.max(topics.length, 3), 30)
      });
      const topicPayload = normalizeTopicPayload(analysis.mostImportantTopics);
      const playlist = await fetchPlaylist({
        topics: topicPayload,
        maxVideosPerTopic: DIFFICULTY_PLAYLIST_SIZE[difficulty],
        subjectName
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
