import { useEffect } from 'react';
import Apertura from './components/Apertura.jsx';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import Marquee from './components/Marquee.jsx';
import Desgranado from './components/Desgranado.jsx';
import Volvimos from './components/Volvimos.jsx';
import CieloAbierto from './components/CieloAbierto.jsx';
import Manifiesto from './components/Manifiesto.jsx';
import Carta from './components/Carta.jsx';
import ArmaMesa from './components/ArmaMesa.jsx';
import TardeNoche from './components/TardeNoche.jsx';
import Botella from './components/Botella.jsx';
import Galeria from './components/Galeria.jsx';
import Domicilios from './components/Domicilios.jsx';
import Testimonios from './components/Testimonios.jsx';
import FAQ from './components/FAQ.jsx';
import Visitanos from './components/Visitanos.jsx';
import CtaFinal from './components/CtaFinal.jsx';
import Footer from './components/Footer.jsx';
import PanelMesa from './components/PanelMesa.jsx';
import { BotonFlotante, PaletaDemo, Toast } from './components/Globales.jsx';
import { ScrollTrigger } from './lib/scroll.js';
import { reducido } from './lib/util.js';

export default function App() {
  useEffect(() => {
    if (reducido()) document.documentElement.classList.add('reduced');
    const t = setTimeout(() => ScrollTrigger.refresh(), 600);
    addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <Apertura />
      <Navbar />
      <main id="contenido">
        <Hero />
        <Marquee />
        <Volvimos />
        <Desgranado />
        <CieloAbierto />
        <Manifiesto />
        <Carta />
        <ArmaMesa />
        <TardeNoche />
        <Botella />
        <Galeria />
        <Domicilios />
        <Testimonios />
        <FAQ />
        <Visitanos />
        <CtaFinal />
      </main>
      <Footer />
      <BotonFlotante />
      <PanelMesa />
      <Toast />
      <PaletaDemo />
    </>
  );
}
