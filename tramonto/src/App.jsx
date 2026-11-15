import { useEffect } from 'react';
import { initSmoothScroll, ScrollTrigger } from './lib/motion.js';
import Preloader from './components/Preloader.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Manifesto from './components/Manifesto.jsx';
import GoldenHour from './components/GoldenHour.jsx';
import Menu from './components/Menu.jsx';
import PetFriendly from './components/PetFriendly.jsx';
import Gallery from './components/Gallery.jsx';
import Stats from './components/Stats.jsx';
import Testimonials from './components/Testimonials.jsx';
import Faq from './components/Faq.jsx';
import Location from './components/Location.jsx';
import FinalCTA from './components/FinalCTA.jsx';
import BookingForm from './components/BookingForm.jsx';
import Footer from './components/Footer.jsx';
import { WhatsAppFab, Cursor, Toast } from './components/Globals.jsx';

export default function App() {
  useEffect(() => {
    initSmoothScroll();
    // Recalcular posiciones cuando cambie la altura del documento (tabs, filtros, acordeón)
    let t;
    const ro = new ResizeObserver(() => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 250); });
    ro.observe(document.body);
    document.fonts?.ready.then(() => ScrollTrigger.refresh());
    return () => ro.disconnect();
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Preloader />
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee />
        <Manifesto />
        <GoldenHour />
        <Menu />
        <PetFriendly />
        <Gallery />
        <Stats />
        <Testimonials />
        <Faq />
        <Location />
        <FinalCTA />
        <BookingForm />
      </main>
      <Footer />
      <WhatsAppFab />
      <Toast />
      <Cursor />
    </>
  );
}
