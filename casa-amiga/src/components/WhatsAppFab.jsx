import { wa } from '../data'
import { WhatsAppIcon } from './Icons'

export default function WhatsAppFab() {
  return (
    <a
      href={wa('¡Hola Casa Amiga! Quiero visitarlos 🧡')}
      target="_blank"
      rel="noreferrer"
      aria-label="Escríbenos por WhatsApp: ¿Vienes a visitarnos?"
      className="group fixed bottom-5 right-5 z-40 sm:bottom-7 sm:right-7"
    >
      <span className="pointer-events-none absolute right-[calc(100%+12px)] top-1/2 -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-tinta px-4 py-2 text-sm font-medium text-white opacity-0 shadow-lg transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
        ¿Vienes a visitarnos?
      </span>
      <span className="pulso grid h-16 w-16 place-items-center rounded-full bg-ambar text-tinta shadow-[0_12px_30px_-10px_rgba(180,96,14,.8)] transition-transform duration-300 group-hover:scale-110">
        <WhatsAppIcon className="h-8 w-8" />
      </span>
    </a>
  )
}
