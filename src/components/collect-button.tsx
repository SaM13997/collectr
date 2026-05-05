import { useState, useRef, useEffect, useCallback } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import type { Id } from "../../convex/_generated/dataModel"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  X,
  ChevronLeft,
  ClipboardPaste,
  Tag,
  FolderOpen,
  Check,
  Plus,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type View = "main" | "collections" | "tags"

const TWEET_URL_RE =
  /(https?:\/\/(?:www\.|mobile\.)?(?:twitter\.com|x\.com)\/[\w_]+\/status\/\d+)/i

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  handler: () => void
) {
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        handler()
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [ref, handler])
}

export function CollectButton() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>("main")
  const [content, setContent] = useState("")
  const [selectedFolderId, setSelectedFolderId] = useState<Id<"folders"> | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const folderData = useQuery(api.folders.listTree)
  const addTweet = useMutation(api.tweets.addFromUrl)
  const createFolder = useMutation(api.folders.create)

  const collections = folderData?.folders ?? []
  const selectedFolder = collections.find((f) => f._id === selectedFolderId)

  const close = useCallback(() => {
    setOpen(false)
    setView("main")
    setContent("")
    setSelectedFolderId(null)
    setTags([])
    setTagInput("")
    setNewFolderName("")
  }, [])

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setContent(text)
    } catch {
      toast.error("Unable to access clipboard")
    }
  }, [])

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) {
      toast.error("Enter something to collect")
      return
    }

    if (!TWEET_URL_RE.test(trimmed)) {
      toast.error("That doesn't look like a tweet URL")
      return
    }

    try {
      setIsSaving(true)
      await addTweet({ url: trimmed, folderId: selectedFolderId })
      toast.success("Saved")
      close()
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to save"
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateFolder = async () => {
    const name = newFolderName.trim()
    if (!name) return
    try {
      const id = await createFolder({ name, parentId: null })
      setSelectedFolderId(id)
      setNewFolderName("")
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create collection"
      )
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase()
    if (!tag) return
    if (tags.includes(tag)) {
      toast.error("Tag already added")
      return
    }
    setTags((prev) => [...prev, tag])
    setTagInput("")
  }

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  const containerRef = useRef<HTMLDivElement>(null)
  useClickOutside(containerRef, close)

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, close])

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-4 z-30 flex h-12 items-center gap-2 rounded-full border border-border bg-primary px-5 text-sm font-medium text-primary-foreground shadow-lg transition-shadow hover:shadow-xl",
          "md:hidden",
          open && "pointer-events-none opacity-0"
        )}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <Plus className="size-4" />
        collect
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 md:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            />

            {/* Popover card */}
            <motion.div
              ref={containerRef}
              className="absolute inset-x-4 bottom-6 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", bounce: 0.1, duration: 0.35 }}
            >
              <AnimatePresence mode="wait">
                {view === "main" && (
                  <MotionView key="main">
                    <MainView
                      content={content}
                      onContentChange={setContent}
                      onPaste={handlePaste}
                      selectedFolder={selectedFolder}
                      tags={tags}
                      onOpenCollections={() => setView("collections")}
                      onOpenTags={() => setView("tags")}
                      onClose={close}
                      onSubmit={handleSubmit}
                      isSaving={isSaving}
                    />
                  </MotionView>
                )}

                {view === "collections" && (
                  <MotionView key="collections">
                    <CollectionsView
                      collections={collections}
                      selectedFolderId={selectedFolderId}
                      onSelect={(id) => setSelectedFolderId(id)}
                      onBack={() => setView("main")}
                      newFolderName={newFolderName}
                      onNewFolderNameChange={setNewFolderName}
                      onCreateFolder={handleCreateFolder}
                    />
                  </MotionView>
                )}

                {view === "tags" && (
                  <MotionView key="tags">
                    <TagsView
                      tags={tags}
                      tagInput={tagInput}
                      onTagInputChange={setTagInput}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      onBack={() => setView("main")}
                    />
                  </MotionView>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function MotionView({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -32 }}
      transition={{ type: "spring", bounce: 0, duration: 0.25 }}
    >
      {children}
    </motion.div>
  )
}

