/**
 * FigureForge — Color Palettes
 * Extracted from nature-figure-skill/references/api.md
 * All palettes from the original skill are preserved here as JS objects.
 */

const PALETTES = {
  // ── Curated colour cards (world-famous data-viz palettes) ──
  tableau10: {
    name: "Tableau 10",
    description: "The classic Tableau palette — rich, harmonious, professional",
    colors: {
      blue: "#4E79A7", orange: "#F28E2B", red: "#E15759", teal: "#76B7B2",
      green: "#59A14F", yellow: "#EDC948", purple: "#B07AA1", pink: "#FF9DA7",
      brown: "#9C755F", grey: "#BAB0AC",
    },
    defaultSequence: ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F", "#EDC948", "#B07AA1", "#FF9DA7"],
  },

  tol_muted: {
    name: "Tol Muted",
    description: "Paul Tol's muted scheme — elegant, colour-blind safe",
    colors: {
      indigo: "#332288", cyan: "#88CCEE", teal: "#44AA99", green: "#117733",
      olive: "#999933", sand: "#DDCC77", rose: "#CC6677", wine: "#882255",
      purple: "#AA4499",
    },
    defaultSequence: ["#332288", "#88CCEE", "#44AA99", "#117733", "#999933", "#DDCC77", "#CC6677", "#882255", "#AA4499"],
  },

  seaborn_deep: {
    name: "Seaborn Deep",
    description: "seaborn 'deep' — vivid yet balanced matplotlib classic",
    colors: {
      blue: "#4C72B0", orange: "#DD8452", green: "#55A868", red: "#C44E52",
      purple: "#8172B3", brown: "#937860", pink: "#DA8BC3", grey: "#8C8C8C",
    },
    defaultSequence: ["#4C72B0", "#DD8452", "#55A868", "#C44E52", "#8172B3", "#937860", "#DA8BC3", "#8C8C8C"],
  },

  morandi: {
    name: "Morandi 莫兰迪",
    description: "Dusty Morandi tones — soft, understated, high-class feel",
    colors: {
      mistBlue: "#7C9EB8", dustRose: "#C9A7A7", sage: "#A3BFA0", lilac: "#B5A2C8",
      mustard: "#D9C48A", jade: "#8FB3A9", terracotta: "#C98B7A", slate: "#8C93A8",
    },
    defaultSequence: ["#7C9EB8", "#C9A7A7", "#A3BFA0", "#B5A2C8", "#D9C48A", "#8FB3A9", "#C98B7A", "#8C93A8"],
  },

  economist: {
    name: "Economist Style",
    description: "The Economist chart palette — confident blues with red accent",
    colors: {
      blue: "#006BA2", cyan: "#3EBCD2", red: "#E3120B", teal: "#379A8B",
      yellow: "#EBB434", olive: "#B4BA39", navy: "#104E8B",
    },
    defaultSequence: ["#006BA2", "#3EBCD2", "#E3120B", "#379A8B", "#EBB434", "#B4BA39"],
  },

  macaron: {
    name: "Macaron 马卡龙",
    description: "Pastel macaron card — airy and sweet, great for soft stories",
    colors: {
      sky: "#A8D8EA", wisteria: "#AA96DA", blush: "#FCBAD3", cream: "#F7EFC7",
      steel: "#95ADBE", peach: "#F4E1D2", mint: "#B5EAD7", coral: "#FF9AA2",
    },
    defaultSequence: ["#A8D8EA", "#AA96DA", "#FCBAD3", "#95ADBE", "#B5EAD7", "#FF9AA2", "#F4E1D2", "#F7EFC7"],
  },

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

  // ── Candy — five-hue pop: pink/blue/green/yellow/purple ──
  candy: {
    name: "Candy 粉蓝绿黄紫",
    description: "Five-hue pairing: pink/blue/green/yellow/purple — vivid yet soft, 2x2 color pairs or standalone",
    colors: {
      blue: "#5B8FDB", pink: "#EC6F9F", green: "#43B39C", yellow: "#F2C14E", purple: "#9C7BD8",
      rose: "#E58FB1", sky: "#6FC2D0", lilac: "#C9A7E8",
    },
    defaultSequence: ["#5B8FDB", "#EC6F9F", "#43B39C", "#F2C14E", "#9C7BD8", "#E58FB1", "#6FC2D0", "#C9A7E8"],
  },

  // ── Berry — one blue-to-purple-to-pink family, deep to light ──
  berry_blue: {
    name: "Berry 蓝紫粉同族",
    description: "Single family, deep to light: blue to purple to pink; ideal for two-series gradient contrast",
    colors: {
      deep_blue: "#3D6BB3", purple: "#7C6FD0", magenta: "#C9699B",
      soft_pink: "#E8A5C2", light_blue: "#A8C6E8", pale_lilac: "#D4D0EE",
    },
    defaultSequence: ["#3D6BB3", "#7C6FD0", "#C9699B", "#E8A5C2", "#A8C6E8", "#D4D0EE"],
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
