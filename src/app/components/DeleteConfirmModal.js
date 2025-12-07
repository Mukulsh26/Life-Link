"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function DeleteConfirmModal({ open, onClose, onConfirm }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm shadow-xl"
          >
            <h2 className="text-xl font-semibold text-red-400 mb-3">
              Confirm Delete
            </h2>

            <p className="text-slate-300 text-sm mb-6">
              Are you sure you want to delete this request?  
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-600 hover:bg-slate-800 transition"
              >
                Cancel
              </button>

              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 transition text-white shadow-md shadow-red-900/30"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
