import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { IonContent, IonPage, IonIcon } from '@ionic/react';
import { search, arrowForward } from 'ionicons/icons';
import config from '../config';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadAll } from '@tsparticles/all';
import { useHaptics } from '../hooks/useHaptics';

const StarryBackground = memo(() => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadAll(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const options = useMemo(
    () => ({
      fullScreen: false,
      background: { color: "#000000" },
      particles: {
        number: {
          value: 100,
          density: {
            enable: true,
            width: 800,
            height: 800,
          },
        },
        color: { value: "#ffffff" },
        shape: { type: "circle" as const },
        opacity: { value: 0.8 },
        size: { value: { min: 0.5, max: 2 } },
        move: {
          enable: true,
          speed: 0.15,
          direction: "none" as const,
          outModes: { default: "out" as const },
        },
      },
      detectRetina: true,
    }),
    [],
  );

  if (!init) {
    return null;
  }

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 z-0 w-full h-full"
      options={options}
    />
  );
});

const BacktrackPage = () => {
  const { triggerHaptic, triggerRefreshHaptic } = useHaptics();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSwiped, setHasSwiped] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleSearch = async () => {
    triggerHaptic();
    if (!query.trim()) return;
    setIsLoading(true);
    const searchUrl = `${config.API_BASE_URL}/vector-search?query=${encodeURIComponent(query)}`;
    try {
      const response = await fetch(searchUrl);
      const data = await response.json();
      setResults(data);
      triggerRefreshHaptic();
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent
        fullscreen
        scroll-y="false"
        className="relative !bg-black text-white"
        style={{ '--background': '#000000', overflow: 'hidden' }}
      >
        <StarryBackground />
        <motion.div
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
          className="relative z-10 flex flex-col items-center justify-center h-full text-white p-4"
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold tracking-tighter">Backtrack</h1>
            <p className="text-lg text-gray-400 mt-2">
              Search for topics and discover how questions have been asked before.
            </p>
          </motion.div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="relative">
              <input
                type="text"
                value={query}
                onClick={triggerHaptic}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter your search term..."
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-full py-3 pl-6 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 rounded-full p-2 transition-colors"
                disabled={isLoading}
              >
                <IonIcon icon={search} className="text-white text-xl" />
              </button>
            </div>
          </motion.div>

          <div className="mt-8 w-full max-w-md  h-96 flex items-center justify-center">
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {results.map((result: any, index: number) => (
  <motion.div
    key={result.question_text}
    drag="x"
    dragConstraints={{ left: 0, right: 0 }}
    onDragEnd={(_, info) => {
      if (info.offset.x > 100) {
        triggerHaptic();
        setResults(results.slice(1));
        if (!hasSwiped) setHasSwiped(true);
      }
    }}
    initial={{ scale: 1, y: 0, rotate: 0 }}
    animate={
      expandedCard === result.question_text
        ? { scale: 1.2, y: -40, zIndex: 40 }
        : {
            scale: 1 - Math.min(index, 3) * 0.05,
            y: index * 10,
            zIndex: results.length - index,
          }
    }
    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    className={`absolute w-full bg-gray-900/70 p-8 rounded-3xl border border-gray-700 shadow-2xl cursor-grab active:cursor-grabbing ${
      expandedCard === result.question_text
        ? 'z-40 h-full overflow-y-auto'
        : 'h-auto max-h-full backdrop-blur-sm overflow-hidden'
    }`}
    style={{
      transformOrigin: 'bottom center',
    }}
    onClick={() => {
      if (index === 0) {
        if (expandedCard === result.question_text) {
          setExpandedCard(null);
        } else {
          setExpandedCard(result.question_text);
        }
      }
    }}
  >
    {result.question_type === 'MCQ' ? (
      <div>
        <p className="text-gray-200 text-lg leading-relaxed">{result.stem}</p>
        <div className="mt-4 space-y-2">
          {Object.entries(result.options).map(([key, value]) => (
            <div key={key} className="flex items-center">
              <span className="text-gray-400 mr-2">{key}.</span>
              <p className="text-gray-300">{value as string}</p>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <p className="text-gray-200 text-lg leading-relaxed">{result.question_text}</p>
    )}
    <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
      <span>{result.exam_type} - {result.paper} - {result.question_type}</span>
      <span>{result.year?.$numberInt || result.year}</span>
    </div>
  </motion.div>
))}

              </div>
            )}
            {!isLoading && results.length > 0 && !hasSwiped && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center"
              >
                <span className="text-sm text-gray-400 animate-pulse">Swipe for next</span>
                <IonIcon icon={arrowForward} className="text-gray-400 text-2xl animate-bounce mt-1" />
              </motion.div>
            )}
          </div>
        </motion.div>
      </IonContent>
    </IonPage>
  );
};

export default BacktrackPage;
