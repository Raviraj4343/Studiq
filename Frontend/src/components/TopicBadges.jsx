export default function TopicBadges({ topics }) {
  return (
    <div className="flex flex-wrap gap-2">
      {topics.map((topic, index) => (
        <span
          key={topic.name}
          className="rounded-2xl bg-cyan-50 px-3 py-1 text-sm font-medium text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300"
        >
          {index + 1}. {topic.name}
        </span>
      ))}
    </div>
  );
}
