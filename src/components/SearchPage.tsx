import { useState, useEffect, useRef } from "react";
import { IonPage, IonContent } from '@ionic/react';
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiClock, FiArrowRight, FiLoader } from "react-icons/fi";
import { supabase } from "../lib/supabaseClient";
import HistorySidebar from "./HistorySidebar";
import { Keyboard } from '@capacitor/keyboard';
import { useHaptics } from "../hooks/useHaptics";
import axios from "axios";
import config from "../config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const SearchPage = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [currentTopicIndex, setCurrentTopicIndex] = useState(0);
  const [topicDetails, setTopicDetails] = useState<string>("");
  const [loadingText, setLoadingText] = useState("Understanding search...");
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [placeholder, setPlaceholder] = useState("");
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const placeholders = [
    "Polity",
    "Geopolitics",
    "Geography",
    "History",
    "Economy",
    "Environment",
    "International Relations",
    "Indian Society",
    "Science and Technology",
    "Disaster Management",
    "Internal Security",
    "Ethics, Integrity, and Aptitude",
  ];
  const [typingIndex, setTypingIndex] = useState(Math.floor(Math.random() * placeholders.length));
  const [charIndex, setCharIndex] = useState(0);
  const [blinker, setBlinker] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [examType, setExamType] = useState("");
  const { triggerHaptic } = useHaptics();

  useEffect(() => {
    if (isFocused) return;
    const type = () => {
      const currentPhrase = placeholders[typingIndex];
      if (charIndex < currentPhrase.length) {
        setPlaceholder(currentPhrase.substring(0, charIndex + 1));
        setCharIndex(charIndex + 1);
        triggerHaptic();
      } else {
        setTimeout(() => {
          setCharIndex(0);
          setTypingIndex((typingIndex + 1) % placeholders.length);
        }, 1000);
      }
    };

    const typingTimeout = setTimeout(type, 100);
    return () => clearTimeout(typingTimeout);
  }, [charIndex, typingIndex, isFocused]);

  useEffect(() => {
    const blinkerTimeout = setInterval(() => {
      setBlinker((prev) => !prev);
    }, 500);
    return () => clearInterval(blinkerTimeout);
  }, []);

  useEffect(() => {
    if (loading && relatedTopics.length > 0) {
      const interval = setInterval(() => {
        setCurrentTopicIndex((prevIndex) => (prevIndex + 1) % relatedTopics.length);
      }, 2000);
      return () => clearInterval(interval);
    } else if (loading) {
      const loadingTexts = [
        "Understanding search...",
        "Going through the books...",
        "Consulting the experts...",
        "Checking the archives...",
        "Analyzing the patterns...",
        "Connecting the dots...",
        "Building the context...",
      ];
      const interval = setInterval(() => {
        setLoadingText(loadingTexts[Math.floor(Math.random() * loadingTexts.length)]);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading, relatedTopics]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      searchContainerRef.current &&
      !searchContainerRef.current.contains(event.target as Node)
    ) {
      if (searchQuery.trim() === "") {
        setIsFocused(false);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setIsFocused(false);
    });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      keyboardDidHideListener.then(listener => listener.remove());
    };
  }, [searchQuery]);

  useEffect(() => {
    const fetchSearchHistory = async () => {
      const { data, error } = await supabase
        .from("search_history")
        .select("query")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching search history:", error);
      } else {
        setSearchHistory(data.map((item: any) => item.query));
      }
    };

    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('exam').eq('id', user.id).single();
        setExamType(profile?.exam);
      }
    };

    fetchSearchHistory();
    fetchUserProfile();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() === "") return;

    setLoading(true);
    setRelatedTopics([]);
    setTopicDetails("");

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      
      const relatedPromise = axios.get(`${config.API_BASE_URL}/search/related`, {
        params: { query: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setRelatedTopics(res.data);
        return res.data;
      });

      const topicPromise = axios.get(`${config.API_BASE_URL}/search/topic`, {
        params: { topic: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });

      const [, topicResponse] = await Promise.all([relatedPromise, topicPromise]);
      
      setTopicDetails(topicResponse.data.details);

    } catch (error) {
      console.error("Error fetching search data:", error);
    } finally {
      setLoading(false);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("search_history")
      .insert([{ query: searchQuery, user_id: user.id }]);

    if (error) {
      console.error("Error saving search history:", error);
    } else {
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory([searchQuery, ...searchHistory]);
      }
    }
  };

  const handleClearHistory = async () => {
    // This will delete all rows. If you have users, you should filter by user_id.
    const { error } = await supabase.from("search_history").delete().neq("id", -1);
    if (error) {
      console.error("Error clearing search history:", error);
    } else {
      setSearchHistory([]);
    }
  };

  return (
    <IonPage>
      <IonContent>
        <div
          className={`min-h-screen bg-gray-50 p-4 flex flex-col items-center transition-all duration-500 ease-in-out ${
            isFocused ? "justify-start pt-10" : "justify-center"
          }`}
        >
          <motion.div layout className="w-full max-w-md" ref={searchContainerRef}>
        <AnimatePresence>
          {!isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center mb-6"
            >
              <h1 className="text-4xl font-bold text-gray-800">
                PrepBit Search
              </h1>
              <p className="text-gray-500 mt-2">What are we learning today?</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSearch} className="relative w-full">
          <motion.div layout className="relative flex items-center">
            <FiSearch className="absolute left-4 text-gray-400 text-2xl pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isFocused ? "" : placeholder + (blinker ? "|" : "")}
              className="w-full p-4 pl-12 pr-12 text-lg border-2 border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <div className="absolute right-4 flex items-center">
              <AnimatePresence>
                {isFocused ? (
                  <motion.button
                    type="submit"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    className="text-gray-400"
                  >
                    <FiArrowRight className="text-2xl" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={() => {
                      triggerHaptic();
                      setIsHistoryOpen(true);
                    }}
                    className="text-gray-400"
                  >
                    <FiClock className="text-2xl" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </form>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4"
            >
              <FiLoader className="animate-spin text-2xl text-gray-500 mx-auto" />
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTopicIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-center mt-2"
                >
                  {relatedTopics.length > 0 ? `going through ${relatedTopics[currentTopicIndex]}` : loadingText}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {topicDetails && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-4 w-full max-w-md"
            >
              <div className="prose max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, ...props }) => <table className="w-full border-collapse border border-gray-300" {...props} />,
                    th: ({ node, ...props }) => <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />,
                    td: ({ node, ...props }) => <td className="border border-gray-300 px-4 py-2" {...props} />,
                    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-4" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold my-3" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-lg font-bold my-2" {...props} />,
                  }}
                >
                  {topicDetails}
                </ReactMarkdown>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {isHistoryOpen && (
          <HistorySidebar
            history={searchHistory}
            onClose={() => setIsHistoryOpen(false)}
            onClearHistory={handleClearHistory}
          />
        )}
      </AnimatePresence>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SearchPage;
