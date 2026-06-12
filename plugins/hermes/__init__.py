"""Hermes plugin for Build with WordPress shared skills."""

from pathlib import Path


def register(ctx):
    root = Path(__file__).parent
    ctx.register_skill("auditing", root / "skills" / "auditing")
    ctx.register_skill("block-creator", root / "skills" / "block-creator")
    ctx.register_skill("design-previews-creator", root / "skills" / "design-previews-creator")
    ctx.register_skill("plugin-creator", root / "skills" / "plugin-creator")
    ctx.register_skill("site-creator", root / "skills" / "site-creator")
    ctx.register_skill("studio", root / "skills" / "studio")
    ctx.register_skill("theme-creator", root / "skills" / "theme-creator")
    ctx.register_skill("wordpress-creator", root / "skills" / "wordpress-creator")
