import { useState } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import KeywordDrawer from './KeywordDrawer';
import config from '../config';

interface KeywordProps {
  keyword: string;
  article: any;
  children: React.ReactNode;
}

const Keyword = ({ keyword, article, children }: KeywordProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchKeywordData = async () => {
    setIsDrawerOpen(true);
    if (content) {
      return;
    }
    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await axios.post(
        `${config.API_BASE_URL}/keyword`,
        { keyword, topic: article.title, summary: article.summary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent(response.data);
      setIsDrawerOpen(true);
    } catch (error) {
      console.error('Error fetching keyword data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <span
        className="text-black font-semibold cursor-pointer underline decoration-solid"
        onClick={fetchKeywordData}
      >
        {children}
      </span>
      <KeywordDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        keyword={keyword}
        content={content}
        loading={loading}
      />
    </>
  );
};

export default Keyword;
