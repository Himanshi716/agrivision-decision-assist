export interface LearnTopic {
  id: string;
  item: string;
  emoji: string;
  summary: string;
  stages: { label: string; color: string; description: string }[];
  spoilageSigns: string[];
  tips: string[];
}

export const learnTopics: LearnTopic[] = [
  {
    id: "banana",
    item: "Banana",
    emoji: "🍌",
    summary:
      "Bananas progress through clear visual stages. Color, spotting, and surface wrinkling are the strongest indicators of edibility.",
    stages: [
      { label: "Green / Unripe", color: "var(--success)", description: "Firm, starchy. Best for cooking." },
      { label: "Slightly yellow", color: "var(--warning)", description: "Almost ripe — sweetens in 1–2 days." },
      { label: "Fully ripe", color: "var(--accent)", description: "Even yellow, minimal spots. Peak eating quality." },
      { label: "Overripe", color: "var(--warning)", description: "Heavy spotting — great for baking & smoothies." },
      { label: "Spoiled", color: "var(--destructive)", description: "Brown/black peel, soft, leaking. Avoid." },
    ],
    spoilageSigns: [
      "Mold at the stem",
      "Leaking liquid through the peel",
      "Strong fermented odor",
      "Mushy, collapsed shape",
    ],
    tips: [
      "Look for slight angularity — flat-sided bananas store better.",
      "Small brown spots are sweetness, not spoilage.",
      "Separate from the bunch to slow ripening.",
    ],
  },
  {
    id: "tomato",
    item: "Tomato",
    emoji: "🍅",
    summary: "Choose tomatoes by deep, even color, firm skin, and the smell at the stem.",
    stages: [
      { label: "Green", color: "var(--success)", description: "Unripe — ripens at room temp." },
      { label: "Pink / Turning", color: "var(--warning)", description: "Sweetens within 2–3 days." },
      { label: "Red ripe", color: "var(--accent)", description: "Best flavor and aroma." },
      { label: "Soft / Wrinkled", color: "var(--destructive)", description: "Past peak — use in sauces." },
    ],
    spoilageSigns: ["Mold at stem cap", "Cracked or weeping skin", "Squishy collapse on press"],
    tips: ["Store stem-down at room temp", "Refrigeration kills flavor"],
  },
  {
    id: "apple",
    item: "Apple",
    emoji: "🍎",
    summary: "Apples should feel heavy for their size with taut, glossy skin.",
    stages: [
      { label: "Crisp & fresh", color: "var(--success)", description: "Snaps when bitten." },
      { label: "Mealy", color: "var(--warning)", description: "Texture softening — bake or sauce." },
      { label: "Bruised / Brown", color: "var(--destructive)", description: "Discard bruised flesh." },
    ],
    spoilageSigns: ["Soft brown patches", "Wrinkled skin", "Fermented smell"],
    tips: ["Refrigerate to extend life by weeks", "One bad apple really does spoil the bunch — ethylene gas"],
  },
];

export const itemTypes = [
  { value: "Banana", emoji: "🍌" },
  { value: "Tomato", emoji: "🍅" },
  { value: "Apple", emoji: "🍎" },
  { value: "Mango", emoji: "🥭" },
  { value: "Potato", emoji: "🥔" },
  { value: "Onion", emoji: "🧅" },
  { value: "Carrot", emoji: "🥕" },
  { value: "Other", emoji: "🌿" },
];