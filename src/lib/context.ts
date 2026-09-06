import { nestRoleLabel } from "./catalog";
import type { Project, StoryCard } from "./types";

const BODY_CAP = 1800;

function clip(text: string, cap = BODY_CAP) {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= cap) return t;
  return `${t.slice(0, cap - 1).trimEnd()}…`;
}

function npcFallback(card: StoryCard) {
  const n = card.npc;
  if (!n) return "";
  const bits = [
    n.role && `Role: ${n.role}`,
    n.appearance && `Appearance: ${n.appearance}`,
    n.personality && `Personality: ${n.personality}`,
    n.speech && `Speech: ${n.speech}`,
    n.motivations && `Motivations: ${n.motivations}`,
    n.relationships && `Relationships: ${n.relationships}`,
    n.secrets && `Secret: ${n.secrets}`,
    n.abilities && `Abilities: ${n.abilities}`,
    n.quirks && `Quirk: ${n.quirks}`,
  ].filter(Boolean);
  return bits.join(" ");
}

function cardBody(card: StoryCard) {
  const value = card.value.trim();
  if (value) return clip(value);
  const fallback = npcFallback(card);
  if (fallback) return clip(fallback);
  return card.description.trim() ? clip(card.description) : "";
}

function formatCard(card: StoryCard, depth = 0) {
  const indent = depth ? "  " : "";
  const role = card.parentId ? nestRoleLabel(card.nestRole) : card.type;
  const head = `${indent}- ${card.title} [${role}]`;
  const keys = card.keys.trim() ? `${indent}  Triggers: ${card.keys}` : "";
  const body = cardBody(card);
  const entry = body ? `${indent}  ${body}` : `${indent}  (no entry text)`;
  return [head, keys, entry].filter(Boolean).join("\n");
}

function formatTree(cards: StoryCard[], roots: StoryCard[]) {
  const lines: string[] = [];
  const walk = (node: StoryCard, depth: number) => {
    lines.push(formatCard(node, depth));
    for (const child of cards) {
      if (child.parentId === node.id) walk(child, depth + 1);
    }
  };
  for (const root of roots) walk(root, 0);
  return lines.join("\n");
}

export function projectContext(project: Project): string {
  const b = project.brainstorm;
  const s = project.scenario;
  const ids = new Set(project.cards.map((c) => c.id));
  const isRoot = (c: StoryCard) => !c.parentId || !ids.has(c.parentId);
  const npcs = project.cards.filter((c) => c.type === "character" && isRoot(c));
  const factions = project.cards.filter((c) => c.type === "faction" && isRoot(c));
  const locations = project.cards.filter((c) => c.type === "location" && isRoot(c));
  const other = project.cards.filter(
    (c) => isRoot(c) && !["character", "faction", "location"].includes(c.type),
  );
  const lockedIdeas = b.items.filter((i) => i.status === "locked");
  const openIdeas = b.items.filter((i) => i.status === "open");
  const openQs = b.questions.filter((q) => !q.resolved);
  return [
    `Title: ${project.title}`,
    `Core idea: ${b.idea || project.logline || "(none)"}`,
    b.ideaLocked ? "Idea is locked." : "Idea is still open.",
    `Logline: ${project.logline}`,
    `Genres: ${project.genres.join(", ") || "—"}`,
    `Tones: ${project.tones.join(", ") || "—"}`,
    `Tags: ${project.tags.join(", ") || "—"}`,
    `Rating: ${project.rating}`,
    lockedIdeas.length ? `Locked ideas:\n${lockedIdeas.map((i) => `- ${i.text}`).join("\n")}` : "",
    openIdeas.length ? `Open ideas:\n${openIdeas.map((i) => `- ${i.text}`).join("\n")}` : "",
    openQs.length ? `Open questions:\n${openQs.map((q) => `- ${q.question}`).join("\n")}` : "",
    b.notes ? `Pinned notes: ${b.notes}` : "",
    `Opening type: ${s.openingType}`,
    s.publicDescription ? `Public description: ${s.publicDescription}` : "",
    s.prompt ? `Starting prompt: ${s.prompt}` : "",
    s.plotEssentials ? `Plot essentials: ${s.plotEssentials}` : "",
    s.authorsNote ? `Author's note: ${s.authorsNote}` : "",
    s.aiInstructions ? `AI instructions: ${s.aiInstructions}` : "",
    s.storySummary ? `Story summary: ${s.storySummary}` : "",
    s.choices.length
      ? `Multiple-choice openings:\n${s.choices.map((c) => `- ${c.label}: ${c.prompt}`).join("\n")}`
      : "",
    npcs.length
      ? `NPCs (full entries; nested cards are indented under the person):\n${formatTree(project.cards, npcs)}`
      : "NPCs: none",
    factions.length
      ? `Factions:\n${formatTree(project.cards, factions)}`
      : "Factions: none",
    locations.length
      ? `Locations:\n${formatTree(project.cards, locations)}`
      : "Locations: none",
    other.length ? `Other elements:\n${formatTree(project.cards, other)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
