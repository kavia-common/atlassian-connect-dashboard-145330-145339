'use client';

import React from 'react';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onMenuToggle?: () => void;
}

// PUBLIC_INTERFACE
export default function DashboardHeader({ title, subtitle, onMenuToggle }: DashboardHeaderProps) {
  /**
   * Dashboard header component with mobile menu toggle and section titles.
   * Provides responsive navigation controls and contextual information.
   */

  return (
    <div className="content-header">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={onMenuToggle}
            className="md:hidden mr-4 p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div>
            <h1 className="content-title">{title}</h1>
            {subtitle && <p className="content-subtitle">{subtitle}</p>}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-500">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-gray-900">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
