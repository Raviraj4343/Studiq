const QUESTION_STOPWORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "briefly", "by", "comment", "define",
  "describe", "discuss", "distinguish", "elaborate", "enumerate", "explain", "find",
  "for", "from", "give", "how", "in", "into", "is", "list", "note", "of", "on",
  "or", "outline", "prove", "short", "state", "the", "their", "to", "what", "when",
  "where", "why", "with", "write"
]);

const stripQuestionNoise = (value) => value
  .replace(/^\s*(q(?:uestion)?\s*\d+|[a-z]\)|\d+[\).\]-]?|part\s+[a-z0-9]+[\).\]-]?)\s*/i, "")
  .replace(/\[\s*\d+\s*(marks?|points?)\s*\]/gi, "")
  .replace(/\(\s*\d+\s*(marks?|points?)\s*\)/gi, "")
  .replace(/\b(?:nov|dec|jan|feb|mar|apr|may|jun|jul|aug|sep|oct)\s*[-/]?\s*\d{2,4}\b/gi, "")
  .replace(/\s+/g, " ")
  .trim();

const splitIntoCandidates = (text) => text
  .replace(/\r/g, "\n")
  .split(/\n+|(?<=[?.:])\s+(?=(?:q(?:uestion)?\s*\d+|\d+[\).\]-]?|[a-z]\)))/gi)
  .map(stripQuestionNoise)
  .filter((item) => item.length >= 18 && /[a-z]{3}/i.test(item));

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
  const rankedClusters = (repeatedClusters.length ? repeatedClusters : clusters).slice(0, questionCount);

  return {
    questions: rankedClusters.map((cluster, index) => ({
      id: `q-${index + 1}`,
      text: cluster.representative.replace(/[.:\- ]+$/, "").trim(),
      frequency: cluster.count
    })),
    repeatedQuestionCount: repeatedClusters.length,
    totalQuestionCandidates: candidates.length
  };
};

export const buildPyqRevisionPlan = (questions) => {
  if (!questions.length) {
    return "Review the most repeated PYQ patterns first, then revise supporting concepts and definitions.";
  }

  const firstBlock = questions.slice(0, Math.min(3, questions.length)).map((item) => item.text).join("; ");
  return `Start with the most repeated PYQs: ${firstBlock}. Then prepare definitions, diagrams, comparisons, and one timed answer for each repeated pattern. End by revising short-answer variants built from the same repeated themes.`;
};
