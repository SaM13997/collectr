import { create } from 'zustand';

interface UiState {
  inspectorOpen: boolean;
  selectedItemId: string | null;
  openInspector: (id: string) => void;
  closeInspector: () => void;

  selectionMode: boolean;
  selectedIds: Set<string>;
  enterSelectionMode: () => void;
  exitSelectionMode: () => void;
  toggleSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  clearSelection: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  inspectorOpen: false,
  selectedItemId: null,
  openInspector: (id) => set({ inspectorOpen: true, selectedItemId: id }),
  closeInspector: () => set({ inspectorOpen: false, selectedItemId: null }),

  selectionMode: false,
  selectedIds: new Set(),
  enterSelectionMode: () => set({ selectionMode: true }),
  exitSelectionMode: () => set({ selectionMode: false, selectedIds: new Set() }),
  toggleSelection: (id) =>
    set((state) => {
      const next = new Set(state.selectedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      if (next.size === 0) {
        return { selectedIds: next, selectionMode: false };
      }
      return { selectedIds: next };
    }),
  selectAll: (ids) =>
    set({ selectedIds: new Set(ids), selectionMode: true }),
  clearSelection: () => set({ selectedIds: new Set(), selectionMode: false }),
}));
