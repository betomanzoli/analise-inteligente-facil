
import React from 'react';

interface FormattedResultProps {
  content: string;
}

export const FormattedResult: React.FC<FormattedResultProps> = ({ content }) => {
  const formatContent = (text: string) => {
    // Split by double line breaks to identify sections
    const sections = text.split(/\n\n+/);
    
    return sections.map((section, index) => {
      const trimmedSection = section.trim();
      
      if (!trimmedSection) return null;

      // Check if it's a header (contains ═ or is in ALL CAPS)
      if (trimmedSection.includes('═') || 
          (trimmedSection.length < 100 && trimmedSection === trimmedSection.toUpperCase())) {
        return (
          <div key={index} className="border-b border-border pb-2 mb-4">
            <h2 className="text-xl font-bold text-foreground">
              {trimmedSection.replace(/═/g, '')}
            </h2>
          </div>
        );
      }

      // Check if it's a subtitle (ends with :)
      if (trimmedSection.endsWith(':') && trimmedSection.length < 100) {
        return (
          <h3 key={index} className="text-lg font-semibold text-foreground mt-6 mb-3">
            {trimmedSection}
          </h3>
        );
      }

      // Format lists (lines starting with •, -, or numbers)
      if (trimmedSection.includes('\n•') || trimmedSection.includes('\n-') || 
          trimmedSection.match(/\n\d+\./)) {
        const lines = trimmedSection.split('\n');
        const listItems: JSX.Element[] = [];
        let currentParagraph = '';

        lines.forEach((line, lineIndex) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine.match(/^[•\-]\s/) || trimmedLine.match(/^\d+\.\s/)) {
            // Add any accumulated paragraph before the list
            if (currentParagraph) {
              listItems.push(
                <p key={`para-${lineIndex}`} className="text-foreground leading-relaxed mb-3">
                  {currentParagraph.trim()}
                </p>
              );
              currentParagraph = '';
            }
            
            // Add list item
            listItems.push(
              <li key={lineIndex} className="text-foreground leading-relaxed mb-1">
                {trimmedLine.replace(/^[•\-]\s/, '').replace(/^\d+\.\s/, '')}
              </li>
            );
          } else if (trimmedLine) {
            currentParagraph += line + ' ';
          }
        });

        // Add any remaining paragraph
        if (currentParagraph) {
          listItems.push(
            <p key="final-para" className="text-foreground leading-relaxed mb-3">
              {currentParagraph.trim()}
            </p>
          );
        }

        return (
          <div key={index} className="mb-4">
            <ul className="list-disc list-inside space-y-1 ml-4">
              {listItems}
            </ul>
          </div>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-foreground leading-relaxed mb-4">
          {trimmedSection}
        </p>
      );
    }).filter(Boolean);
  };

  return (
    <div className="prose prose-gray max-w-none">
      <div className="space-y-2">
        {formatContent(content)}
      </div>
    </div>
  );
};
