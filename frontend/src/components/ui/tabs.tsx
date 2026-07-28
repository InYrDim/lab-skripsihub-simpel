import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface TabsContextType {
  activeValue: string;
  setActiveValue: (val: string) => void;
  indicatorStyle: { width: number; left: number };
  setIndicatorStyle: (style: { width: number; left: number }) => void;
}

const TabsContext = createContext<TabsContextType | undefined>(undefined);

export function Tabs({ defaultValue, value, onValueChange, children, className }: { 
  defaultValue?: string; 
  value?: string; 
  onValueChange?: (val: string) => void;
  children: ReactNode;
  className?: string;
}) {
  const [activeValueState, setActiveValueState] = useState(value ?? defaultValue ?? '');
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });

  const activeValue = value !== undefined ? value : activeValueState;
  const setActiveValue = (val: string) => {
    if (value === undefined) setActiveValueState(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue, indicatorStyle, setIndicatorStyle }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  const listRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const { indicatorStyle } = useContext(TabsContext)!;
  const isFirstRender = useRef(true);

  useGSAP(() => {
    if (indicatorStyle.width > 0) {
      if (isFirstRender.current) {
         gsap.set(indicatorRef.current, { width: indicatorStyle.width, x: indicatorStyle.left });
         isFirstRender.current = false;
      } else {
         gsap.to(indicatorRef.current, {
           width: indicatorStyle.width,
           x: indicatorStyle.left,
           duration: 0.4,
           ease: 'back.out(1.2)', // Smooth sliding with slight bounce
         });
      }
    }
  }, [indicatorStyle]);

  return (
    <div ref={listRef} className={cn("relative flex items-center border-b border-zinc-200 dark:border-zinc-800", className)}>
      {children}
      <div 
        ref={indicatorRef} 
        className="absolute bottom-0 h-0.5 bg-orange-600 dark:bg-orange-400"
        style={{ left: 0, width: 0 }}
      />
    </div>
  );
}

export function TabsTrigger({ value, children, className, onClick }: { value: string; children: ReactNode; className?: string; onClick?: () => void }) {
  const { activeValue, setActiveValue, setIndicatorStyle } = useContext(TabsContext)!;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const isActive = activeValue === value;

  const updateIndicator = () => {
    if (triggerRef.current) {
      setIndicatorStyle({
        width: triggerRef.current.offsetWidth,
        left: triggerRef.current.offsetLeft,
      });
    }
  };

  useEffect(() => {
    if (isActive) {
      // Small timeout to ensure DOM layout is complete before measuring
      const timeoutId = setTimeout(updateIndicator, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isActive]);

  useEffect(() => {
    if (isActive) {
      const handleResize = () => updateIndicator();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [isActive]);

  return (
    <Button
      ref={triggerRef}
      onClick={() => {
        setActiveValue(value);
        if (onClick) onClick();
      }}
      className={cn(
        "relative px-4 py-3 text-sm font-bold transition-colors outline-none",
        isActive 
          ? "text-orange-600 dark:text-orange-400" 
          : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200",
        className
      )}
    >
      {children}
    </Button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const { activeValue } = useContext(TabsContext)!;
  const contentRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (activeValue === value) {
      gsap.fromTo(contentRef.current, 
        { opacity: 0, y: 10 }, 
        { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [activeValue, value]);

  if (activeValue !== value) return null;

  return (
    <div ref={contentRef} className={cn("mt-4", className)}>
      {children}
    </div>
  );
}
