import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';

interface AuthenticatedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ src, alt, ...props }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    
    // Fetch protected API images with the in-memory bearer token.
    const configuredApiUrl = import.meta.env.VITE_API_URL as string | undefined;
    const isApiImage =
      src.startsWith('/api/') ||
      src.startsWith('http://localhost:3000/api/') ||
      Boolean(configuredApiUrl && src.startsWith(configuredApiUrl));
    if (!isApiImage) {
      setImgSrc(src);
      return;
    }

    const fetchImage = async () => {
      try {
        const blob = await api.fetchAuthenticatedBlob(src);
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
