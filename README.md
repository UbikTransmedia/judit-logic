# LogosCanvas

A visual logic simulator for formatting, evaluating, and proving formulas in Modal Logics (K, T, S4, S5).

## Features

- **Visual World Builder**: Create worlds and relations via Drag & Drop.
- **Real-time Evaluation**: Type a formula and see its truth value in the selected world.
- **Tableaux Prover**: Automatically prove validity or find counter-models for formulas.
- **Logic Systems**: Support for K, T, S4, and S5 modal frames.
- **Public Announcements**: Filter the model by announcing a formula.
- **Import/Export**: Save and load your models as JSON.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run development server:
   ```bash
   npm run dev
   ```

3. Open the URL shown in the terminal (usually `http://localhost:5173`).

## Usage

- **Add World**: Drag "Add World" from sidebar to canvas.
- **Add Relation**: Drag "Add Relation" to canvas (conceptual) OR **Shift + Drag** from one world to another to create an arrow.
- **Select World**: Click a world to select it.
- **Edit Valuation**: Double-click a world to set atoms (e.g., `p:true, q:false`).
- **Evaluate**: Select a world, type formula (e.g., `[]p -> p`) in the bottom panel.
- **Prove**: Type a formula and click "Prove". If invalid, a counter-model is generated.
- **Announce**: Type a formula and click "Announce" to remove worlds where it is false.

## Technical Details

- **Parser**: Nearley.js based BNF grammar.
- **Rendering**: HTML5 Canvas.
- **Logic Engine**: Custom JavaScript implementation of Kripke Semantics and Semantic Tableaux.
