export type UIStyle = 
  | 'minimal' 
  | 'glassmorphism' 
  | 'neumorphism' 
  | 'claymorphism' 
  | 'brutalism' 
  | 'cyberpunk';

export type AccentColor = 
  | 'indigo' 
  | 'cyan' 
  | 'emerald' 
  | 'amber' 
  | 'rose' 
  | 'violet';

export interface UIStyleInfo {
  id: UIStyle;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: string;
  previewClass: string;
  features: string[];
}

export const UI_STYLES: UIStyleInfo[] = [
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    tagline: 'Frosted glass & subtle crystalline depth',
    description: 'Translucent glass surfaces with refined backdrop blur, hairline rim borders, and clean neutral depth.',
    badge: 'Trending',
    iconName: 'Sparkles',
    previewClass: 'from-slate-200/50 via-indigo-100/30 to-slate-200/50 dark:from-zinc-800/50 dark:to-zinc-900/50',
    features: ['Backdrop Blur (12px)', 'Hairline Rim Borders', 'Subtle Frosted Depth', 'Floating Layer Architecture']
  },
  {
    id: 'neumorphism',
    name: 'Neumorphism',
    tagline: 'Tactile soft extrusions & debossed inputs',
    description: 'Ultra-smooth monochromatic surfaces with dual directional light and shadow casting for a physical, extruded feel.',
    badge: 'Tactile 3D',
    iconName: 'Layers',
    previewClass: 'from-slate-200 to-slate-300 dark:from-zinc-800 dark:to-zinc-900',
    features: ['Dual Directional Shadows', 'Sunken Debossed Inputs', 'Tactile Convex Buttons', 'High-Contrast Text']
  },
  {
    id: 'claymorphism',
    name: 'Claymorphism',
    tagline: 'Puffy 3D volumes & pillowy friendly cards',
    description: 'Sculpted modern clay geometry with gentle rounded corners, soft diffusion shadows, and clean inner highlights.',
    badge: 'Playful',
    iconName: 'Smile',
    previewClass: 'from-amber-50 to-slate-100 dark:from-zinc-800 dark:to-zinc-900',
    features: ['Puffy Rounded Geometry (18px)', 'Dual Inset Bevel Highlights', 'Soft Diffuse Shadows', 'Tactile Micro-Interactions']
  },
  {
    id: 'brutalism',
    name: 'Neo-Brutalism',
    tagline: 'High-contrast retro graphics & solid drop shadows',
    description: 'Punchy graphic style featuring bold 2px solid outlines, zero-blur solid offset drop shadows, and high-impact badges.',
    badge: 'Retro Bold',
    iconName: 'Square',
    previewClass: 'from-amber-100 to-slate-100 dark:from-zinc-900 dark:to-zinc-950',
    features: ['2px Solid Borders', 'Zero-Blur 3px Shadows', 'Crisp Press Animation', 'Maximum Contrast Legibility']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Tech HUD',
    tagline: 'Precision telemetry HUD & sharp command lines',
    description: 'Futuristic command console with precision telemetry borders, dark obsidian panels, and clean monospace coordinates.',
    badge: 'Sci-Fi HUD',
    iconName: 'Zap',
    previewClass: 'from-cyan-950/20 to-slate-900/20 dark:from-cyan-950/40 dark:to-zinc-900',
    features: ['Precision Hairline Borders', 'Obsidian & Slate Canvas', 'Cyber Telemetry Accents', 'High-Contrast Monospace']
  },
  {
    id: 'minimal',
    name: 'Modern Minimal',
    tagline: 'Precision Swiss typography & hairline borders',
    description: 'The definitive clean, distraction-free modern interface with razor-thin hairline borders and micro-elevation shadows.',
    badge: 'Precision',
    iconName: 'Sliders',
    previewClass: 'from-slate-100 to-slate-200 dark:from-zinc-900 dark:to-zinc-950',
    features: ['Hairline 1px Borders', 'Subtle Micro-Elevation', 'Distraction-Free Focus', 'Swiss Grid Architecture']
  }
];

export interface AccentColorInfo {
  id: AccentColor;
  name: string;
  colorClass: string;
  hex: string;
  accentBg: string;
}

export const ACCENT_COLORS: AccentColorInfo[] = [
  { id: 'indigo', name: 'Nayra Indigo', colorClass: 'bg-indigo-600', hex: '#6366f1', accentBg: 'rgba(99, 102, 241, 0.15)' },
  { id: 'cyan', name: 'Electric Cyan', colorClass: 'bg-cyan-500', hex: '#06b6d4', accentBg: 'rgba(6, 182, 212, 0.15)' },
  { id: 'emerald', name: 'Emerald Mint', colorClass: 'bg-emerald-500', hex: '#10b981', accentBg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'amber', name: 'Sunset Amber', colorClass: 'bg-amber-500', hex: '#f59e0b', accentBg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'rose', name: 'Rose Quartz', colorClass: 'bg-rose-500', hex: '#f43f5e', accentBg: 'rgba(244, 63, 94, 0.15)' },
  { id: 'violet', name: 'Cyber Violet', colorClass: 'bg-violet-600', hex: '#8b5cf6', accentBg: 'rgba(139, 92, 246, 0.15)' }
];