function MainView({
  content,
  onContentChange,
  onPaste,
  selectedFolder,
  tags,
  onOpenCollections,
  onOpenTags,
  onClose,
  onSubmit,
  isSaving,
}: {
  content: string
  onContentChange: (v: string) => void
  onPaste: () => void
  selectedFolder?: { name: string } | undefined
  tags: string[]
  onOpenCollections: () => void
  onOpenTags: () => void
  onClose: () => void
  onSubmit: () => void
  isSaving: boolean
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold">Collect</span>
        <button
          type="button"
          onClick={onClose}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Textarea */}
      <div className="relative px-4">
        <textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          placeholder="Paste a tweet or X post URL..."
          className="h-24 w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 pr-10 text-sm text-foreground placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
          autoFocus
        />
        <button
          type="button"
          onClick={onPaste}
          className="absolute right-6 top-3.5 flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Paste from clipboard"
        >
          <ClipboardPaste className="size-4" />
        </button>
      </div>

      {/* Collection / Tags row */}
      <div className="flex gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onOpenCollections}
          className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <FolderOpen className="size-4 shrink-0" />
          <span className="truncate">
            {selectedFolder ? selectedFolder.name : "Collection"}
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenTags}
          className={cn(
            "flex flex-1 items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
            tags.length > 0
              ? "border-ring/50 bg-accent text-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <Tag className="size-4 shrink-0" />
          <span className="truncate">
            {tags.length > 0 ? `${tags.length} tag${tags.length > 1 ? "s" : ""}` : "Tags"}
          </span>
        </button>
      </div>

      {/* Submit */}
      <div className="px-4 pb-4">
        <Button
          onClick={onSubmit}
          disabled={isSaving || !content.trim()}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  )
}

function CollectionsView({
  collections,
  selectedFolderId,
  onSelect,
  onBack,
  newFolderName,
  onNewFolderNameChange,
  onCreateFolder,
}: {
  collections: Array<{ _id: Id<"folders">; name: string; tweetCount: number }>
  selectedFolderId: Id<"folders"> | null
  onSelect: (id: Id<"folders"> | null) => void
  onBack: () => void
  newFolderName: string
  onNewFolderNameChange: (v: string) => void
  onCreateFolder: () => void
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Back"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">Collection</span>
      </div>

      {/* List */}
      <div className="max-h-[20vh] overflow-y-auto px-4">
        {/* None option */}
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
            selectedFolderId === null
              ? "bg-accent text-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          )}
        >
          <span className="flex-1 text-left">No collection</span>
          {selectedFolderId === null && (
            <Check className="size-4 shrink-0" />
          )}
        </button>

        {collections.map((folder) => (
          <button
            key={folder._id}
            type="button"
            onClick={() => onSelect(folder._id)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              selectedFolderId === folder._id
                ? "bg-accent text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            )}
          >
            <FolderOpen className="size-4 shrink-0" />
            <span className="flex-1 text-left truncate">{folder.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {folder.tweetCount}
            </span>
            {selectedFolderId === folder._id && (
              <Check className="size-4 shrink-0" />
            )}
          </button>
        ))}

        {collections.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No collections yet
          </p>
        )}
      </div>

      {/* Create new */}
      <div className="flex gap-2 px-4 py-3 border-t border-border">
        <Input
          value={newFolderName}
          onChange={(e) => onNewFolderNameChange(e.target.value)}
          placeholder="New collection..."
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") onCreateFolder()
          }}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={onCreateFolder}
          disabled={!newFolderName.trim()}
          className="h-9 shrink-0"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function TagsView({
  tags,
  tagInput,
  onTagInputChange,
  onAddTag,
  onRemoveTag,
  onBack,
}: {
  tags: string[]
  tagInput: string
  onTagInputChange: (v: string) => void
  onAddTag: () => void
  onRemoveTag: (tag: string) => void
  onBack: () => void
}) {
  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Back"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold">Tags</span>
      </div>

      {/* Applied tags */}
      <div className="px-4 pb-2">
        <p className="mb-2 text-xs text-muted-foreground">Tags applied</p>
        {tags.length === 0 ? (
          <p className="py-2 text-sm text-muted-foreground">No tags yet</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground"
              >
                <Hash className="size-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => onRemoveTag(tag)}
                  className="ml-0.5 flex size-4 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Add tag input */}
      <div className="px-4 pb-4 pt-2">
        <Input
          value={tagInput}
          onChange={(e) => onTagInputChange(e.target.value)}
          placeholder="Add a tag and press Enter..."
          className="h-9"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              onAddTag()
            }
          }}
        />
      </div>
    </div>
  )
}
