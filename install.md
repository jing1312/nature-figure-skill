# nature-figure-skill Installation Guide

This repository contains reusable agent skills. Each `skills/nature-*` folder is
one installable skill unit. Install or link the whole folder, not only `SKILL.md`,
because references, assets, and scripts may be required at runtime.

## Repository

```bash
git clone https://github.com/jing1312/nature-figure-skill.git
cd nature-figure-skill
```

To update later:

```bash
git pull
```

If you installed by copying, copy the updated skill folder again after `git pull`.
If you installed by linking, `git pull` is enough; restart the agent.

## Install for Codex

Codex discovers skills from `~/.codex/skills`.

### Copy install

```bash
mkdir -p ~/.codex/skills
cp -R skills/nature-figure ~/.codex/skills/
```

### GitHub installer install

Codex's built-in skill installer can install directly from this repository:

```bash
python ~/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py \
  --url https://github.com/jing1312/nature-figure-skill/tree/main/skills/nature-figure
```

Restart Codex after installing.

## Install for OpenCode

OpenCode discovers skills from `~/.config/opencode/skills` when configured with:

```json
{
  "skills": {
    "paths": ["~/.config/opencode/skills"]
  }
}
```

### Copy install

```bash
mkdir -p ~/.config/opencode/skills
cp -R skills/nature-figure ~/.config/opencode/skills/
```

### Link install

Use a symlink or junction if you want `git pull` updates to apply without copying.
On Windows PowerShell, run from the repository root:

```powershell
New-Item -ItemType Junction `
  -Path "$env:USERPROFILE\.config\opencode\skills\nature-figure" `
  -Target "$(Resolve-Path .\skills\nature-figure)"
```

Restart OpenCode after installing or updating skills.

## Verify

Start a fresh agent session and ask one of these:

```text
Help me choose the best chart type for this result table.
```

```text
Create a Nature-style multi-panel matplotlib figure from this dataset.
```

The agent should load `nature-figure`, define the figure contract, ask for Python
or R if needed, and use `references/figure-selection.md` when the chart type is
unclear.

## Common mistakes

- Do not copy only `skills/nature-figure/SKILL.md`; copy or link the whole folder.
- Restart Codex or OpenCode after installing or updating.
- If you copy instead of link, run the copy step again after `git pull`.
