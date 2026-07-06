import { NotificationBell } from './NotificationBell';
import { GlobalSearch } from './GlobalSearch';
import { SystemClock } from './SystemClock';

export function TopBar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#141416]/95 backdrop-blur">
      <div className="flex items-center gap-4 px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-xs uppercase tracking-[0.16em] text-[#71717A]">MR Z Brand OS</div>
          <h1 className="mt-1 truncate text-xl font-semibold text-[#F0EDE8]">{title}</h1>
        </div>

        <div className="hidden min-w-[340px] flex-1 xl:block">
          <GlobalSearch />
        </div>

        <div className="flex items-center gap-3">
          <SystemClock />
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
