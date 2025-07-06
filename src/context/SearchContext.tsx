import React, { createContext, useState, useContext } from 'react';

interface SearchState {
  searchQuery: string;
  relatedTopics: string[];
  topicDetails: string;
  loading: boolean;
}

interface SearchContextType extends SearchState {
  setSearchQuery: (query: string) => void;
  setRelatedTopics: (topics: string[]) => void;
  setTopicDetails: (details: string) => void;
  setLoading: (loading: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [relatedTopics, setRelatedTopics] = useState<string[]>([]);
  const [topicDetails, setTopicDetails] = useState<string>("");
  const [loading, setLoading] = useState(false);

  return (
    <SearchContext.Provider value={{
      searchQuery,
      setSearchQuery,
      relatedTopics,
      setRelatedTopics,
      topicDetails,
      setTopicDetails,
      loading,
      setLoading
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
