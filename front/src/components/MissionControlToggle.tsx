import React, { useEffect, useRef, useState } from 'react';
import { FaCog } from 'react-icons/fa';
import FileUploadTypeText from '@components/FileUploadTypeText';
import FileUploadTypePDF from './FileUploadTypePDF';
import CloneSessionButton from './CloneSession';
import SetPromptBuilderMessage from './SetPromptBuilderMessage';

// Tooltip CSS
const tooltipStyles = `
.mission-control-tooltip {
  position: relative;
  display: inline-block;
}
.mission-control-tooltip .tooltip-content {
  visibility: hidden;
  width: 120px;
  background-color: #222;
  color: #fff;
  text-align: left;
  border-radius: 6px;
  padding: 6px 10px;
  position: absolute;
  left: 130%;
  top: 50%;
  transform: translateY(-50%);
  z-index: 9999;
  white-space: pre-line;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;
  pointer-events: none;
}
.mission-control-tooltip:hover .tooltip-content {
  visibility: visible;
  opacity: 1;
}
`;

const MissionControl: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsExpanded(false);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    return (
        <div
            ref={wrapperRef}
            className="fixed bottom-18 left-0 p-4"
            style={{ zIndex: 10000 }}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <style>{tooltipStyles}</style>
            {isExpanded ? (
                <div className="mt-2">
                    <CloneSessionButton />
                    <FileUploadTypePDF />
                    <FileUploadTypeText />
                    <SetPromptBuilderMessage />
                </div>
            ) : (
                <div className="mission-control-tooltip">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 transition"
                        aria-label="Mission Control"
                        style={{ width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FaCog size={20} />
                    </button>
                    <span className="tooltip-content">
                        Files &amp; Depth
                    </span>
                </div>
            )}
        </div>
    );
};

export default MissionControl;
