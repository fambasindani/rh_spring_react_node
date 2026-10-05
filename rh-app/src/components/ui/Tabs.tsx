import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ElementType;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, defaultTab }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px space-x-6">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm flex items-center
                  ${isActive 
                    ? 'border-blue-500 text-blue-600' // ← fond supprimé, seulement texte bleu
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {Icon && <Icon className="mr-2" />}
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
      <div className="py-4">
        {tabs.find(t => t.id === activeTab)?.content}
      </div>
    </div>
  );
};

export default Tabs;