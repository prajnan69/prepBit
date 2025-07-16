const imageUrls = [
  'https://jmdzllonlxmssozvnstd.supabase.co/storage/v1/object/public/userdetails//onboarding_interests.png',
];

export const getRandomImageUrl = () => {
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  return imageUrls[randomIndex];
};
