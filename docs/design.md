# DESIGN.md — Raycast

## Overview
Raycast's design system optimizes for speed and delight. A warm red accent on deep navy surfaces creates energy without overwhelm. The interface is designed for keyboard-first interaction with smooth 60fps animations and tight information density.

## Colors

### Primary Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `color-brand` | `#FF6363` | Brand red, primary accent |
| `color-bg` | `#1A1A2E` | App background |
| `color-text` | `#FFFFFF` | Primary text |
| `color-muted` | `#E4E4E4` | Secondary text |
| `color-surface` | `#2A2A3E` | Input surfaces |

## Typography

| Role | Family | Size | Weight |
|------|--------|------|--------|
| Title | Inter | 24px | 700 |
| Heading | Inter | 18px | 600 |
| Body | Inter | 14px | 400 |
| Detail | Inter | 12px | 400 |

## Components

### Command Palette
- Full-screen overlay, blurred backdrop
- Large search input at top
- Results with icon, title, subtitle, hotkey
- Smooth keyboard navigation with spring animation

### Extension Card
- Icon (64px), name, author, install count
- Preview screenshots carousel
- Install button in brand red

## Do's and Don'ts

### Do
- Design for keyboard-first interaction
- Use spring animations (200ms, no bounce)
- Show keyboard shortcuts prominently

### Don't
- Don't use the red for error states (use orange instead)
- Don't make click targets smaller than 32px
- Don't show loading spinners — use skeleton states