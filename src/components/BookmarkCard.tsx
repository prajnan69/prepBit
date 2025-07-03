import { motion } from 'framer-motion';
import { Image } from 'lucide-react';
import { useIonRouter } from '@ionic/react';

interface BookmarkCardProps {
  article: any;
}

const BookmarkCard = ({ article }: BookmarkCardProps) => {
  const ionRouter = useIonRouter();

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-md border border-neutral-200 cursor-pointer overflow-hidden"
      onClick={() => ionRouter.push(`/article/${article.id}`)}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      layout
      variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
    >
      {article.image_url ? (
        <img
          src={article.image_url}
          alt={article.title}
          className="w-full h-40 object-cover"
        />
      ) : (
        <div className="w-full h-40 bg-gray-100 flex items-center justify-center">
          <Image className="text-gray-400" />
        </div>
      )}
      <div className="p-4">
        <h2 className=" text-sm font-semibold leading-tight text-neutral-800 line-clamp-2">
          {article.title}
        </h2>
        <div className="flex items-center text-xs text-neutral-500 mt-2">
          <span>{new Date(article.published_at).toLocaleDateString('en-GB')}</span>
          <span className="mx-1.5">•</span>
          <span>{article.source}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default BookmarkCard;
