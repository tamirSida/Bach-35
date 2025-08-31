'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Drill, Config } from '@/types/drill';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface DrillFormProps {
  drill?: Drill;
  config: Config;
  onClose: () => void;
  onSave: () => void;
}

export default function DrillForm({ drill, config, onClose, onSave }: DrillFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    techniques: [] as string[],
    terrains: [] as string[],
    region: '',
    difficulty: 1 as 1 | 2 | 3 | 4 | 5,
    description: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (drill) {
      setFormData({
        name: drill.name,
        techniques: drill.techniques,
        terrains: drill.terrains,
        region: drill.region,
        difficulty: drill.difficulty,
        description: drill.description,
        images: drill.images || []
      });
    }
  }, [drill]);

  const handleTechniqueToggle = (technique: string) => {
    setFormData(prev => ({
      ...prev,
      techniques: prev.techniques.includes(technique)
        ? prev.techniques.filter(t => t !== technique)
        : [...prev.techniques, technique]
    }));
  };

  const handleTerrainToggle = (terrain: string) => {
    setFormData(prev => ({
      ...prev,
      terrains: prev.terrains.includes(terrain)
        ? prev.terrains.filter(t => t !== terrain)
        : [...prev.terrains, terrain]
    }));
  };

  const handleAddImage = () => {
    const imagePath = prompt('הכנס נתיב לתמונה (מתוך תיקיית public):');
    if (imagePath) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imagePath]
      }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || formData.techniques.length === 0 || formData.terrains.length === 0) {
      alert('יש למלא את כל השדות הנדרשים');
      return;
    }

    try {
      if (drill?.id) {
        await updateDoc(doc(db, 'drills', drill.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'drills'), {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving drill:', error);
      alert('שגיאה בשמירת התרגיל');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">
            {drill ? 'עריכת תרגיל' : 'תרגיל חדש'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">שם התרגיל *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded text-right"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">אזור *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded text-right"
                  required
                >
                  <option value="">בחר אזור</option>
                  {config.regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">דרגת קושי *</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData(prev => ({ ...prev, difficulty: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 }))}
                  className="w-full p-3 border border-gray-300 rounded text-right"
                  required
                >
                  <option value={1}>דרגה 1</option>
                  <option value={2}>דרגה 2</option>
                  <option value={3}>דרגה 3</option>
                  <option value={4}>דרגה 4</option>
                  <option value={5}>דרגה 5</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">טכניקות קרביות *</label>
                <div className="border border-gray-300 rounded p-3 max-h-32 overflow-y-auto">
                  {config.techniques.map(technique => (
                    <label key={technique} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.techniques.includes(technique)}
                        onChange={() => handleTechniqueToggle(technique)}
                        className="ml-2"
                      />
                      <span className="text-sm">{technique}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">תוואי שטח *</label>
                <div className="border border-gray-300 rounded p-3 max-h-32 overflow-y-auto">
                  {config.terrains.map(terrain => (
                    <label key={terrain} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.terrains.includes(terrain)}
                        onChange={() => handleTerrainToggle(terrain)}
                        className="ml-2"
                      />
                      <span className="text-sm">{terrain}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">תיאור התרגיל *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded text-right"
              placeholder="תאר את התרגיל בפירוט..."
              required
            />
          </div>

          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                onClick={handleAddImage}
                className="btn-primary flex items-center gap-2"
              >
                <FontAwesomeIcon icon={faPlus} />
                הוסף תמונה
              </button>
              <label className="text-sm font-medium">תמונות</label>
            </div>
            
            {formData.images.length > 0 && (
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded p-3">
                {formData.images.map((imagePath, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                    <span className="text-sm text-gray-700 flex-1 text-right mr-3">{imagePath}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-end mt-8 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
            >
              ביטול
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2"
            >
              {drill ? 'עדכן תרגיל' : 'שמור תרגיל'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}