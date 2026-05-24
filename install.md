# nature-skills Installation Guide

This file explains how to install the skills in this repository so they are actually usable in coding agents such as Codex and Claude Code.

The most important point is simple:

- `nature-skills` is **not** a Python package or npm package
- each `skills/nature-*` folder is one reusable skill unit
- in most cases, you should copy or reference the **entire folder**, not only `SKILL.md`

Why that matters:

- many skills depend on `references/`
- some skills also use `README.md` as supporting context
- copying only `SKILL.md` can silently break the workflow

---

## 1. What gets installed

Each installable skill lives under `skills/` and is centred on `SKILL.md`.
Some also include `README.md`, `references/`, assets, scripts, or eval files.

Typical examples:

```text
skills/nature-<topic>/
├── SKILL.md
├── README.md              # common, but not guaranteed
├── references/            # present for some skills
└── ...
```

Examples in this repository:

- `nature-polishing`
- `nature-writing`
- `nature-figure`
- `nature-citation`
- `nature-data`
- `nature-reader`
- `nature-paper2ppt`
- `nature-response`

If you want one skill, install one folder.
If you want the full collection, install all `skills/nature-*` folders.

---

## 2. Quick choice

Choose the path that matches your agent:

- **Codex**: best if you want native skill-folder loading
- **Claude Code**: best if you want terminal-based agent workflows, but you need a thin wrapper because Claude Code does not natively consume Codex-style skill folders
- **Other agents**: use the whole skill folder as a reusable prompt bundle

---

## 3. Install for Codex

Codex is the cleanest target for this repository because it can use local skill folders directly.

### 3.1 Clone the repository

```bash
git clone https://github.com/Yuan1z0825/nature-skills.git
cd nature-skills
```

### 3.2 Install one skill

Example: install `nature-polishing`

```bash
mkdir -p ~/.codex/skills
cp -R skills/nature-polishing ~/.codex/skills/
```

### 3.3 Install all current skills

```bash
mkdir -p ~/.codex/skills
for d in skills/nature-*; do
  cp -R "$d" ~/.codex/skills/
done
```

### 3.4 Verify

Start a fresh Codex session and ask for a task that clearly matches the skill, for example:

```text
Polish this abstract in Nature style.
```

or

```text
Turn this paper into a Chinese journal-club PPT.
```

If the installed skill is discovered correctly, Codex should use the skill-specific workflow instead of answering with a generic one-shot response.

### 3.5 Update later

When this repository changes:

```bash
cd /path/to/nature-skills
git pull
cp -R skills/nature-polishing ~/.codex/skills/
```

If you installed all skills, re-copy all `skills/nature-*` folders after pulling.

### 3.6 Common Codex mistake

Do **not** do this:

```bash
cp skills/nature-polishing/SKILL.md ~/.codex/skills/
```

That copies only one file and drops the rest of the skill bundle.

Use this instead:

```bash
cp -R skills/nature-polishing ~/.codex/skills/
```

---

## 4. Install for Claude Code

Claude Code does **not** currently load a `nature-*` folder as a native skill in the same way Codex does.

The practical solution is:

1. keep a local clone of this repository
2. create a small Claude Code wrapper
3. let that wrapper tell Claude Code to read the real `SKILL.md` from this repository

This keeps the original skill structure intact and avoids breaking supporting files such as `references/`, `README.md`, assets, or scripts when a skill depends on them.

Official Claude Code documentation:

- Setup: <https://docs.anthropic.com/en/docs/claude-code/setup>
- Subagents: <https://docs.anthropic.com/en/docs/claude-code/sub-agents>
- Slash commands: <https://docs.anthropic.com/en/docs/claude-code/slash-commands>

### 4.1 Install Claude Code first

If you have not installed Claude Code yet:

```bash
npm install -g @anthropic-ai/claude-code
claude
```

### 4.2 Clone this repository to a stable local path

Example:

```bash
mkdir -p ~/ai-skills
cd ~/ai-skills
git clone https://github.com/Yuan1z0825/nature-skills.git
```

In the examples below, the repository path is:

```text
~/ai-skills/nature-skills
```

If you use a different path, replace it consistently.

### 4.3 Recommended method: create a subagent wrapper

Create a user-level subagent:

```bash
mkdir -p ~/.claude/agents
cat > ~/.claude/agents/nature-polishing.md <<'EOF'
---
name: nature-polishing
description: Use proactively for Nature-style academic polishing, restructuring, or Chinese-to-English manuscript refinement.
---

When invoked, first read `~/ai-skills/nature-skills/skills/nature-polishing/SKILL.md`.
Treat that file as the governing workflow.
If the skill references supporting files, read only the specific files you need from
`~/ai-skills/nature-skills/skills/nature-polishing/`.
Do not replace the skill with a generic polishing response.
EOF
```

Then start a new Claude Code session and ask:

