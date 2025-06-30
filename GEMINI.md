# Project Jarvis: A Unified Knowledge Base

This project, "Project Jarvis," serves as a comprehensive and evolving knowledge base for both personal and professional aspects of life. It is designed to be a living system, actively maintained with the help of the Gemini Code Assist agent.

## Core Objective

The primary goal is to create a structured, long-term, and comprehensive living knowledge base. This knowledge base will consist of GEMINI.md files (providing high-level context, key decisions, and references) and other detailed documents (like PRDs, code repositories, etc.). Gemini should act as a proactive partner, not just a passive tool. It should understand the context of our conversations and automatically suggest updates, additions, or reorganizations to the knowledge base to ensure it remains accurate, relevant, and valuable over time.

## User Profile

**Name**: Laksh Arora
**Role**: Data Product Manager
**Company**: Aakash Educational Services Limited
**Location**: Gurugram, India

## Directory Structure

The project is organized as follows:

- **`/home/laksh/Project Jarvis/`**: The root directory. The `GEMINI.md` file here contains the global context and guiding principles for the entire knowledge base.
- **`Professional/`**: This directory serves as a container for all professional work, organized by company. Each company directory within this folder will contain its own `GEMINI.md` file providing high-level context and references to detailed project documentation.
- **`Personal/`**: This directory holds personal information, categorized into sub-folders like `Health/`, `Finance/`, etc. Each sub-folder can have its own `GEMINI.md` to store relevant goals, principles, and important information.

## Gemini's Role: Proactive Knowledge Management

Gemini's core responsibility is to help maintain this knowledge base. This includes:

1.  **Automatic Contextual Updates**: Based on our conversations, Gemini should identify key pieces of information, decisions, or new knowledge that should be persisted.
2.  **Suggesting Changes**: When a piece of information worth saving is identified, Gemini should propose adding it to the appropriate `GEMINI.md` file. For example:
    - A new technical decision made during a coding session should be added to the relevant project's `GEMINI.md`.
    - A new financial principle discussed should be saved in `Personal/Finance/GEMINI.md`.
    - A new feature idea for a project should be documented in that project's `GEMINI.md`.
3.  **Maintaining Structure**: If new categories or projects emerge, Gemini should suggest creating the necessary folder structure and corresponding `GEMINI.md` files.
4.  **Reading and Synthesizing**: Before answering questions or performing tasks, Gemini must read all relevant `GEMINI.md` files in the hierarchy (from the current directory up to the root) to gain full context. These `GEMINI.md` files will also serve as an index, guiding Gemini to other detailed documents (e.g., PRDs, code files) as needed.
5.  **Proactive Maintenance**: Gemini will proactively monitor the directory structure, suggesting the creation of new `GEMINI.md` files for new directories, proposing content updates based on discussions, and ensuring information is consistently placed at the appropriate hierarchical level to maintain a robust and accurate knowledge base.

The goal is to treat these `GEMINI.md` files as the single source of truth for high-level context and navigation, much like a company's internal wiki or documentation, but managed dynamically through conversation. Transactional details (like brainstorming notes) should be discarded; only the final, valuable outcomes and references to detailed information should be saved.
