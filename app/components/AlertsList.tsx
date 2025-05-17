'use client';

import React from 'react';
import { Alert } from '../lib/api';

interface AlertsListProps {
  alerts: Alert[];
  isLoading?: boolean;
}

export default function AlertsList({ alerts, isLoading = false }: AlertsListProps) {
  if (isLoading) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-gray-500">Loading alerts...</p>
      </div>
    );
  }

  if (!alerts || alerts.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center">
        <p className="text-gray-500">No alerts to display</p>
      </div>
    );
  }

  // Helper function to format the timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffHours / 24);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  // Helper function to get the appropriate styling based on severity
  const getSeverityStyles = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          title: 'text-red-700',
          text: 'text-red-600'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          title: 'text-yellow-700',
          text: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          title: 'text-blue-700',
          text: 'text-blue-600'
        };
    }
  };

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const styles = getSeverityStyles(alert.severity);
        return (
          <div 
            key={alert.id}
            className={`${styles.bg} border-l-4 ${styles.border} p-3`}
          >
            <h3 className={`font-medium ${styles.title}`}>{alert.title}</h3>
            <p className={`text-sm ${styles.text}`}>{alert.description}</p>
            <p className="text-xs text-gray-500 mt-1">{formatTime(alert.timestamp)}</p>
          </div>
        );
      })}
    </div>
  );
} 