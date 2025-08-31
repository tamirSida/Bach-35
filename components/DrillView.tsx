'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { Drill } from '@/types/drill';

interface DrillViewProps {
  drill: Drill;
  onClose: () => void;
}

export default function DrillView({ drill, onClose }: DrillViewProps) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2"
          >
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">{drill.name}</h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">טכניקות קרביות</h3>
                <div className="flex flex-wrap gap-2">
                  {drill.techniques.map(technique => (
                    <span
                      key={technique}
                      className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {technique}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">תוואי שטח</h3>
                <div className="flex flex-wrap gap-2">
                  {drill.terrains.map(terrain => (
                    <span
                      key={terrain}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {terrain}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-700">פרטי התרגיל</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-600" />
                    <span className="font-medium">אזור:</span>
                    <span>{drill.region}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">דרגת קושי:</span>
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm ${getDifficultyColor(drill.difficulty)}`}>
                      {drill.difficulty}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-red-700">תיאור התרגיל</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{drill.description}</p>
            </div>
          </div>

          {drill.images && drill.images.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 text-red-700">תמונות</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {drill.images.map((image, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.svg';
                      }}
                    />
                    <div className="p-2 bg-gray-50">
                      <p className="text-sm text-gray-700 text-center">{image.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}