'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import DrillTable from '@/components/DrillTable';
import DrillView from '@/components/DrillView';
import DrillForm from '@/components/DrillForm';
import { Drill, Config } from '@/types/drill';
import configData from '@/data/config.json';

export default function Home() {
  const [selectedDrill, setSelectedDrill] = useState<Drill | null>(null);
  const [editingDrill, setEditingDrill] = useState<Drill | null>(null);
  const [showDrillForm, setShowDrillForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [config] = useState<Config>(configData);

  const handleViewDrill = (drill: Drill) => {
    setSelectedDrill(drill);
  };

  const handleEditDrill = (drill: Drill) => {
    setEditingDrill(drill);
    setShowDrillForm(true);
  };

  const handleAddDrill = () => {
    setEditingDrill(null);
    setShowDrillForm(true);
  };

  const handleSaveDrill = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleCloseForms = () => {
    setSelectedDrill(null);
    setEditingDrill(null);
    setShowDrillForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onAddDrill={handleAddDrill} />
      
      <main className="py-6">
        <DrillTable
          onViewDrill={handleViewDrill}
          onEditDrill={handleEditDrill}
          config={config}
          refreshTrigger={refreshTrigger}
        />
      </main>

      {selectedDrill && (
        <DrillView
          drill={selectedDrill}
          onClose={handleCloseForms}
        />
      )}

      {showDrillForm && (
        <DrillForm
          drill={editingDrill || undefined}
          config={config}
          onClose={handleCloseForms}
          onSave={handleSaveDrill}
        />
      )}
    </div>
  );
}
