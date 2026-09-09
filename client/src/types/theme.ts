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
    tagline: 'Frosted glass & ethereal ambient depth',
    description: 'Translucent glass surfaces with backdrop blur, specular crystalline rim borders, and glowing multi-spectrum lighting.',
    badge: 'Trending',
    iconName: 'Sparkles',
    previewClass: 'from-blue-500/20 via-purple-500/20 to-pink-500/20',
    features: ['Backdrop Blur (16px)', 'Specular Rim Borders', 'Ambient Color Glows', 'Deep Floating Layers']
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
    description: 'Playful sculpted clay geometry with heavy rounded corners, double-layer soft diffusion shadows, and inner bevel highlights.',
    badge: 'Playful',
    iconName: 'Smile',
    previewClass: 'from-amber-100 to-rose-100 dark:from-zinc-800 dark:to-purple-950',
    features: ['Puffy Rounded Geometry (20px)', 'Dual Inset Bevel Highlights', 'Soft Diffuse Drop Shadows', 'Bouncy Micro-Interactions']
  },
  {
    id: 'brutalism',
    name: 'Neo-Brutalism',
    tagline: 'High-contrast retro graphics & solid drop shadows',
    description: 'Punchy graphic style featuring bold 2.5px solid outlines, zero-blur solid offset drop shadows, and high-impact sticker tags.',
    badge: 'Retro Bold',
    iconName: 'Square',
    previewClass: 'from-yellow-200 to-emerald-200 dark:from-zinc-900 dark:to-indigo-950',
    features: ['2.5px Solid Borders', 'Hard 4px Offset Shadows', 'Tactile Press Animation', 'Maximum Contrast Legibility']
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Neon',
    tagline: 'Sci-fi command HUD & glowing terminal lines',
    description: 'Futuristic command console with glowing neon cyan/magenta border halos, dark obsidian panels, and telemetry coordinates.',
    badge: 'Sci-Fi HUD',
    iconName: 'Zap',
    previewClass: 'from-cyan-500/20 to-fuchsia-500/20',
    features: ['Neon Halo Border Glows', 'Dark Obsidian Canvas', 'Cyber Telemetry Accents', 'Electric Neon Highlights']
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
