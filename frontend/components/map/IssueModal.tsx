"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, AlertTriangle, Info, Shield, TreePine } from 'lucide-react';
import { useIssueStore, IssueCategory } from '@/lib/store/useIssueStore';
import { stateCities } from '@/lib/data/stateCities';
import { toast } from 'react-toastify';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Legacy
  selectedState?: string | null;
  // Multi-level
  selectedCity?: string | null;
  selectedTown?: string | null;
  pinCoords?: { x: number; y: number } | null;
}

const categories: { name: IssueCategory; icon: any; color: string; bg: string; border: string }[] = [
  { name: 'Infrastructure', icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { name: 'Sanitation', icon: AlertTriangle, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { name: 'Safety', icon: Shield, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
  { name: 'Greenery', icon: TreePine, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/30' },
];

const IssueModal: React.FC<IssueModalProps> = ({
  isOpen, onClose, selectedState, selectedCity, selectedTown, pinCoords
}) => {
  const { addIssue } = useIssueStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Infrastructure');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const locationLabel = [selectedState, selectedCity, selectedTown].filter(Boolean).join(' › ');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !selectedState) {
      toast.error('Please fill all fields');
      return;
    }
    setIsSubmitting(true);

    // Derive latlng from city coordinates in stateCities
    let latlng: { lat: number; lng: number } | undefined;
    if (selectedCity && stateCities[selectedState]) {
      const cityData = stateCities[selectedState].find(c => c.name === selectedCity);
      if (cityData) latlng = { lat: cityData.lat, lng: cityData.lng };
    }
    console.log('[IssueModal] latlng:', latlng);
    console.log('[IssueModal] pinCoords:', pinCoords);

    try {
      await addIssue({
        title,
        description,
        category,
        location: selectedState,
        state: selectedState,
        city: selectedCity || undefined,
        town: selectedTown || undefined,
        pinX: pinCoords?.x,
        pinY: pinCoords?.y,
        latlng,
        status: 'New',
        votes: 0,
      });
      toast.success('Issue reported successfully!');
      onClose();
      setTitle('');
      setDescription('');
    } catch {
      toast.error('Failed to report issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700"
          >
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-500" size={20} />
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Report Issue</h3>
                  {locationLabel && (
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{locationLabel}</p>
                  )}
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Pothole on Main Road"
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Category</label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setCategory(cat.name)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all text-left ${
                        category === cat.name
                          ? `${cat.bg} ${cat.border} ring-1 ${cat.border}`
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900'
                      }`}
                    >
                      <cat.icon size={16} className={cat.color} />
                      <span className={`text-xs font-semibold ${category === cat.name ? cat.color : 'text-slate-600 dark:text-slate-300'}`}>
                        {cat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the issue in detail..."
                  rows={3}
                  className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-sm"
                />
              </div>

              {pinCoords && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                    Pin placed at ({Math.round(pinCoords.x)}, {Math.round(pinCoords.y)})
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : 'Submit Report'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default IssueModal;
