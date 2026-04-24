import { Clock3, Eye, ThumbsUp, Video } from "lucide-react";

const formatCount = (value) => new Intl.NumberFormat("en-US", { notation: "compact" }).format(value || 0);

export default function PlaylistSection({ playlist }) {
  return (
    <section className="panel p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold text-white">YouTube Playlist</p>
          <p className="text-sm text-slate-400">Ranked learning videos tuned for exam prep.</p>
        </div>
      </div>
      <div className="space-y-6">
        {playlist.map((entry) => (
          <div key={entry.topic} className="space-y-4 rounded-xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{entry.topic}</p>
                <p className="text-sm text-slate-400">Topic weight: {entry.topicWeight}</p>
              </div>
              <span className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-300">
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
                  className="group rounded-xl border border-slate-800 bg-slate-900/70 p-4 transition hover:-translate-y-1 hover:border-cyan-500"
                >
                  <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-cyan-300">
                    <Video className="h-4 w-4" />
                    {video.topicTag}
                  </div>
                  <p className="font-medium text-white">{video.title}</p>
                  <p className="mt-2 text-sm text-slate-400">{video.channelTitle}</p>
                  <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-4 w-4" />
                      {video.durationMinutes ? `${video.durationMinutes} mins` : video.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {formatCount(video.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {formatCount(video.views)}
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
