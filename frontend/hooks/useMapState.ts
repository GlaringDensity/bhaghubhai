import { create } from 'zustand';

export type MapLevel = 'india' | 'state' | 'city' | 'town';

interface MapNavStore {
  level: MapLevel;
  selectedState: string | null;
  selectedCity: string | null;
  selectedTown: string | null;
  defaultViewBox: string;
  currentViewBox: string;

  setDefaultViewBox: (vb: string) => void;
  selectState: (state: string, zoomedViewBox: string) => void;
  selectCity: (city: string) => void;
  selectTown: (town: string) => void;
  goBack: () => void;
  reset: () => void;
}

export const useMapNav = create<MapNavStore>((set, get) => ({
  level: 'india',
  selectedState: null,
  selectedCity: null,
  selectedTown: null,
  defaultViewBox: '0 0 1000 1000',
  currentViewBox: '0 0 1000 1000',

  setDefaultViewBox: (vb) => set({ defaultViewBox: vb, currentViewBox: vb }),

  selectState: (state, zoomedViewBox) =>
    set({ level: 'state', selectedState: state, currentViewBox: zoomedViewBox, selectedCity: null, selectedTown: null }),

  selectCity: (city) =>
    set({ level: 'city', selectedCity: city, selectedTown: null }),

  selectTown: (town) =>
    set({ level: 'town', selectedTown: town }),

  goBack: () => {
    const { level, defaultViewBox } = get();
    if (level === 'state') set({ level: 'india', selectedState: null, currentViewBox: defaultViewBox });
    else if (level === 'city') set({ level: 'state', selectedCity: null });
    else if (level === 'town') set({ level: 'city', selectedTown: null });
  },

  reset: () =>
    set({ level: 'india', selectedState: null, selectedCity: null, selectedTown: null, currentViewBox: get().defaultViewBox }),
}));
