'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faMapMarkerAlt, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { Drill } from '@/types/drill';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Header from '@/components/Header';

export default function DrillPage() {
  const params = useParams();
  const router = useRouter();
  const [drill, setDrill] = useState<Drill | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    fetchDrill();
  }, [params.id]);

  const fetchDrill = async () => {
    if (!params.id || typeof params.id !== 'string') return;
    
    try {
      const docRef = doc(db, 'drills', params.id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setDrill({
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate(),
          updatedAt: docSnap.data().updatedAt?.toDate()
        } as Drill);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error fetching drill:', error);
      router.push('/');
    } finally {
      setLoading(false);
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

  const nextImage = () => {
    if (drill?.images && currentImageIndex < drill.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">טוען...</div>
        </div>
      </div>
    );
  }

  if (!drill) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">תרגיל לא נמצא</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto p-4">
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="btn-secondary flex items-center gap-2 mb-4"
          >
            <FontAwesomeIcon icon={faArrowRight} />
            חזור לרשימת התרגילים
          </button>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">{drill.name}</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-700">טכניקות קרביות</h3>
                  <div className="flex flex-wrap gap-2">
                    {drill.techniques.map(technique => (
                      <span
                        key={technique}
                        className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {technique}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-700">תוואי שטח</h3>
                  <div className="flex flex-wrap gap-2">
                    {drill.terrains.map(terrain => (
                      <span
                        key={terrain}
                        className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        {terrain}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3 text-red-700">פרטי התרגיל</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="text-red-600" />
                      <span className="font-medium">אזור:</span>
                      <span className="text-lg">{drill.region}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium">דרגת קושי:</span>
                      <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold ${getDifficultyColor(drill.difficulty)}`}>
                        {drill.difficulty}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3 text-red-700">תיאור התרגיל</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-lg">{drill.description}</p>
                </div>
              </div>
            </div>

            {drill.images && drill.images.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-semibold mb-4 text-red-700">תמונות</h3>
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative">
                    <img
                      src={drill.images[currentImageIndex].url}
                      alt={drill.images[currentImageIndex].title}
                      className="w-full h-96 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-image.svg';
                      }}
                    />
                    
                    {drill.images.length > 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          disabled={currentImageIndex === 0}
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 hover:bg-opacity-70"
                        >
                          <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button
                          onClick={nextImage}
                          disabled={currentImageIndex === drill.images.length - 1}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full disabled:opacity-30 hover:bg-opacity-70"
                        >
                          <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                      </>
                    )}
                    
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-3">
                      <h4 className="text-lg font-medium text-center">{drill.images[currentImageIndex].title}</h4>
                    </div>
                  </div>
                  
                  {drill.images.length > 1 && (
                    <div className="p-4 bg-gray-50 border-t">
                      <div className="flex justify-center gap-2">
                        {drill.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? 'bg-red-600' : 'bg-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-center mt-2 text-sm text-gray-600">
                        {currentImageIndex + 1} מתוך {drill.images.length}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}