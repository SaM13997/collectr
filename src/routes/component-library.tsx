import { createFileRoute } from "@tanstack/react-router";
import {
  Archive,
  Check,
  Folder,
  Globe,
  Inbox,
  Plus,
  Search,
  Settings,
  Smartphone,
} from "lucide-react";
import {
  BrutalBadge,
  BrutalButton,
  BrutalChip,
  BulkToolbarPreview,
  CollectionTile,
  CommandPalettePreview,
  ComponentSection,
  EmptyStateBlock,
  EntryDetailPreview,
  FolderPickerPreview,
  LibraryPanel,
  MobileNavPreview,
  SavedItemRow,
  SearchCommandInput,
  SettingsSectionPreview,
  TokenSwatch,
  showcaseCollections,
  showcaseItems,
} from "@/components/system/collectr-components";

export const Route = createFileRoute("/component-library")({
  component: ComponentsPage,
});

const navItems = ["Tokens", "Buttons", "Cards", "Overlays", "Mobile", "Details"];

function ComponentsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b-2 border-ink bg-panel dark:border-primary dark:bg-charcoal">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center bg-ink font-heading text-lg font-black text-panel shadow-[3px_3px_0_0_var(--color-coral)] dark:bg-primary dark:text-ink">C</div>
              <div>
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.12em] text-coral">Collectr System</p>
                <p className="font-heading text-lg font-black uppercase tracking-[-0.02em]">Component Library</p>
              </div>
            </div>
            <BrutalButton>
              <Plus className="size-4" />
              Add link
            </BrutalButton>
          </div>
          <div>
            <h1 className="max-w-4xl font-title text-5xl font-black uppercase leading-[0.9] tracking-[-0.04em] sm:text-7xl lg:text-8xl">
              Save anything.
              <br />
              Find it later.
            </h1>
            <p className="mt-5 max-w-2xl border-l-4 border-coral pl-4 text-base font-medium text-muted-foreground sm:text-lg">
              A signed-in Collectr kit for fast capture, loose organization, and confident retrieval across links, posts, recipes, and references.
            </p>
          </div>
          <nav aria-label="Component sections" className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {navItems.map((item, index) => (
              <BrutalChip key={item} active={index === 0}>{item}</BrutalChip>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-10 sm:px-8 lg:px-10">
        <ComponentSection eyebrow="Tokens" title="Editorial-brutalist foundations" description="The page consumes the existing CSS variables from styles.css, so the same components invert cleanly in dark mode.">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TokenSwatch name="Sage" hex="#c7cfc2" className="bg-sage" />
            <TokenSwatch name="Ink" hex="#191816" className="bg-ink" />
            <TokenSwatch name="Coral" hex="#fc6b55" className="bg-coral" />
            <TokenSwatch name="Butter" hex="#f4ce6a" className="bg-butter" />
            <TokenSwatch name="Sky" hex="#aae8f1" className="bg-sky" />
            <TokenSwatch name="Violet" hex="#7b81ff" className="bg-violet" />
            <TokenSwatch name="Mint" hex="#d2ddd0" className="bg-mint" />
            <TokenSwatch name="Rose" hex="#f7c4b8" className="bg-rose" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TokenSwatch name="Charcoal" hex="#1f1e1c" className="bg-charcoal" />
            <TokenSwatch name="Charcoal 2" hex="#2a2927" className="bg-charcoal-2" />
            <TokenSwatch name="Charcoal 3" hex="#383633" className="bg-charcoal-3" />
            <TokenSwatch name="Sage Deep" hex="#b5beb0" className="bg-sage-deep" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TokenSwatch name="Panel" hex="#fbfcf8" className="bg-panel border border-line-strong" />
            <TokenSwatch name="Panel Strong" hex="#f6f8f2" className="bg-panel-strong border border-line-strong" />
            <TokenSwatch name="Alert" hex="#fc6b55" className="bg-accent-alert" />
            <TokenSwatch name="Insight" hex="#7b81ff" className="bg-accent-insight" />
          </div>
          <LibraryPanel className="mt-5">
            <p className="font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-coral">Typography</p>
            <div className="mt-3 grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <p className="font-title text-4xl font-black uppercase leading-none tracking-[-0.04em] sm:text-6xl">Cabinet Grotesk, loud when needed.</p>
              <div className="space-y-2 text-sm font-medium text-muted-foreground">
                <p className="font-heading text-xl font-bold uppercase text-foreground">Heading sample</p>
                <p>Satoshi carries the quieter product copy: direct, useful, and low-pressure.</p>
                <p className="font-mono text-xs uppercase tracking-wider">Mono / keyboard / metadata</p>
              </div>
            </div>
          </LibraryPanel>
        </ComponentSection>

        <ComponentSection eyebrow="Controls" title="Buttons, chips, badges, and search" description="Hard edges, offset coral shadows, and large touch targets make the controls feel physical without adding complexity.">
          <LibraryPanel>
            <div className="flex flex-wrap gap-3">
              <BrutalButton><Plus className="size-4" />Primary action</BrutalButton>
              <BrutalButton variant="outline"><Archive className="size-4" />Secondary</BrutalButton>
              <BrutalButton variant="danger">Delete</BrutalButton>
              <BrutalButton variant="ghost">Ghost</BrutalButton>
              <BrutalChip active>All</BrutalChip>
              <BrutalChip>Links</BrutalChip>
              <BrutalBadge>Unread 3</BrutalBadge>
            </div>
            <div className="mt-5 max-w-xl">
              <SearchCommandInput placeholder="Search saved links…" defaultValue="design" />
            </div>
          </LibraryPanel>
        </ComponentSection>

        <ComponentSection eyebrow="Cards" title="Collections and saved items" description="The primary browsing surfaces keep one scan path: collection thumbnails first, then dense saved-link rows.">
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {showcaseCollections.map((collection) => (
              <CollectionTile key={collection.name} {...collection} />
            ))}
          </div>
          <div className="mt-5 grid gap-2">
            {showcaseItems.map((item) => (
              <SavedItemRow key={item.title} {...item} />
            ))}
          </div>
          <div className="mt-5">
            <EmptyStateBlock />
          </div>
        </ComponentSection>

        <ComponentSection eyebrow="Actions" title="Bulk tools and picker surfaces" description="Selection and movement stay explicit, with compact controls that still meet mobile target sizing.">
          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-5">
              <BulkToolbarPreview />
              <SettingsSectionPreview />
            </div>
            <FolderPickerPreview />
          </div>
        </ComponentSection>

        <ComponentSection eyebrow="Command" title="Fast navigation patterns" description="Keyboard-first search is shown as a static preview here, ready to pair with the app command palette behavior.">
          <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <CommandPalettePreview />
            <LibraryPanel className="flex flex-col justify-between gap-6">
              <div>
                <p className="font-heading text-[11px] font-bold uppercase tracking-[0.1em] text-coral">Status language</p>
                <p className="mt-2 text-sm font-medium text-muted-foreground">Quiet confidence beats alarm. Offline, unread, active, and synced states should explain what is happening without making organization feel like homework.</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[Globe, Smartphone, Search, Check].map((Icon, index) => (
                  <div key={index} className="flex min-h-20 items-center justify-center border-2 border-line-strong bg-panel-strong dark:bg-charcoal-2">
                    <Icon className="size-6 text-coral" />
                  </div>
                ))}
              </div>
            </LibraryPanel>
          </div>
        </ComponentSection>

        <ComponentSection eyebrow="Responsive" title="Mobile bottom navigation" description="The signed-in shell hides desktop navigation on small screens and keeps primary actions in thumb reach.">
          <MobileNavPreview />
        </ComponentSection>

        <ComponentSection eyebrow="Detail" title="Entry detail composition" description="Saved posts need enough structure for source context, notes, tags, and direct actions without feeling like a document editor.">
          <LibraryPanel>
            <EntryDetailPreview />
          </LibraryPanel>
        </ComponentSection>

        <ComponentSection eyebrow="Page shell" title="Navigation shell sample" description="A compact signed-in frame showing how components sit inside Collectr's product layout.">
          <div className="overflow-hidden border-2 border-ink bg-panel shadow-[8px_8px_0_0_var(--color-ink)] dark:border-primary dark:bg-charcoal dark:shadow-[8px_8px_0_0_var(--color-primary)]">
            <div className="grid md:grid-cols-[240px_1fr]">
              <aside className="hidden border-r-2 border-ink p-4 dark:border-primary md:block">
                <div className="mb-6 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center bg-ink font-heading font-black text-panel dark:bg-primary dark:text-ink">C</div>
                  <span className="font-heading font-black uppercase">Collectr</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Inbox", icon: Inbox, active: true },
                    { label: "All Items", icon: Search },
                    { label: "Collections", icon: Folder },
                    { label: "Settings", icon: Settings },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} className={`flex min-h-11 w-full items-center justify-between border-2 px-3 font-heading text-[12px] font-bold uppercase tracking-[0.02em] ${item.active ? "border-ink bg-ink text-panel shadow-[3px_3px_0_0_var(--color-coral)] dark:border-primary dark:bg-primary dark:text-ink" : "border-transparent text-muted-foreground hover:border-line-strong hover:bg-sage dark:hover:bg-charcoal-2"}`}>
                        <span className="flex items-center gap-2"><Icon className="size-4" />{item.label}</span>
                        {item.active ? <BrutalBadge>3</BrutalBadge> : null}
                      </button>
                    );
                  })}
                </div>
              </aside>
              <div>
                <div className="flex min-h-14 items-center justify-between border-b-2 border-ink px-4 dark:border-primary">
                  <p className="font-heading font-black uppercase">Inbox</p>
                  <BrutalButton className="min-h-9 px-3 py-1 text-[10px]"><Plus className="size-3.5" />Add</BrutalButton>
                </div>
                <div className="space-y-4 p-4">
                  <div className="bg-butter px-3 py-2 text-center font-heading text-[11px] font-bold uppercase tracking-[0.06em] text-[#312719]">You're offline. Showing cached data.</div>
                  <SavedItemRow source="𝕏" title="@studio.nima" description="New brutalist ceramics collection drop…" accent="rose" />
                </div>
              </div>
            </div>
          </div>
        </ComponentSection>
      </div>
    </main>
  );
}
