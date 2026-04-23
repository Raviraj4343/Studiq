import re
from collections import Counter

from app.core.constants import MIN_TOKEN_LENGTH, NGRAM_SIZES, PRIORITY_BUCKETS, STOPWORDS


def clean_text(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[\r\n,;:()\-/]+", " | ", text)
    text = re.sub(r"[^a-z0-9\s|]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_candidate_terms(cleaned_text: str) -> list[str]:
    candidates: list[str] = []

    for segment in cleaned_text.split("|"):
        tokens = [
            token for token in segment.strip().split(" ")
            if len(token) >= MIN_TOKEN_LENGTH and token not in STOPWORDS and not token.isdigit()
        ]

        for ngram_size in NGRAM_SIZES:
            if len(tokens) < ngram_size:
                continue

            for index in range(len(tokens) - ngram_size + 1):
                chunk = tokens[index:index + ngram_size]
                if any(token in STOPWORDS for token in chunk):
                    continue
                candidates.append(" ".join(chunk))

    return candidates


def prune_candidates(counts: Counter[str]) -> Counter[str]:
    pruned = Counter()

    for candidate, frequency in counts.items():
        if len(candidate.split()) == 1:
            if any(
                longer != candidate and candidate in longer.split() and longer_frequency >= frequency
                for longer, longer_frequency in counts.items()
                if len(longer.split()) > 1
            ):
                continue
        pruned[candidate] = frequency

    return pruned


def assign_priority(score: float) -> str:
    if score >= PRIORITY_BUCKETS["high"]:
        return "high"
    if score >= PRIORITY_BUCKETS["medium"]:
        return "medium"
    return "low"


def rank_topics(text: str, top_k: int) -> dict:
    cleaned = clean_text(text)
    candidates = extract_candidate_terms(cleaned)

    if not candidates:
        return {"topics": [], "total_candidates": 0}

    counts = prune_candidates(Counter(candidates))
    max_count = max(counts.values())
    max_terms = max(len(term.split()) for term in counts)

    topics = []
    for token, freq in counts.most_common(top_k):
        term_bonus = len(token.split()) / max_terms if max_terms else 0
        score = round(min((freq / max_count) * 0.75 + term_bonus * 0.15 + min(freq / 10, 0.1), 1), 3)
        topics.append({
            "name": token,
            "frequency": freq,
            "score": score,
            "priority": assign_priority(score)
        })

    return {
        "topics": topics,
        "total_candidates": len(counts)
    }
