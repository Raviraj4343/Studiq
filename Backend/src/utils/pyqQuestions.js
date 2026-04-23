const QUESTION_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "briefly", "by", "comment", "define",
  "describe", "discuss", "distinguish", "elaborate", "enumerate", "explain", "find",
  "for", "from", "give", "how", "in", "into", "is", "list", "note", "of", "on",
  "or", "outline", "prove", "short", "state", "the", "their", "to", "what", "when",
  "where", "why", "with", "write"
]);

const QUESTION_LEADERS = [
  "what", "why", "how", "which", "who", "whom", "where", "when", "explain", "analyze",
  "analyse", "discuss", "describe", "define", "distinguish", "compare", "evaluate", "comment",
  "mention", "write", "list", "justify", "examine", "illustrate", "elaborate"
];

const BOILERPLATE_PATTERNS = [
  /question\s+paper\s+contains/i,
  /attempt\s+all\s+questions/i,
  /missing\s+data/i,
  /before\s+attempting/i,
  /table\/?data\s+hand\s*book/i,
  /to\s+be\s+supplied\s+to\s+the\s+candidates/i,
  /end\s+semester\s+examination/i,
  /mid\s+semester\s+examination/i,
  /session\s*:\s*/i,
  /class\s*:\s*/i,
  /subject\s*:\s*/i,
  /institute\s+of\s+technology/i
];

const QUESTION_MARKER_REGEX = /(?:\bq(?:uestion)?\.?\s*\d+\s*(?:\([a-z0-9]+\))?|\b\d+\s*\([a-z0-9]+\)|\b\([a-z0-9]+\)(?=\s*[a-z]))/gi;

const stripQuestionNoise = (value) => value
  .replace(/^\s*(q(?:uestion)?\s*\d+|\([a-z0-9]+\)[\).\]-]?|[a-z]\)|\d+[\).\]-]?|part\s+[a-z0-9]+[\).\]-]?)\s*/i, "")
  .replace(/\[\s*\d+\s*(marks?|points?)\s*\]/gi, "")
  .replace(/\(\s*\d+\s*(marks?|points?)\s*\)/gi, "")
  .replace(/\b\d+\s*marks?\b/gi, "")
  .replace(/\b(?:co\s*)?b?l?\s*q\.?\d+[a-z]?\b/gi, "")
  .replace(/\b(?:nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct)\s*[-/]?\s*\d{2,4}\b/gi, "")
  .replace(/\b(?:\d\s*){2,}\b/g, " ")
  .replace(/[-_=]{3,}/g, " ")
  .replace(/\s+/g, " ")
  .trim();

const sanitizeDisplayText = (value) => value
  .replace(/\[[^\]]*\]/g, " ")
  .replace(/(?:^|\s)[^a-z0-9\s]{3,}(?:\s*[a-z])?(?=\s|$)/gi, " ")
  .replace(/\s*\/+\s*/g, " ")
  .replace(/\s+[/:|\\]+\s*/g, " ")
  .replace(/\b[mwe]\b\s*$/i, "")
  .replace(/\s+/g, " ")
  .replace(/[.:\-/ ]+$/g, "")
  .trim();

const isQuestionLike = (text) => {
  if (!text) {
    return false;
  }

  if (BOILERPLATE_PATTERNS.some((pattern) => pattern.test(text))) {
    return false;
  }

  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length < 5 || words.length > 40) {
    return false;
  }

  const hasLeader = QUESTION_LEADERS.some((leader) => new RegExp(`\\b${leader}\\b`, "i").test(text));
  const hasQuestionMark = text.includes("?");

  return hasLeader || hasQuestionMark;
};

const splitIntoCandidates = (text) => {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .replace(QUESTION_MARKER_REGEX, (match) => `\n${match}`);

  const chunks = normalized
    .split(/\n+|(?<=[.;!?])\s+(?=(?:q(?:uestion)?\s*\d+|\d+\s*\([a-z0-9]+\)|\([a-z0-9]+\)))/gi)
    .flatMap((segment) => segment.split(/(?=\b(?:q(?:uestion)?\.?\s*\d+|\d+\s*\([a-z0-9]+\)|\([a-z0-9]+\)))/gi));

  return chunks
    .map(stripQuestionNoise)
    .filter((item) => item.length >= 18 && /[a-z]{3}/i.test(item))
    .filter(isQuestionLike);
};

const normalizeToken = (token) => {
  const cleaned = token.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!cleaned || cleaned.length < 3 || QUESTION_STOPWORDS.has(cleaned)) {
    return "";
  }

  if (cleaned.endsWith("ies")) {
    return `${cleaned.slice(0, -3)}y`;
  }
  if (cleaned.endsWith("s") && !cleaned.endsWith("ss")) {
    return cleaned.slice(0, -1);
  }

  return cleaned;
};

const tokenSet = (question) => new Set(
  question
    .split(/\s+/)
    .map(normalizeToken)
    .filter(Boolean)
);

const jaccardSimilarity = (left, right) => {
  if (!left.size || !right.size) {
    return 0;
  }

  let intersection = 0;
  for (const token of left) {
    if (right.has(token)) {
      intersection += 1;
    }
  }

  return intersection / new Set([...left, ...right]).size;
};

const clusterQuestions = (questions) => {
  const clusters = [];

  for (const question of questions) {
    const tokens = tokenSet(question);
    let bestCluster = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const similarity = jaccardSimilarity(tokens, cluster.tokens);
      if (similarity > bestScore) {
        bestScore = similarity;
        bestCluster = cluster;
      }
    }

    if (bestCluster && bestScore >= 0.45) {
      bestCluster.questions.push(question);
      bestCluster.count += 1;
      bestCluster.tokens = new Set([...bestCluster.tokens, ...tokens]);
      if (question.length > bestCluster.representative.length) {
        bestCluster.representative = question;
      }
      continue;
    }

    clusters.push({
      representative: question,
      questions: [question],
      count: 1,
      tokens
    });
  }

  return clusters.sort((a, b) => b.count - a.count || b.representative.length - a.representative.length);
};

export const extractRepeatedQuestions = (questionPapers, questionCount) => {
  const rawText = questionPapers?.join("\n\n") || "";
  const candidates = splitIntoCandidates(rawText);

  if (!candidates.length) {
    return {
      questions: [],
      repeatedQuestionCount: 0,
      totalQuestionCandidates: 0
    };
  }

  const clusters = clusterQuestions(candidates);
  const repeatedClusters = clusters.filter((cluster) => cluster.count > 1);
  const rankedClusters = repeatedClusters.slice(0, questionCount);

  return {
    questions: rankedClusters.map((cluster, index) => ({
      id: `q-${index + 1}`,
      text: sanitizeDisplayText(cluster.representative),
      frequency: cluster.count
    })),
    repeatedQuestionCount: repeatedClusters.length,
    totalQuestionCandidates: candidates.length
  };
};

export const buildPyqRevisionPlan = (questions) => {
  if (!questions.length) {
    return "No strong repeated PYQ cluster was found. Re-upload clearer PYQ text and revise core definitions, high-weight topics, and one timed mixed answer set.";
  }

  const firstBlock = questions
    .slice(0, Math.min(3, questions.length))
    .map((item) => sanitizeDisplayText(item.text))
    .join("; ");
  return `Start with the most repeated PYQs: ${firstBlock}. Then prepare definitions, diagrams, comparisons, and one timed answer for each repeated pattern. End by revising short-answer variants built from the same repeated themes.`;
};
