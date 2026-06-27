import React from 'react';
import Hero from '../components/Hero';
import CollectionShowcase from '../components/CollectionShowcase';
import AppDownloadSection from '../components/AppDownloadSection';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Hero />
      <CollectionShowcase />
      <AppDownloadSection />
      <Footer />
    </>
  );
}
