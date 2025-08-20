import React from 'react';
import { Search, Bell, Menu } from 'lucide-react';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <header className="bg-background-primary dark:bg-dark-primary/80 backdrop-blur-xl border-b border-border-light dark:border-border-dark px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Mobile menu and search */}
        <div className="flex items-center space-x-4 flex-1">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu size={20} />
          </Button>
          
          <div className="relative max-w-md w-full">
            <Search 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary dark:text-dark-text-secondary" 
            />
            <input
              type="text"
              placeholder="Search tasks, goals..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background-secondary dark:bg-dark-secondary/60 border border-border-light dark:border-border-dark rounded-element text-text-primary dark:text-dark-text-primary placeholder-text-secondary dark:placeholder-dark-text-secondary focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" className="relative">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
          
          <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">JD</span>
          </div>
        </div>
      </div>
    </header>
  );
};