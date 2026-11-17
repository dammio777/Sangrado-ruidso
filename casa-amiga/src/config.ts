// Configuración generada por tools/build.mjs (clips.json + route.json + datos.json + ffprobe).
import { timing } from './tokens';

export interface ClipCfg {
  start: number; // s desde el inicio del metraje
  dur: number;
  existe: boolean;
  framesPath: string; // /gen/frames/<fps>/clipN/
  frameCount: number;
  etiqueta: string;
  antetitulo: string;
  titulo: string;
  navegacion: string;
  texto_en: number;
  final: { antetitulo: string; titulo: string; segundos_antes_del_fin: number } | null;
}

export interface Etapa { n: number; nombre: string; corto: string; detalle: string }

export interface FilmConfig {
  fps: number;
  footage: number; // F = suma de las duraciones
  total: number; // 16.5 + F + 3.0
  clips: ClipCfg[];
  etapas: Etapa[];
  datos: Record<string, string>;
}

export interface Times {
  HO: number; // se abre la ventana de video
  F: number;
  C0: number; // empieza la contracción al teléfono
  C1: number; // termina el metraje, empieza el cierre
  END: number;
}

export function times(cfg: FilmConfig): Times {
  const HO = timing.handoff, F = cfg.footage;
  return { HO, F, C0: HO + F - 0.9, C1: HO + F, END: HO + F + 0.9 + timing.closing };
}

export async function loadConfig(): Promise<FilmConfig> {
  const r = await fetch('/gen/config.json');
  if (!r.ok) throw new Error('Falta assets/gen/config.json: corre `node tools/build.mjs`');
  return (await r.json()) as FilmConfig;
}
