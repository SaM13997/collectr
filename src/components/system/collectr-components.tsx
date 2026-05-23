import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import {
  Archive,
  Check,
  ChevronDown,
  Command,
  Copy,
  ExternalLink,
  FileText,
  Folder,
  FolderInput,
  Globe,
  Hash,
  Home,
  Inbox,
  Monitor,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Smartphone,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Accent = "coral" | "sky" | "mint" | "violet" | "butter" | "rose";

const accentClasses: Record<Accent, string> = {
  coral: "bg-coral/20 text-[#2a1714] dark:text-coral",
  sky: "bg-sky/25 text-[#173337] dark:text-sky",
  mint: "bg-mint/40 text-[#243023] dark:text-mint",
  violet: "bg-violet/20 text-violet dark:text-violet",
  butter: "bg-butter/30 text-[#312719] dark:text-butter",
  rose: "bg-rose/35 text-[#3b201b] dark:text-rose",
};

export function BrutalButton({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "danger" | "ghost";
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 border-2 px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-x-0.5 active:translate-y-0.5 active:shadow-none",
        variant === "primary" &&
          "border-ink bg-ink text-panel shadow-[3px_3px_0_0_var(--color-coral)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-coral)] dark:border-primary dark:bg-primary dark:text-ink",
        variant === "outline" &&
          "border-ink bg-transparent text-ink hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-sage hover:shadow-[4px_4px_0_0_var(--color-ink)] dark:border-primary dark:text-primary dark:hover:bg-charcoal-2 dark:hover:shadow-[4px_4px_0_0_var(--color-primary)]",
        variant === "danger" &&
          "border-coral bg-transparent text-coral hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-coral/10 hover:shadow-[4px_4px_0_0_var(--color-coral)]",
        variant === "ghost" &&
          "border-transparent bg-transparent text-muted-foreground hover:border-ink hover:bg-sage dark:hover:border-primary dark:hover:bg-charcoal-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BrutalChip({
  active = false,
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center justify-center border-2 border-ink px-4 py-2 font-heading text-[11px] font-bold uppercase tracking-[0.06em] transition-all duration-150 ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:border-primary",
        active
          ? "bg-ink text-panel shadow-[3px_3px_0_0_var(--color-coral)] dark:bg-primary dark:text-ink"
          : "bg-transparent text-foreground hover:bg-sage dark:hover:bg-charcoal-2",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function BrutalBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center bg-coral px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.05em] text-[#2a1714]", className)}>
      {children}
    </span>
  );
}

export function ComponentSection({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("scroll-mt-8", className)}>
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-coral">{eyebrow}</p>
          <h2 className="font-heading text-xl font-black uppercase tracking-[-0.02em] text-foreground sm:text-2xl">{title}</h2>
        </div>
        {description ? <p className="max-w-md text-sm font-medium text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function LibraryPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("border-2 border-ink bg-panel p-4 shadow-[6px_6px_0_0_var(--color-ink)] dark:border-primary dark:bg-charcoal dark:shadow-[6px_6px_0_0_var(--color-primary)] sm:p-5", className)}>
      {children}
    </div>
  );
}

export function SearchCommandInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex min-h-12 items-center gap-3 border-2 border-ink bg-panel px-4 text-muted-foreground transition-all duration-150 ease-[var(--ease-out)] focus-within:shadow-[4px_4px_0_0_var(--color-coral)] dark:border-primary dark:bg-charcoal">
      <Search className="size-4 shrink-0" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Search saved links"
        {...props}
      />
      <span className="border border-line-strong px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">⌘K</span>
    </label>
  );
}

