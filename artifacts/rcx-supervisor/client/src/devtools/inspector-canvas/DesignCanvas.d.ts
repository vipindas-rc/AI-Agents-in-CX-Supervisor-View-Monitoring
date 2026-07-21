import { CSSProperties, ReactNode } from 'react';

export interface DesignCanvasProps {
  children?: ReactNode;
  minScale?: number;
  maxScale?: number;
  /**
   * Artboards report `active = false` via `useArtboardActive()` when the
   * viewport scale drops below this threshold (or when the artboard scrolls
   * out of view). Heavy content (videos, canvases) should gate on it.
   * Defaults to 0.35.
   */
  minActiveScale?: number;
  style?: CSSProperties;
  /** Enables the click-to-inspect overlay (Spring component + props + className). */
  inspector?: boolean;
  /**
   * Enables the comment layer (drop pins on artboard elements, thread, resolve).
   * Inert when omitted/false. `canvasId` namespaces the data in the
   * comments-service; `devMode` uses an in-memory mock store instead of the network.
   */
  comments?:
    | false
    | {
        canvasId: string;
        serviceUrl?: string;
        devMode?: boolean;
      };
}
export function DesignCanvas(props: DesignCanvasProps): JSX.Element;

/**
 * Read the enclosing artboard's active state. Returns `true` outside a
 * DesignCanvas so this hook is safe to call from any shared component.
 */
export function useArtboardActive(): boolean;

export interface DCSectionProps {
  id?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  gap?: number;
}
export function DCSection(props: DCSectionProps): JSX.Element;

export interface DCArtboardProps {
  id?: string;
  label: string;
  width?: number;
  height?: number;
  style?: CSSProperties;
  children?: ReactNode;
}
export function DCArtboard(props: DCArtboardProps): JSX.Element | null;

export interface DCPageProps {
  /** Stable page id; also the `?page=` deep-link value. Defaults to `title`. */
  id?: string;
  title: string;
  children?: ReactNode;
}
/**
 * A Figma-style canvas page. Wrap groups of `DCSection`s in `DCPage`s and only
 * the active one renders; the bottom-left ModeBar gains a page switcher.
 * A canvas with no `DCPage` children is unpaged (today's single-surface behavior).
 */
export function DCPage(props: DCPageProps): JSX.Element | null;

export interface DCPostItProps {
  children?: ReactNode;
  /** Frame edge the note tethers to via the connector (default 'right'). */
  side?: 'left' | 'right';
  /** Offset from the frame top, px (default 24). */
  top?: number | string;
  /** Card width, px (default 230). */
  width?: number;
  /** Connector length, px (default 28). */
  gap?: number;
}
export function DCPostIt(props: DCPostItProps): JSX.Element;
