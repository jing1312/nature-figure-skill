/**
 * FigureForge — Color Palettes
 * Extracted from nature-figure-skill/references/api.md
 * All palettes from the original skill are preserved here as JS objects.
 */

const PALETTES = {
  // ── Main palette — semantic colors for proposed method vs baselines ──
  classic: {
    name: "Classic Nature",
    description: "Blue=proposed, green=positive, red=baseline, neutral=reference",
    colors: {
      blue_main:      "#0F4D92",
      blue_secondary: "#3775BA",
      green_1: "#DDF3DE",
      green_2: "#AADCA9",
      green_3: "#8BCF8B",
      red_1:   "#F6CFCB",
      red_2:   "#E9A6A1",
      red_strong: "#B64342",
      neutral_light: "#CFCECE",
      neutral_mid:   "#767676",
      neutral_dark:  "#4D4D4D",
      neutral_black: "#272727",
      gold:   "#FFD700",
      teal:   "#42949E",
      violet: "#9A4D8E",
      magenta:"#EA84DD",
    },
    defaultSequence: ["#0F4D92", "#8BCF8B", "#B64342", "#42949E", "#9A4D8E", "#CFCECE"],
  },

  // ── NMI Pastel — soft, publication-friendly ──
  nmi_pastel: {
    name: "NMI Pastel",
    description: "Soft pastels for NMI-style figures, baseline vs proposed",
    colors: {
      baseline_dark: "#484878",
      baseline_mid:  "#7884B4",
      baseline_soft: "#B4C0E4",
      ours_tiny:  "#E4E4F0",
      ours_base:  "#E4CCD8",
      ours_large: "#F0C0CC",
      bg_lilac: "#E0E0F0",
      bg_aqua:  "#E0F0F0",
      bg_peach: "#F0E0D0",
      neutral_light: "#D8D8D8",
      neutral_mid:   "#A8A8A8",
      neutral_dark:  "#606060",
      delta_up:   "#2E9E44",
      delta_down: "#E53935",
    },
    defaultSequence: ["#484878", "#7884B4", "#B4C0E4", "#E4E4F0", "#E4CCD8", "#F0C0CC"],
  },

  // ── Nature Imaging — dark background for microscopy ──
  nature_imaging: {
    name: "Nature Imaging",
    description: "Dark background palette for microscopy/volume rendering",
    colors: {
      bg: "#000000",
      context: "#B8B8B8",
      cyan: "#22D7E6",
      magenta: "#FF2AD4",
      white: "#FFFFFF",
    },
    defaultSequence: ["#22D7E6", "#FF2AD4", "#B8B8B8", "#FFFFFF"],
  },

  // ── Nature Material — materials science ──
  nature_material: {
    name: "Nature Material",
    description: "Materials science: aqua/teal + lilac/violet families",
    colors: {
      aqua: "#77D7D1",
      teal: "#33B5A5",
      lilac: "#B9A7E8",
      violet: "#7C6CCF",
      callout_red: "#E53935",
      neutral: "#D9D9D9",
    },
    defaultSequence: ["#77D7D1", "#33B5A5", "#B9A7E8", "#7C6CCF", "#E53935", "#D9D9D9"],
  },

  // ── Nature Clinical — clinical outcome timelines ──
  nature_clinical: {
    name: "Nature Clinical",
    description: "Clinical timelines: baseline + time-point colors",
    colors: {
      baseline: "#272727",
      week6: "#E28E2C",
      week13: "#D24B40",
      week26: "#5B8FD6",
      year1: "#7BAA5B",
      year2: "#C45AD6",
      group_band: "#F2E6D9",
    },
    defaultSequence: ["#272727", "#E28E2C", "#D24B40", "#5B8FD6", "#7BAA5B", "#C45AD6"],
  },

  // ── Nature Genomics — wave patterns ──
  nature_genomics: {
    name: "Nature Genomics",
    description: "Genomics: neutral + wave colors for expression data",
    colors: {
      neutral_light: "#D8D8D8",
      neutral_mid: "#8F8F8F",
      wave1: "#D9544D",
      wave2: "#5B7FCA",
      wave3: "#B89BD9",
      outline: "#4D4D4D",
    },
    defaultSequence: ["#D9544D", "#5B7FCA", "#B89BD9", "#8F8F8F", "#D8D8D8", "#4D4D4D"],
  },

  // ── Publication Soft — high readability, low saturation ──
  publication_soft: {
    name: "Publication Soft",
    description: "Mixed categorical: high readability without saturated primaries",
    colors: {
      green: "#66C2A5",
      orange: "#FC8D62",
      blue_lavender: "#8DA0CB",
      pink: "#E78AC3",
      lime: "#A6D854",
      yellow: "#FFD92F",
      tan: "#E5C494",
      grey: "#B3B3B3",
    },
    defaultSequence: ["#66C2A5", "#FC8D62", "#8DA0CB", "#E78AC3", "#A6D854", "#FFD92F"],
  },

  // ── Blue Rose — agreement/deviation figures ──
  blue_rose: {
    name: "Blue Rose",
    description: "Two-family: cool=agreement, rose/red=deviation",
    colors: {
      cyan: "#87D0E8",
      pale_rose: "#FDF3F3",
      rose: "#F9B7B7",
      deep_red: "#9D2929",
      soft_red: "#F7A8A8",
      coral: "#F76B5A",
      blue: "#1B86F7",
      dusty_rose: "#F298A8",
    },
    defaultSequence: ["#87D0E8", "#1B86F7", "#F9B7B7", "#F76B5A", "#9D2929", "#F298A8"],
  },
};

// ── Font stacks ──
const FONT_STACKS = {
  sans:       "'Arial', 'Helvetica', sans-serif",
  sansAlt:    "'DejaVu Sans', 'Liberation Sans', sans-serif",
  serif:      "'Times New Roman', 'DejaVu Serif', serif",
  monospace:  "'Courier New', 'DejaVu Sans Mono', monospace",
};

// ── Font sizes (pt) ──
const FONT_SIZES = {
  tiny:    5.5,
  small:   6.5,
  body:    7.0,
  label:   8.0,
  title:   9.0,
  large:  12.0,
  huge:   16.0,
};

// ── Helper: get flat color list from a palette's defaultSequence ──
function getPaletteColors(paletteKey) {
  const p = PALETTES[paletteKey];
  if (!p) return PALETTES.classic.defaultSequence;
  return p.defaultSequence || Object.values(p.colors);
}

// ── Helper: get list of all palettes for dropdowns ──
function getPaletteList() {
  return Object.entries(PALETTES).map(([key, p]) => ({
    key,
    name: p.name,
    description: p.description,
  }));
}

window.PALETTES = PALETTES;
window.FONT_STACKS = FONT_STACKS;
window.FONT_SIZES = FONT_SIZES;
window.getPaletteColors = getPaletteColors;
window.getPaletteList = getPaletteList;
