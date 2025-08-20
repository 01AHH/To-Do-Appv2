import React from 'react';
import { Card } from '../components/ui/Card';

export const Tasks: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
          All Tasks
        </h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
          Manage all your tasks in one place
        </p>
      </div>

      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
          Task Management Coming Soon
        </h2>
        <p className="text-text-secondary dark:text-dark-text-secondary">
          The full task management interface with backburner functionality will be implemented here.
        </p>
      </Card>
    </div>
  );
};