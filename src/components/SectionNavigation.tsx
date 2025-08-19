
import React, { useEffect, useState } from 'react';
import { List, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

interface Section {
  id: string;
  title: string;
  level: number;
}

interface SectionNavigationProps {
  content: string;
}

export const SectionNavigation: React.FC<SectionNavigationProps> = ({ content }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState<string>('');

  useEffect(() => {
    // Extract sections from content using regex for headers
    const headerRegex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headerRegex));
    
    const extractedSections = matches.map((match, index) => ({
      id: `section-${index}`,
      title: match[2].trim(),
      level: match[1].length
    }));

    setSections(extractedSections);
  }, [content]);

  const scrollToSection = (sectionId: string, title: string) => {
    // Find the element by text content
    const elements = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6, strong'));
    const targetElement = elements.find(el => 
      el.textContent?.toLowerCase().includes(title.toLowerCase())
    );

    if (targetElement) {
      targetElement.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
      setActiveSection(sectionId);
    }
  };

  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="w-64 border-l bg-muted/30">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <List className="h-4 w-4" />
          <span className="font-medium">Navegação</span>
        </div>
      </div>
      
      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="p-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              onClick={() => scrollToSection(section.id, section.title)}
              className={`w-full justify-start text-left mb-1 ${
                activeSection === section.id ? 'bg-muted' : ''
              }`}
              style={{ paddingLeft: `${section.level * 8 + 8}px` }}
            >
              <ChevronRight className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate text-xs">
                {section.title}
              </span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
