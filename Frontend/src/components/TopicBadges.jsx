export default function TopicBadges({ topics }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic, index) => (
        <span
          key={topic.name}
          className="topic-pill"
        >
          {index + 1}. {topic.name}
        </span>
      ))}
    </div>
  );
}
