'use client';

import React from 'react';

import { ServiceType } from '@/types';

interface SidebarProps {
  activeSection: ServiceType;
  onSectionChange: (section: ServiceType) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

// PUBLIC_INTERFACE
export default function Sidebar({ activeSection, onSectionChange, isOpen = false, onToggle }: SidebarProps) {
  /**
   * Sidebar component for dashboard navigation between Jira and Confluence sections.
   * Provides responsive design with mobile toggle functionality.
   */

  const navItems: Array<{ id: ServiceType; label: string; icon: React.ReactNode }> = [
    {
      id: 'jira',
      label: 'Jira',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.53 2c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V4.35A2.35 2.35 0 0019.65 2H11.53zM6.77 6.8c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V9.15a2.35 2.35 0 00-2.35-2.35H6.77zM2 11.6c0 2.4 1.97 4.35 4.35 4.35h1.78v1.7c0 2.4 1.97 4.35 4.35 4.35V13.95A2.35 2.35 0 0010.13 11.6H2z"/>
        </svg>
      ),
    },
    {
      id: 'confluence',
      label: 'Confluence',
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.33 11.32a.75.75 0 01.36.96c-.87 1.83-1.56 3.75-2.06 5.75a.75.75 0 01-1.46-.38c.54-2.13 1.28-4.18 2.2-6.13a.75.75 0 01.96-.36l.75.16zm9.34 1.36a.75.75 0 01-.36-.96c.87-1.83 1.56-3.75 2.06-5.75a.75.75 0 011.46.38c-.54 2.13-1.28 4.18-2.2 6.13a.75.75 0 01-.96.36l-.75-.16zM12 4.5c4.14 0 7.5 3.36 7.5 7.5s-3.36 7.5-7.5 7.5S4.5 16.14 4.5 12 7.86 4.5 12 4.5z"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" 
          onClick={onToggle}
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">Atlassian Connect</h1>
          <p className="text-sm opacity-75 mt-1">Dashboard</p>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onSectionChange(item.id);
                if (onToggle && window.innerWidth < 768) {
                  onToggle();
                }
              }}
              className={`nav-item w-full text-left ${
                activeSection === item.id ? 'active' : ''
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        
        <div className="mt-8 px-4">
          <div className="bg-white bg-opacity-10 rounded-lg p-3">
            <p className="text-xs text-white opacity-75">
              Connect your Atlassian accounts to get started
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
