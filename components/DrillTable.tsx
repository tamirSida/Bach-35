'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faEye, faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import MultiSelectFilter from '@/components/MultiSelectFilter';
import { Drill, Config } from '@/types/drill';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

interface DrillTableProps {
  onViewDrill: (drill: Drill) => void;
  onEditDrill?: (drill: Drill) => void;
  config: Config;
  refreshTrigger?: number;
}

export default function DrillTable({ onViewDrill, onEditDrill, config, refreshTrigger }: DrillTableProps) {
  const [drills, setDrills] = useState<Drill[]>([]);
  const [filteredDrills, setFilteredDrills] = useState<Drill[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    techniques: [] as string[],
    terrains: [] as string[],
    regions: [] as string[],
    difficulties: [] as string[]
  });
  const [user] = useAuthState(auth);

  useEffect(() => {
    fetchDrills();
  }, [refreshTrigger]);

  useEffect(() => {
    applyFilters();
  }, [drills, searchTerm, filters]);

  const fetchDrills = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'drills'));
      const drillsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      })) as Drill[];
      setDrills(drillsData);
    } catch (error) {
      console.error('Error fetching drills:', error);
    }
  };

  const applyFilters = () => {
    let filtered = drills;

    if (searchTerm) {
      filtered = filtered.filter(drill =>
        drill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drill.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.techniques.length > 0) {
      filtered = filtered.filter(drill =>
        filters.techniques.some(technique => drill.techniques.includes(technique))
      );
    }

    if (filters.terrains.length > 0) {
      filtered = filtered.filter(drill =>
        filters.terrains.some(terrain => drill.terrains.includes(terrain))
      );
    }

    if (filters.regions.length > 0) {
      filtered = filtered.filter(drill => 
        filters.regions.includes(drill.region)
      );
    }

    if (filters.difficulties.length > 0) {
      filtered = filtered.filter(drill => 
        filters.difficulties.includes(drill.difficulty.toString())
      );
    }

    setFilteredDrills(filtered);
  };

  const getAvailableOptions = () => {
    let baseFilteredDrills = drills;

    if (searchTerm) {
      baseFilteredDrills = baseFilteredDrills.filter(drill =>
        drill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        drill.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const availableTechniques = new Set<string>();
    const availableTerrains = new Set<string>();
    const availableRegions = new Set<string>();
    const availableDifficulties = new Set<string>();

    baseFilteredDrills.forEach(drill => {
      const matchesTerrains = filters.terrains.length === 0 || 
        filters.terrains.some(terrain => drill.terrains.includes(terrain));
      const matchesRegions = filters.regions.length === 0 || 
        filters.regions.includes(drill.region);
      const matchesDifficulties = filters.difficulties.length === 0 || 
        filters.difficulties.includes(drill.difficulty.toString());

      if (matchesTerrains && matchesRegions && matchesDifficulties) {
        drill.techniques.forEach(t => availableTechniques.add(t));
      }

      const matchesTechniques = filters.techniques.length === 0 || 
        filters.techniques.some(technique => drill.techniques.includes(technique));

      if (matchesTechniques && matchesRegions && matchesDifficulties) {
        drill.terrains.forEach(t => availableTerrains.add(t));
      }

      if (matchesTechniques && matchesTerrains && matchesDifficulties) {
        availableRegions.add(drill.region);
      }

      if (matchesTechniques && matchesTerrains && matchesRegions) {
        availableDifficulties.add(drill.difficulty.toString());
      }
    });

    return {
      techniques: Array.from(availableTechniques),
      terrains: Array.from(availableTerrains),
      regions: Array.from(availableRegions),
      difficulties: Array.from(availableDifficulties)
    };
  };

  const availableOptions = getAvailableOptions();

  const handleDelete = async (drillId: string) => {
    if (!user || !drillId) return;
    
    if (confirm('האם אתה בטוח שברצונך למחוק תרגיל זה?')) {
      try {
        await deleteDoc(doc(db, 'drills', drillId));
        fetchDrills();
      } catch (error) {
        console.error('Error deleting drill:', error);
      }
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-yellow-400', 
      3: 'bg-orange-400',
      4: 'bg-red-400',
      5: 'bg-red-600'
    };
    return colors[difficulty as keyof typeof colors];
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <FontAwesomeIcon icon={faSearch} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10" />
            <input
              type="text"
              placeholder="חיפוש תרגילים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pr-10 border border-gray-300 rounded text-right bg-white hover:border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MultiSelectFilter
            label="טכניקות"
            options={availableOptions.techniques}
            selectedValues={filters.techniques}
            onSelectionChange={(techniques) => setFilters({...filters, techniques})}
            placeholder="כל הטכניקות"
          />

          <MultiSelectFilter
            label="תוואי שטח"
            options={availableOptions.terrains}
            selectedValues={filters.terrains}
            onSelectionChange={(terrains) => setFilters({...filters, terrains})}
            placeholder="כל התוואי"
          />

          <MultiSelectFilter
            label="אזורים"
            options={availableOptions.regions}
            selectedValues={filters.regions}
            onSelectionChange={(regions) => setFilters({...filters, regions})}
            placeholder="כל האזורים"
          />

          <MultiSelectFilter
            label="דרגות קושי"
            options={availableOptions.difficulties.sort().map(d => `דרגה ${d}`)}
            selectedValues={filters.difficulties.map(d => `דרגה ${d}`)}
            onSelectionChange={(difficulties) => setFilters({...filters, difficulties: difficulties.map(d => d.replace('דרגה ', ''))})}
            placeholder="כל הדרגות"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="table-header">
              <tr>
                <th className="p-4 text-right font-semibold">שם התרגיל</th>
                <th className="p-4 text-right font-semibold">טכניקות</th>
                <th className="p-4 text-right font-semibold">תוואי שטח</th>
                <th className="p-4 text-right font-semibold">אזור</th>
                <th className="p-4 text-right font-semibold">דרגת קושי</th>
                <th className="p-4 text-right font-semibold">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrills.map((drill) => (
                <tr key={drill.id} className="table-row border-t cursor-pointer" onClick={() => onViewDrill(drill)}>
                  <td className="p-4 font-medium">{drill.name}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {drill.techniques.slice(0, 2).map(technique => (
                        <span
                          key={technique}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {technique}
                        </span>
                      ))}
                      {drill.techniques.length > 2 && (
                        <span className="text-gray-500 text-xs">+{drill.techniques.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {drill.terrains.slice(0, 2).map(terrain => (
                        <span
                          key={terrain}
                          className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                        >
                          {terrain}
                        </span>
                      ))}
                      {drill.terrains.length > 2 && (
                        <span className="text-gray-500 text-xs">+{drill.terrains.length - 2}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">{drill.region}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${getDifficultyColor(drill.difficulty)}`}>
                      {drill.difficulty}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onViewDrill(drill)}
                        className="btn-icon text-blue-600 hover:text-blue-800"
                        title="צפה בתרגיל"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                      {user && onEditDrill && (
                        <>
                          <button
                            onClick={() => onEditDrill(drill)}
                            className="btn-icon text-green-600 hover:text-green-800"
                            title="ערוך תרגיל"
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button
                            onClick={() => drill.id && handleDelete(drill.id)}
                            className="btn-icon text-red-600 hover:text-red-800"
                            title="מחק תרגיל"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDrills.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            לא נמצאו תרגילים התואמים לחיפוש
          </div>
        )}
      </div>
    </div>
  );
}