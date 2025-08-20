import React from 'react';
import { Card } from '../components/ui/Card';

export const Backburner: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary dark:text-dark-text-primary">
          Backburner
        </h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
          Tasks you've set aside with mandatory review dates
        </p>
      </div>

      <Card className="p-8 text-center">
        <h2 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary mb-4">
          Backburner Management Coming Soon
        </h2>
        <p className="text-text-secondary dark:text-dark-text-secondary">
          The innovative backburner system with mandatory date assignment will be implemented here.
        </p>
      </Card>
    </div>
  );
};