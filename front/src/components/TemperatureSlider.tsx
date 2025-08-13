import React, { useEffect, useRef, useState } from 'react';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { FaThermometerHalf } from 'react-icons/fa';
import { useChatSessionStore } from '@store/ChatSessionStore';

// Tooltip CSS (as before)
const tooltipStyles = `
.temp-control-tooltip {
  position: relative;
  display: inline-block;
}
.temp-control-tooltip .tooltip-content {
  visibility: hidden;
  width: 120px;
  background-color: #222;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 8px;
  position: absolute;
  right: 120%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  white-space: pre-line;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}
.temp-control-tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}
`;

const TemperatureSlider = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const temperature = useChatSessionStore((state) => state.temperature);
  const setTemperature = useChatSessionStore((state) => state.setTemperature);
  const isAllDisabled = useChatSessionStore((state) => state.isAllDisabled);

  // Collapse slider when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  const handleChange = (val: number | number[]) => {
    if (typeof val === 'number') {
      setTemperature(val);
    }
  };

  return (
    <>
      {/* Tooltip styles */}
      <style>{tooltipStyles}</style>
      <div
        ref={wrapperRef}
        className="fixed bottom-22 right-4 z-[10000]"
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {isExpanded ? (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg flex flex-col items-center gap-2">
            {/* Temperature value */}
            <span
              className={`text-sm font-medium ${
                isAllDisabled
                  ? 'text-gray-500'
                  : 'text-gray-700 dark:text-gray-300'
              } transition-opacity duration-300`}
            >
              {temperature.toFixed(1)} °C
            </span>
            {/* Slider with tooltip */}
            <div className="h-40 w-6 relative temp-control-tooltip">
              <Slider
                vertical
                min={0}
                max={1}
                step={0.1}
                value={temperature}
                onChange={handleChange}
                disabled={isAllDisabled}
                style={{
                  width: '4px',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
                styles={{
                  rail: {
                    backgroundColor: 'rgba(55, 65, 81, 0.3)',
                    width: 4,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  },
                  track: {
                    backgroundImage:
                      'linear-gradient(to bottom, #3b82f6, #6366f1)',
                    width: 4,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  },
                  handle: {
                    width: 14,
                    height: 14,
                    marginLeft: -5,
                    backgroundColor: '#ffffff',
                    border: '3px solid #3b82f6',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                    transition:
                      'transform 0.2s ease, border-color 0.2s ease',
                  },
                }}
              />
              <span className="tooltip-content">
                temperature
                <br />
                control
              </span>
            </div>
          </div>
        ) : (
          <div className="temp-control-tooltip">
            <button
              className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition border border-gray-700"
              aria-label="Temperature"
              style={{
                width: 42,
                height: 42,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <FaThermometerHalf size={20} />
            </button>
            <span className="tooltip-content">
              Temperature
              <br />
              Control
            </span>
          </div>
        )}
      </div>
    </>
  );
};

export default TemperatureSlider;