```text
Use the nature-polishing subagent to revise this abstract.
```

### 4.4 Alternative method: create a slash command wrapper

If you prefer a command instead of a subagent:

```bash
mkdir -p ~/.claude/commands
cat > ~/.claude/commands/nature-polishing.md <<'EOF'
Read `~/ai-skills/nature-skills/skills/nature-polishing/SKILL.md` first and follow it strictly.
Read any directly needed supporting files from `~/ai-skills/nature-skills/skills/nature-polishing/`.

$ARGUMENTS
EOF
```

Then inside Claude Code:

```text
/nature-polishing Rewrite this abstract for Nature.
```

### 4.5 Why this wrapper approach is better than copying only `SKILL.md`

This repository was not designed as a single-file Claude Code prompt pack.

If you only copy `SKILL.md` into `~/.claude/agents/` and leave the rest behind:

- relative supporting material is no longer colocated
- future updates in the original repository are harder to reuse
- some skills become incomplete in practice

Keeping the repo cloned and pointing Claude Code at the real folder is more robust.

### 4.6 Install more skills for Claude Code

Repeat the same pattern for other folders:

- `nature-figure`
- `nature-citation`
- `nature-data`
- `nature-reader`
- `nature-paper2ppt`

For example, a `nature-paper2ppt` wrapper should point to:

```text
~/ai-skills/nature-skills/skills/nature-paper2ppt/SKILL.md
```

The same pattern works for `nature-reader`:

```text
~/ai-skills/nature-skills/skills/nature-reader/SKILL.md
```

### 4.7 Update later

```bash
cd ~/ai-skills/nature-skills
git pull
```

If your wrapper points to this stable clone path, no further reinstall step is needed.

---

## 5. Install for other agents

If your agent supports reusable prompt folders, profile files, or custom system prompts, use the real skill directory under `skills/` as the portable unit:

```text
skills/nature-<topic>/
├── SKILL.md
├── README.md              # common, but not guaranteed
├── references/            # present for some skills
└── ...
```

Recommended rule:

1. copy the full skill directory
2. preserve `SKILL.md` and `references/` together
3. adapt only the outer wrapper format required by the target agent

---

## 6. Which method should you use?

### Use Codex if:

- you want the most direct installation path
- you want to copy folders into `~/.codex/skills/` and use them immediately

### Use Claude Code if:

- you already work in Claude Code
- you are comfortable using subagents or slash commands as wrappers

### Use manual folder reuse if:

- your agent has no native skill system
- you still want the writing rules, references, and workflow as a reusable bundle

---

## 7. Troubleshooting

### Problem: the agent gives a generic answer instead of using the skill

Check:

- did you install the full `skills/nature-*` folder rather than only `SKILL.md`?
- did you start a fresh session after installation?
- are you asking for a task that clearly matches the skill?

### Problem: Claude Code wrapper exists but results are weak

Check:

- does the wrapper point to the correct local clone path?
- does that path still exist?
- did you explicitly tell Claude Code to use the subagent or slash command?

### Problem: updates in GitHub are not reflected locally

Run:

```bash
git pull
```

Then:

- for Codex, copy the updated folder(s) again
- for Claude Code wrappers, no reinstall is needed if the wrapper still points to the same clone path

---

## 8. Minimal examples

### Codex: one-skill install

```bash
git clone https://github.com/Yuan1z0825/nature-skills.git
cd nature-skills
mkdir -p ~/.codex/skills
cp -R skills/nature-polishing ~/.codex/skills/
```

### Codex: full install

```bash
git clone https://github.com/Yuan1z0825/nature-skills.git
cd nature-skills
mkdir -p ~/.codex/skills
for d in skills/nature-*; do
  cp -R "$d" ~/.codex/skills/
done
```

### Claude Code: one subagent wrapper

```bash
npm install -g @anthropic-ai/claude-code
mkdir -p ~/ai-skills
cd ~/ai-skills
git clone https://github.com/Yuan1z0825/nature-skills.git
mkdir -p ~/.claude/agents
cat > ~/.claude/agents/nature-polishing.md <<'EOF'
---
name: nature-polishing
description: Use proactively for Nature-style academic polishing, restructuring, or Chinese-to-English manuscript refinement.
---

When invoked, first read `~/ai-skills/nature-skills/skills/nature-polishing/SKILL.md`.
Treat that file as the governing workflow.
If the skill references supporting files, read only the specific files you need from
`~/ai-skills/nature-skills/skills/nature-polishing/`.
EOF
```

---

## 9. Final recommendation

If you only want the simplest path, use:

- **Codex** for direct skill-folder installation

If you mainly work in Claude Code, use:

- **a stable local clone of this repository**
- **thin wrappers in `~/.claude/agents/` or `~/.claude/commands/`**

That gives you a setup that is easy to update and does not discard the structure each skill depends on.