export function CollectionTile({
  name,
  count,
  accent = "coral",
  className,
}: {
  name: string;
  count: number;
  accent?: Accent;
  className?: string;
}) {
  return (
    <article className={cn("group min-w-48 overflow-hidden border-2 border-ink bg-panel shadow-[4px_4px_0_0_var(--color-ink)] transition-all duration-200 ease-[var(--ease-out)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-coral)] dark:border-primary dark:bg-charcoal dark:shadow-[4px_4px_0_0_var(--color-primary)]", className)}>
      <div className={cn("relative aspect-[4/3]", accentClasses[accent])}>
        <div className="absolute inset-4 border-2 border-current/20" />
        <span className="absolute bottom-2 right-2 bg-ink px-2 py-1 font-heading text-[10px] font-black uppercase tracking-[0.04em] text-panel dark:bg-primary dark:text-ink">{count}</span>
      </div>
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <p className="truncate font-heading text-[13px] font-bold uppercase tracking-[0.01em]">{name}</p>
        <ChevronDown className="size-4 text-muted-foreground" />
      </div>
    </article>
  );
}

export function SavedItemRow({
  source,
  title,
  description,
  tags = [],
  unread = false,
  accent = "mint",
}: {
  source: string;
  title: string;
  description: string;
  tags?: string[];
  unread?: boolean;
  accent?: Accent;
}) {
  return (
    <article className="flex items-center gap-3 border-2 border-ink bg-panel p-3 transition-all duration-150 ease-[var(--ease-out)] hover:border-coral hover:shadow-[3px_3px_0_0_var(--color-coral)] dark:border-primary dark:bg-charcoal">
      <div className={cn("flex size-12 shrink-0 items-center justify-center border-2 border-ink font-heading text-base font-black uppercase text-ink dark:border-primary", accentClasses[accent])}>{source}</div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          {unread ? <span className="size-2 shrink-0 rounded-full bg-coral" aria-label="Unread" /> : null}
          <p className="truncate font-heading text-[13px] font-bold uppercase tracking-[0.01em]">{title}</p>
        </div>
        <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">{description}</p>
        {tags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 border border-line-strong px-1.5 py-0.5 font-heading text-[10px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                <Hash className="size-2.5" />
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
      <button className="flex min-h-11 min-w-11 items-center justify-center border-2 border-transparent text-muted-foreground transition-colors hover:border-ink hover:bg-sage dark:hover:border-primary dark:hover:bg-charcoal-2" aria-label={`Actions for ${title}`}>
        <MoreHorizontal className="size-4" />
      </button>
    </article>
  );
}

export function EmptyStateBlock() {
  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-line-strong bg-panel px-6 py-12 text-center dark:bg-charcoal">
      <div className="flex size-12 items-center justify-center border-2 border-line-strong text-muted-foreground">
        <FileText className="size-5" />
      </div>
      <h3 className="mt-4 font-heading text-sm font-bold uppercase tracking-[0.02em]">No links saved yet</h3>
      <p className="mt-1 text-sm font-medium text-muted-foreground">Paste a link or share something to Collectr to start your library.</p>
    </div>
  );
}

export function BulkToolbarPreview() {
  return (
    <div className="flex flex-col gap-3 border-2 border-ink bg-panel p-3 dark:border-primary dark:bg-charcoal sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2">
        <button className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground" aria-label="Exit selection">
          <X className="size-4" />
        </button>
        <span className="font-heading text-[13px] font-bold uppercase tracking-[0.02em]">3 selected</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <BrutalButton variant="outline" className="px-3 py-2 text-[10px]"><FolderInput className="size-3.5" />Move</BrutalButton>
        <BrutalButton variant="danger" className="px-3 py-2 text-[10px]"><Trash2 className="size-3.5" />Delete</BrutalButton>
      </div>
    </div>
  );
}

export function FolderPickerPreview() {
  const folders = [
    { label: "Saved (Inbox)", icon: Inbox, accent: "coral" as Accent },
    { label: "Design Inspiration", icon: Folder, accent: "violet" as Accent },
    { label: "Read Later", icon: Folder, accent: "sky" as Accent },
    { label: "Recipes", icon: Folder, accent: "mint" as Accent },
  ];

  return (
    <div className="grid min-h-72 place-items-center bg-ink/45 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm border-2 border-ink bg-panel p-5 shadow-[8px_8px_0_0_var(--color-ink)] dark:border-primary dark:bg-charcoal dark:shadow-[8px_8px_0_0_var(--color-primary)]">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-heading text-[13px] font-black uppercase tracking-[0.04em]">Move to collection</h3>
          <button className="flex min-h-11 min-w-11 items-center justify-center text-muted-foreground" aria-label="Close folder picker"><X className="size-4" /></button>
        </div>
        <div className="flex flex-col gap-1">
          {folders.map((folder) => (
            <button key={folder.label} className="flex min-h-11 items-center gap-3 px-3 py-2 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-butter hover:text-[#312719]">
              <folder.icon className={cn("size-4", accentClasses[folder.accent])} />
              <span className="truncate">{folder.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CommandPalettePreview() {
  return (
    <div className="overflow-hidden border-2 border-ink bg-panel shadow-[8px_8px_0_0_var(--color-ink)] dark:border-primary dark:bg-charcoal dark:shadow-[8px_8px_0_0_var(--color-primary)]">
      <div className="flex min-h-13 items-center gap-3 border-b-2 border-ink px-4 dark:border-primary">
        <Search className="size-4 text-muted-foreground" />
        <input className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground" placeholder="Search items, navigate, or run actions…" aria-label="Command search" />
        <span className="border border-line-strong px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase">Esc</span>
      </div>
      <div className="p-2">
        <p className="px-2 py-1 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Navigation</p>
        {["Go to Inbox", "Go to All Items", "Add new link"].map((item, index) => (
          <div key={item} className={cn("flex min-h-11 items-center gap-3 px-3 py-2", index === 0 && "bg-butter text-[#312719]")}> 
            <div className="flex size-8 items-center justify-center border-2 border-current/20">{index === 2 ? <Plus className="size-4" /> : <Command className="size-4" />}</div>
            <span className="font-heading text-sm font-semibold">{item}</span>
            <span className="ml-auto border border-current/20 px-1.5 py-0.5 font-mono text-[10px]">{index === 2 ? "N" : index === 0 ? "G H" : "G A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileNavPreview() {
  const mainItems = [
    { label: "Home", icon: Home, active: true },
    { label: "Search", icon: Search },
    { label: "Collections", icon: Folder },
  ];

  return (
    <div className="mx-auto flex max-w-sm items-center gap-3">
      <div 
        className="flex h-11 flex-1 items-center justify-around border-2 border-ink bg-panel shadow-[3px_3px_0_0_var(--color-coral)] dark:border-primary dark:bg-charcoal dark:shadow-[3px_3px_0_0_var(--color-coral)]"
        style={{ 
          transform: "skewX(-12deg)",
          padding: "8px 16px",
          gap: "8px"
        }}
      >
        {mainItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-muted-foreground",
              item.active && "text-coral"
            )}
            style={{ transform: "skewX(12deg)" }}
          >
            <item.icon className="size-5" />
            <span className="font-heading text-[9px] font-bold uppercase tracking-[0.08em]">{item.label}</span>
          </button>
        ))}
      </div>

      <button
        className="group relative flex h-11 items-center justify-center border-2 border-ink bg-ink px-4 text-panel shadow-[3px_3px_0_0_var(--color-coral)] transition-transform duration-150 ease-[var(--ease-out)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_var(--color-coral)] active:translate-x-0 active:translate-y-0 active:shadow-none dark:border-primary dark:bg-primary dark:text-ink"
        style={{ transform: "skewX(-12deg)" }}
        aria-label="Add link"
      >
        <span className="flex items-center gap-1.5" style={{ transform: "skewX(12deg)" }}>
          <Plus className="size-5" />
          <span className="font-heading text-[10px] font-bold uppercase tracking-[0.06em]">Add</span>
        </span>
      </button>
    </div>
  );
}

export function ThemeSelectorPreview() {
  const options = [
    { label: "Light", icon: Sun },
    { label: "Dark", icon: Moon, active: true },
    { label: "System", icon: Monitor },
  ];

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <button key={option.label} className={cn("flex min-h-28 flex-col items-center justify-center gap-2 border-2 border-line-strong p-4 font-heading text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground transition-colors hover:border-ink hover:text-foreground dark:hover:border-primary", option.active && "border-coral bg-coral/10 text-coral")}> 
          <span className="flex size-9 items-center justify-center border-2 border-current"><option.icon className="size-4" /></span>
          {option.label}
        </button>
      ))}
    </div>
  );
}

export function SettingsSectionPreview() {
  return (
    <LibraryPanel className="shadow-none">
      <div className="mb-4">
        <h3 className="font-heading text-[13px] font-black uppercase tracking-[0.06em]">Appearance</h3>
        <p className="mt-1 text-sm font-medium text-muted-foreground">Choose your preferred theme.</p>
      </div>
      <ThemeSelectorPreview />
    </LibraryPanel>
  );
}

export function EntryDetailPreview() {
  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex size-12 items-center justify-center border-2 border-ink bg-sage-deep font-heading text-lg font-black text-ink dark:border-primary dark:bg-charcoal-3 dark:text-primary">𝕏</div>
        <div>
          <p className="font-heading text-sm font-bold uppercase">@rafrasenberg</p>
          <p className="text-xs font-medium text-muted-foreground">Rafa Rasaenberg</p>
        </div>
      </div>
      <h3 className="font-title text-2xl font-black uppercase leading-tight tracking-[-0.02em]">The best design systems are the ones you barely notice</h3>
      <LibraryPanel className="shadow-none">
        <p className="mb-2 font-heading text-[10px] font-bold uppercase tracking-[0.1em] text-coral">Post</p>
        <p className="text-sm font-medium leading-6">They don't shout — they guide. Consistency isn't about making everything look the same. It's about making everything feel right.</p>
      </LibraryPanel>
      <div className="flex flex-wrap gap-2">
        <BrutalButton><ExternalLink className="size-4" />Open on X</BrutalButton>
        <BrutalButton variant="outline"><Copy className="size-4" />Copy URL</BrutalButton>
        <BrutalButton variant="danger"><Trash2 className="size-4" />Delete</BrutalButton>
      </div>
    </div>
  );
}

export function TokenSwatch({ name, hex, className }: { name: string; hex?: string; className: string }) {
  return (
    <div className="overflow-hidden border-2 border-ink bg-panel dark:border-primary dark:bg-charcoal">
      <div className={cn("h-20", className)} />
      <div className="flex items-center justify-between p-3">
        <p className="font-heading text-[11px] font-bold uppercase tracking-[0.06em]">{name}</p>
        {hex ? <p className="font-mono text-[10px] text-muted-foreground">{hex}</p> : null}
      </div>
    </div>
  );
}

export const showcaseCollections = [
  { name: "Design Inspiration", count: 24, accent: "coral" as Accent },
  { name: "Read Later", count: 18, accent: "sky" as Accent },
  { name: "Recipes", count: 9, accent: "mint" as Accent },
  { name: "Dev Resources", count: 31, accent: "violet" as Accent },
];

export const showcaseItems = [
  { source: "𝕏", title: "@rafrasenberg", description: "The best design systems are the ones you barely notice…", tags: ["design", "systems"], unread: true, accent: "mint" as Accent },
  { source: "R", title: "r/webdev", description: "Why TypeScript is winning in 2025", tags: ["dev"], unread: true, accent: "sky" as Accent },
  { source: "🌐", title: "kerning.theory", description: "The complete guide to optical sizing", tags: ["typography"], accent: "butter" as Accent },
];

export const showcaseIcons = { Archive, Check, Globe, Home, Smartphone };
