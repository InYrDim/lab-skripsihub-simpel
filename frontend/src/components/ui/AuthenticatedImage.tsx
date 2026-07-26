import React, { useState, useEffect } from 'react';

interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    // If it's not our API, just use the src directly (or if it's already a blob)
    if (!src.startsWith('http://localhost:3000/api/') && !src.startsWith(import.meta.env.VITE_API_URL || '')) {
      setImgSrc(src);
      return;
    }

    const fetchImage = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const headers: HeadersInit = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        
        const response = await fetch(src, { headers });
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
      } catch (err) {
        console.error('Failed to load authenticated image', err);
        setError(true);
      }
    };

    fetchImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (error || !imgSrc) {
    // You can return a fallback image or a placeholder icon here
    return <div className={`bg-zinc-200 dark:bg-zinc-800 ${props.className || ''}`} />;
  }

  return <img src={imgSrc} alt={alt} {...props} />;
};
