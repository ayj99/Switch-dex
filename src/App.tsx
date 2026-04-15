/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import Portal from './Portal';
import Shop from './Shop';
import Rental from './Rental';

export default function App() {
  const [view, setView] = useState<'portal' | 'shop' | 'rental'>('portal');

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-gray-900 overflow-x-hidden">
      <AnimatePresence mode="wait">
        {view === 'portal' && (
          <motion.div
            key="portal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Portal onNavigate={setView} />
          </motion.div>
        )}
        {view === 'shop' && (
          <motion.div
            key="shop"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Shop onBackToPortal={() => setView('portal')} />
          </motion.div>
        )}
        {view === 'rental' && (
          <motion.div
            key="rental"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Rental onBack={() => setView('portal')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
