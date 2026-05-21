import React from 'react';
import CollectionShowcase from '../components/CollectionShowcase';
import PageHeader from '../components/PageHeader';

export default function CollectionsPage() {
  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      <PageHeader title="Our Collections" subtitle="Discover all Zanny product lines and exclusive drops." />
      {/* Hide the CollectionShowcase built-in header to avoid double headers */}
      <style>{`
        #collections { padding-top: 2rem !important; }
        #collections > div:first-child { display: none !important; }
      `}</style>
      <div>
        <CollectionShowcase />
      </div>
    </div>
  );
}
