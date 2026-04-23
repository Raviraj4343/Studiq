import { Clock3, ThumbsUp, Video } from "lucide-react";

const formatCount = (value) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(value || 0);

export default function PlaylistSection({ playlist }) {
  return (
    <section className="panel p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">Smart Playlist</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ranked learning videos tuned for exam prep.</p>
        </div>
      </div>
      <div className="space-y-6">
        {playlist.map((entry) => (
          <div key={entry.topic} className="space-y-4 rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold">{entry.topic}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Topic weight: {entry.topicWeight}</p>
              </div>
              <span className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Ranked
              </span>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {entry.videos.map((video) => (
                <a
                  key={video.url}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:border-cyan-400 dark:border-slate-800"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
                    <Video className="h-4 w-4" />
                    {video.topicTag}
                  </div>
                  <p className="font-medium">{video.title}</p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{video.channelTitle}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {video.durationMinutes ? `${video.durationMinutes} mins` : video.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {formatCount(video.likes)}
                    </span>
                    <span>Score {video.score}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
