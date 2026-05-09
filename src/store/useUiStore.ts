import { create } from 'zustand';

interface UiState {
  inspectorOpen: boolean;
  selectedItemId: string | null;
  openInspector: (id: string) => void;
  closeInspector: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  inspectorOpen: false,
  selectedItemId: null,
  openInspector: (id) => set({ inspectorOpen: true, selectedItemId: id }),
  closeInspector: () => set({ inspectorOpen: false, selectedItemId: null }),
}));
