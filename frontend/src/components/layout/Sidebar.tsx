import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Calendar, 
  CheckSquare, 
  Target, 
  Folder, 
  Settings, 
  Plus,
  Clock,
  Filter
} from 'lucide-react';
import { Card } from '../ui/Card';
import { ThemeToggle } from '../ui/ThemeToggle';
import { Button } from '../ui/Button';

const navItems = [
  { icon: Calendar, label: 'Today', path: '/today' },
  { icon: CheckSquare, label: 'All Tasks', path: '/tasks' },
  { icon: Target, label: 'Goals', path: '/goals' },
  { icon: Folder, label: 'Categories', path: '/categories' },
  { icon: Clock, label: 'Backburner', path: '/backburner' },
];

const filterItems = [
  { label: 'Pending', count: 12 },
  { label: 'In Progress', count: 5 },
  { label: 'Completed', count: 28 },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-800/60 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          FocusFlow
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Task & Goal Management
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-6">
        <Button variant="primary" className="w-full mb-3">
          <Plus size={16} className="mr-2" />
          New Task
        </Button>
        <Button variant="secondary" className="w-full">
          <Target size={16} className="mr-2" />
          New Goal
        </Button>
      </div>

      {/* Navigation */}
      <nav className="px-6 mb-6">
        <h3 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3">
          Navigation
        </h3>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 rounded-element text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-500 text-white'
                    : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-background-primary dark:hover:bg-dark-primary/30'
                }`
              }
            >
              <item.icon size={16} className="mr-3" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Filters */}
      <div className="px-6 mb-6">
        <h3 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider mb-3 flex items-center">
          <Filter size={12} className="mr-2" />
          Filters
        </h3>
        <div className="space-y-1">
          {filterItems.map((item) => (
            <button
              key={item.label}
              className="flex items-center justify-between w-full px-3 py-2 rounded-element text-sm text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-background-primary dark:hover:bg-dark-primary/30 transition-colors"
            >
              <span>{item.label}</span>
              <span className="bg-background-primary dark:bg-dark-primary/50 text-xs px-2 py-0.5 rounded-full">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Theme Toggle */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
            Theme
          </h3>
          <ThemeToggle />
        </div>
      </div>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border-light dark:border-border-dark">
        <Card className="p-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">JD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary truncate">
                John Doe
              </p>
              <p className="text-xs text-text-secondary dark:text-dark-text-secondary truncate">
                john@example.com
              </p>
            </div>
            <button className="text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary">
              <Settings size={16} />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};