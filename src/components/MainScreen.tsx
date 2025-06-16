import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';

interface MainScreenProps {
  examType: string;
}

const MainScreen = ({ examType }: MainScreenProps) => {
  const [summaries, setSummaries] = useState<any[]>([]);

  const fetchSummaries = useCallback(async () => {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const response = await axios.get('https://civil-service-backend.fly.dev/api/summaries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = response.data;
      const summariesArray = Array.isArray(data) ? data : [data];
      localStorage.setItem('summaries', JSON.stringify(summariesArray));
      setSummaries(summariesArray);
    } catch (error) {
      console.error('Error fetching summaries:', error);
      const cachedSummaries = localStorage.getItem('summaries');
      if (cachedSummaries) {
        const parsedSummaries = JSON.parse(cachedSummaries);
        setSummaries(Array.isArray(parsedSummaries) ? parsedSummaries : [parsedSummaries]);
      }
    }
  }, []);

  useEffect(() => {
    if (examType) {
      fetchSummaries();
    }
  }, [examType, fetchSummaries]);

  const renderContent = (summary: any) => {
    const formatText = (text: string) => {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    if (examType === 'UPSC') {
      return (
        <div>
          {summary.multi_dimensional_analysis.economic.map((item: any, index: number) => (
            <p key={index} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(`**${item.point}**: ${item.details}`) }} />
          ))}
          {summary.multi_dimensional_analysis.environmental.map((item: any, index: number) => (
            <p key={index} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(`**${item.point}**: ${item.details}`) }} />
          ))}
          {summary.multi_dimensional_analysis.geopolitical.map((item: any, index: number) => (
            <p key={index} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(`**${item.point}**: ${item.details}`) }} />
          ))}
          {summary.constitutional_linkages.map((item: any, index: number) => (
            <p key={index} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(`**${item.article}**: ${item.relevance}`) }} />
          ))}
          {summary.schemes.map((item: any, index: number) => (
            <p key={index} className="text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: formatText(`**${item.name}**: ${item.linkage}`) }} />
          ))}
        </div>
      );
    } else if (examType === 'SSC CGL') {
      return <p className="text-base leading-relaxed">{summary.one_liner}</p>;
    }
    return <p className="text-base leading-relaxed">{summary.one_liner}</p>;
  };

  return (
    <div className="h-screen bg-white overflow-y-auto snap-y snap-mandatory">
      {summaries.length > 0 ? (
        summaries.map((summary, index) => (
          <div
            key={index}
            className="h-screen w-full flex-shrink-0 snap-start flex flex-col justify-center p-4"
          >
            <div className="bg-white p-4 rounded-lg shadow-md max-h-full overflow-y-auto">
              <h1 className="text-xl font-bold mb-4">{summary.topic}</h1>
              {renderContent(summary)}
            </div>
          </div>
        ))
      ) : (
        <div className="h-screen flex items-center justify-center">
          <p>Loading summaries...</p>
        </div>
      )}
    </div>
  );
};

export default MainScreen;
