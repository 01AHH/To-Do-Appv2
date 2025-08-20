import React from 'react';
import { motion } from 'framer-motion';
import { CheckSquare, Target, Clock, TrendingUp } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { TaskStatus, Priority } from '../types';

const mockStats = {
  tasksCompleted: 12,
  tasksTotal: 25,
  goalsActive: 3,
  overdueItems: 2,
};

const mockTasks = [
  {
    id: '1',
    title: 'Review project proposal',
    priority: Priority.HIGH,
    status: TaskStatus.PENDING,
    dueDate: '2024-08-19T10:00:00Z',
  },
  {
    id: '2',
    title: 'Update design system',
    priority: Priority.MEDIUM,
    status: TaskStatus.IN_PROGRESS,
    dueDate: '2024-08-20T15:00:00Z',
  },
  {
    id: '3',
    title: 'Team meeting preparation',
    priority: Priority.LOW,
    status: TaskStatus.PENDING,
    dueDate: '2024-08-19T14:00:00Z',
  },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
          Good morning, John 👋
        </h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
          You have {mockStats.tasksTotal - mockStats.tasksCompleted} tasks pending today
        </p>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, staggerChildren: 0.1 }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                  Tasks Completed
                </p>
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  {mockStats.tasksCompleted}/{mockStats.tasksTotal}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-element flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(mockStats.tasksCompleted / mockStats.tasksTotal) * 100}%` }}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                  Active Goals
                </p>
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  {mockStats.goalsActive}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-element flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                  Overdue Items
                </p>
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  {mockStats.overdueItems}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-element flex items-center justify-center">
                <Clock className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
                  Productivity
                </p>
                <p className="text-2xl font-bold text-text-primary dark:text-dark-text-primary">
                  +12%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-element flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </motion.div>
      </motion.div>

      {/* Today's Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <div className="p-6 border-b border-border-light dark:border-border-dark">
            <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">
              Today's Focus
            </h2>
            <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
              Your most important tasks for today
            </p>
          </div>
          
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {mockTasks.map((task) => (
              <motion.div 
                key={task.id}
                className="p-6 hover:bg-background-secondary dark:hover:bg-dark-secondary/30 transition-colors cursor-pointer"
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-600 rounded"></div>
                    <div>
                      <h3 className="font-medium text-text-primary dark:text-dark-text-primary">
                        {task.title}
                      </h3>
                      <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="priority" priority={task.priority}>
                      {task.priority}
                    </Badge>
                    <Badge variant="status" status={task.status}>
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
};