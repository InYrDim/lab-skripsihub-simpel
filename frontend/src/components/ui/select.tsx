import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

function DropdownMenu({ options, value, onSelect, style }: any) {
  const menuRef = useRef<HTMLDivElement>(null);
  
  useGSAP(() => {
    gsap.from(menuRef.current, {
      opacity: 0,
      y: -10,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.out",
      transformOrigin: "top center"
    });
    
    gsap.from('.gsap-option', {
      opacity: 0,
      x: -15,
      duration: 0.2,
      stagger: 0.03,
      ease: "power2.out",
      delay: 0.05
    });
  }, { scope: menuRef });

  return (
    <div 
      ref={menuRef}
      className="select-portal-dropdown bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-xl overflow-hidden"
      style={style}
    >
      <ul className="max-h-60 overflow-y-auto overflow-x-hidden py-1 custom-scrollbar">
        {options.map((opt: any) => {
          const isSelected = opt.value === value;
          return (
            <li
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`gsap-option flex items-center justify-between px-3 py-2 text-xs cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 font-medium'
                  : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900/50'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && <Check size={14} className="text-orange-600 dark:text-orange-400 ml-2 shrink-0" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Select({ options, value, onChange, placeholder, className = '' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  
  const { contextSafe } = useGSAP({ scope: containerRef });

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current && 
        !containerRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.select-portal-dropdown')
      ) {
        setIsOpen(false);
      }
    };

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownStyle({
          position: 'fixed',
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
          zIndex: 9999,
        });
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      updatePosition();
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };
  
  const toggleOpen = contextSafe(() => {
    if (!isOpen) {
      gsap.fromTo(buttonRef.current, { scale: 1 }, { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 });
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  });

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="flex items-center justify-between w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-orange-500 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 shadow-sm"
      >
        <span className="truncate mr-2">
          {selectedOption ? selectedOption.label : placeholder || 'Select option'}
        </span>
        <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <DropdownMenu options={options} value={value} onSelect={handleSelect} style={dropdownStyle} />,
        document.body
      )}
    </div>
  );
}
