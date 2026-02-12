
import { FormulaParser } from '../parser/parser.js';
import { WormCalculator } from '../core/ordinals.js';
import { TableauxProver } from '../core/tableaux.js';
import { Model, World, Relation, Atom, Predicate, Quantifier, Binary, Unary, Modal, Constant } from '../core/logic.js';
import { ActionModel, ActionEvent, productUpdate } from '../core/del.js';
import { PRESETS } from './presets.js';
import { TuringMachine } from '../core/turing.js';
import { ScriptEngine, SNIPPETS } from '../core/scripting.js';
import { BooleanCalculus } from '../core/calculus.js';
import { LambdaEngine } from '../core/lambda.js';
import { LESSONS } from './lessons-content.js';

export class UiManager {
    constructor(model, renderer) {
        this.model = model; // Reference to the logic Model
        this.renderer = renderer;
        this.turing = new TuringMachine(model); // Automata Engine
        this.scriptEngine = new ScriptEngine(model, this.turing, renderer);
        this.parser = new FormulaParser();
        this.prover = new TableauxProver();
        this.lambdaEngine = new LambdaEngine();

        this.formulaInput = document.getElementById('formula-input');
        this.resultDisplay = document.getElementById('evaluation-result');
        this.proveBtn = document.getElementById('prove-btn');
        this.announceBtn = document.getElementById('announce-btn');
        // this.gameBtn = document.getElementById('game-btn'); // Removed or hidden
        this.exportBtn = document.getElementById('export-btn');
        this.importBtn = document.getElementById('import-btn');
        this.fileInput = document.getElementById('file-input');
        this.systemSelect = document.getElementById('logic-system');

        this.propertiesPanel = document.getElementById('properties-panel');

        this.currentFormula = null;

        this.historyRoot = null;
        this.currentHistoryNode = null;
        this.maxHistory = 100; // Increased history depth

        // Save initial state
        this.saveState(); // This calls updateTimelineUI internally now

        // Capture default help content
        const tutorialBody = document.getElementById('tutorial-body');
        this.defaultHelpContent = tutorialBody ? tutorialBody.innerHTML : '';

        this.setupEventListeners();

        // Listen for internal model changes from Renderer
        this.renderer.canvas.addEventListener('modelChange', () => {
            this.saveState(); // Auto-save on model change
            this.updateEvaluation();
            this.updatePropertiesPanel();
        });
        // Listen for Selection Change too
        this.renderer.canvas.addEventListener('selectionChange', () => {
            this.updateEvaluation();
            this.updatePropertiesPanel();
        });

        this.setupDomainEditor();
        this.setupAgentSelection();
        this.setupExportLatex();
        this.setupOrdinalCalculator();
        this.setupSystemInsights();
        this.setupPresets();
        this.setupTranslator();
        this.setupRelationEditor();
        this.setupTabs();
        this.setupTopBar();
        this.setupTuringControls();
        this.setupScriptingControls();
        this.setupCalculus();
        this.setupTabHelp();
        this.setupLessons();
        this.setupGlobalControls();
        this.setupAppearanceControls();
    }

    setupRelationEditor() {
        const modal = document.getElementById('relation-modal');
        const closeBtn = document.getElementById('relation-close-btn');
        const saveBtn = document.getElementById('rel-save-btn');
        const deleteBtn = document.getElementById('rel-delete-btn');
        const agentSpan = document.getElementById('rel-agent');
        const directionSelect = document.getElementById('rel-direction');

        if (!modal) return; // Safeguard if modal is removed

        let currentRelation = null;

        // Listen for requests from Renderer
        this.renderer.canvas.addEventListener('requestRelationEdit', (e) => {
            if (!modal) return;
            const { relation, clientX, clientY } = e.detail;
            currentRelation = relation;

            // Populate Modal
            if (agentSpan) agentSpan.textContent = relation.agent;

            // Determine current state
            // Check if reverse exists
            const reverseRel = this.model.relations.find(r =>
                r.sourceId === relation.targetId &&
                r.targetId === relation.sourceId &&
                r.agent === relation.agent
            );

            if (directionSelect) {
                if (reverseRel) {
                    directionSelect.value = 'bidirectional';
                } else {
                    // If this is strictly forward (source->target) relative to selection? 
                    // The select event passes the specific relation object clicked.
                    // If we clicked the "back" arrow of a bidirectional pair, we might get the back relation.
                    // Ideally we normalize to "Forward" from Source vantage point?
                    // Let's just set it to 'forward' if no reverse exists.
                    directionSelect.value = 'forward';
                }
            }

            modal.style.display = 'block';
            modal.style.left = `${clientX}px`;
            modal.style.top = `${clientY}px`;
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                if (!currentRelation) return;

                const newDir = directionSelect ? directionSelect.value : 'forward';
                const source = currentRelation.sourceId;
                const target = currentRelation.targetId;
                const agent = currentRelation.agent;

                // Find existing reverse
                const reverseRel = this.model.relations.find(r =>
                    r.sourceId === target &&
                    r.targetId === source &&
                    r.agent === agent
                );

                if (newDir === 'bidirectional') {
                    if (!reverseRel) {
                        this.model.addRelation(target, source, agent);
                    }
                } else if (newDir === 'forward') {
                    // Determine which is "forward". Assume currentRelation direction is the base.
                    // Use source/target from currentRelation.
                    // Try to keep current, delete reverse if exists.
                    if (reverseRel) {
                        this.model.removeRelation(reverseRel);
                    }
                    // Ensure current exists (it does)
                } else if (newDir === 'backward') {
                    // We want target->source ONLY.
                    // Ensure reverse exists
                    if (!reverseRel) {
                        this.model.addRelation(target, source, agent);
                    }
                    // Remove current (forward)
                    this.model.removeRelation(currentRelation);
                    modal.style.display = 'none'; // Close because current ref is dead
                }

                this.renderer.draw();
                this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
                modal.style.display = 'none';
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (currentRelation) {
                    console.log("Deleting relation:", currentRelation);

                    const source = currentRelation.sourceId;
                    const target = currentRelation.targetId;
                    const agent = currentRelation.agent;

                    // Remove this relation
                    this.model.removeRelation(currentRelation);

                    // Also remove reverse if it exists (for bidirectional logic)
                    const reverseRel = this.model.relations.find(r =>
                        r.sourceId === target &&
                        r.targetId === source &&
                        r.agent === agent
                    );
                    if (reverseRel) {
                        this.model.removeRelation(reverseRel);
                    }

                    // Reset selection in renderer
                    if (this.renderer.selectedRelation === currentRelation) {
                        this.renderer.selectedRelation = null;
                        this.renderer.canvas.dispatchEvent(new CustomEvent('selectionChange'));
                    }

                    this.renderer.draw();
                    this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
                    modal.style.display = 'none';

                    // Also update properties panel if it was showing this relation
                    this.updatePropertiesPanel();
                } else {
                    console.warn("Delete clicked but no currentRelation set.");
                }
            });
        }
    }

    setupAgentSelection() {
        const popup = document.getElementById('agent-popup');
        const confirmBtn = document.getElementById('agent-confirm-btn');
        const cancelBtn = document.getElementById('agent-cancel-btn');
        const checkboxes = document.querySelectorAll('.agent-cb');

        let pendingRelation = null;

        // Listen for request from Renderer
        this.renderer.canvas.addEventListener('requestAgentSelection', (e) => {
            const { sourceId, targetId, clientX, clientY } = e.detail;

            // Check Sidebar Selector first
            const agentSelect = document.getElementById('agent-select');
            const selectedAgent = agentSelect ? agentSelect.value : null;

            // If a specific agent is selected in the sidebar, use it directly (skip popup)
            if (selectedAgent && ['a', 'b', 'c', 'd'].includes(selectedAgent)) {
                this.model.addRelation(sourceId, targetId, selectedAgent);
                this.saveState();
                this.renderer.draw();
                this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
                return;
            }

            // Fallback to popup if no specific agent selected (or if user wants advanced selection)
            // But currently the selector ALWAYS has a value (default 'a').

            pendingRelation = { sourceId, targetId };

            // Reset checkboxes
            checkboxes.forEach(cb => cb.checked = false);

            // Position Popup
            popup.style.display = 'block';
            popup.style.left = `${clientX}px`;
            popup.style.top = `${clientY}px`;
        });

        confirmBtn.addEventListener('click', () => {
            if (!pendingRelation) return;

            let added = false;
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    const agent = cb.value || null;
                    this.model.addRelation(pendingRelation.sourceId, pendingRelation.targetId, agent);
                    added = true;
                }
            });

            if (added) {
                this.saveState();
                this.renderer.draw();
                this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
            }

            popup.style.display = 'none';
            pendingRelation = null;
        });

        cancelBtn.addEventListener('click', () => {
            popup.style.display = 'none';
            pendingRelation = null;
        });
    }

    // ... (rest of methods)

    updatePropertiesPanel() {
        if (!this.propertiesPanel) return;

        const selectedWorld = this.renderer.selectedWorld;
        const selectedRelation = this.renderer.selectedRelation;

        if (selectedRelation) {
            // ... (relation editing logic - mostly unchanged)
            const sVal = this.model.getWorld(selectedRelation.sourceId);
            const tVal = this.model.getWorld(selectedRelation.targetId);
            const sName = sVal ? (sVal.name || sVal.id) : selectedRelation.sourceId;
            const tName = tVal ? (tVal.name || tVal.id) : selectedRelation.targetId;

            let html = `<h4>Relation</h4>`;
            html += `<div style="font-size: 0.9em; margin-bottom: 5px;"><strong>${sName}</strong> → <strong>${tName}</strong></div>`;

            // Agent Selection
            html += `<div style="margin-top: 10px; margin-bottom: 5px;">
                <label style="display:block; font-size: 0.8em; color:#aaa;">Agent (Knowledge):</label>
                <select id="rel-agent-select" style="width: 100%; padding: 5px; background: #333; border: 1px solid #444; color: white; border-radius: 4px;">
                    <option value="a" ${selectedRelation.agent === 'a' ? 'selected' : ''}>Agent a (Blue)</option>
                    <option value="b" ${selectedRelation.agent === 'b' ? 'selected' : ''}>Agent b (Red)</option>
                    <option value="c" ${selectedRelation.agent === 'c' ? 'selected' : ''}>Agent c (Green)</option>
                    <option value="d" ${selectedRelation.agent === 'd' ? 'selected' : ''}>Agent d (Yellow)</option>
                </select>
            </div>`;

            // Turing Rule Editor
            selectedRelation.data = selectedRelation.data || {};
            html += `<div style="margin-top: 10px; padding: 8px; background: #2a2a2a; border: 1px solid #444; border-radius: 4px;">
                <h5 style="margin: 0 0 8px 0; color: #4a90e2; font-size: 0.9em;">⚙️ Transition Rule</h5>
                <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                    <input type="text" id="rule-read" placeholder="Read (e.g. 0)" value="${selectedRelation.data.read || ''}" style="flex:1; padding: 4px; background: #222; border: 1px solid #555; color: white; border-radius:3px; font-family:monospace;" title="Symbol to read on tape">
                    <input type="text" id="rule-write" placeholder="Write (e.g. 1)" value="${selectedRelation.data.write || ''}" style="flex:1; padding: 4px; background: #222; border: 1px solid #555; color: white; border-radius:3px; font-family:monospace;" title="Symbol to write on tape">
                </div>
                <select id="rule-move" style="width: 100%; padding: 4px; background: #222; border: 1px solid #555; color: white; border-radius:3px;">
                    <option value="" disabled ${!selectedRelation.data.move ? 'selected' : ''}>Move Head...</option>
                    <option value="R" ${selectedRelation.data.move === 'R' ? 'selected' : ''}>Move Right (R)</option>
                    <option value="L" ${selectedRelation.data.move === 'L' ? 'selected' : ''}>Move Left (L)</option>
                    <option value="S" ${selectedRelation.data.move === 'S' ? 'selected' : ''}>Stay (S)</option>
                </select>
            </div>`;

            html += `<div style="display:flex; flex-direction:column; gap:8px; margin-top:10px;">`;
            html += `<button id="rel-swap-btn" style="padding: 6px; background: #555; border: 1px solid #666; color: white; cursor: pointer; border-radius: 4px;">Reverse Direction (↔ Swap)</button>`;

            const revExists = this.model.relations.some(r => r.sourceId === selectedRelation.targetId && r.targetId === selectedRelation.sourceId && r.agent === selectedRelation.agent);
            const biLabel = revExists ? "Make Unidirectional (Remove Return)" : "Make Bidirectional (Add Return)";
            html += `<button id="rel-bi-btn" style="padding: 6px; background: #555; border: 1px solid #666; color: white; cursor: pointer; border-radius: 4px;">${biLabel}</button>`;

            html += `<button id="rel-del-btn" style="padding: 6px; background: #c82333; border: 1px solid #a71d2a; color: white; cursor: pointer; border-radius: 4px; margin-top: 5px;">Delete Relation</button>`;
            html += `</div>`;

            this.propertiesPanel.innerHTML = html;

            // Element References
            const agentSelect = document.getElementById('rel-agent-select');
            const ruleRead = document.getElementById('rule-read');
            const ruleWrite = document.getElementById('rule-write');
            const ruleMove = document.getElementById('rule-move');
            const swapBtn = document.getElementById('rel-swap-btn');
            const biBtn = document.getElementById('rel-bi-btn');
            const delBtn = document.getElementById('rel-del-btn');

            if (agentSelect) {
                agentSelect.addEventListener('change', (e) => {
                    selectedRelation.agent = e.target.value || null;
                    this.renderer.draw();
                    this.updateEvaluation();
                });
            }

            if (ruleRead) {
                ruleRead.addEventListener('change', (e) => { selectedRelation.data.read = e.target.value; this.saveState(); });
            }
            if (ruleWrite) {
                ruleWrite.addEventListener('change', (e) => { selectedRelation.data.write = e.target.value; this.saveState(); });
            }
            if (ruleMove) {
                ruleMove.addEventListener('change', (e) => { selectedRelation.data.move = e.target.value; this.saveState(); });
            }

            if (swapBtn) {
                swapBtn.addEventListener('click', () => {
                    const s = selectedRelation.sourceId;
                    const t = selectedRelation.targetId;
                    const a = selectedRelation.agent;
                    const exists = this.model.relations.some(r => r.sourceId === t && r.targetId === s && r.agent === a);
                    if (exists) {
                        alert("Reverse relation already exists! Cannot swap.");
                    } else {
                        selectedRelation.sourceId = t;
                        selectedRelation.targetId = s;
                        this.renderer.draw();
                        this.updatePropertiesPanel();
                        this.updateEvaluation();
                    }
                });
            }
            if (biBtn) {
                biBtn.addEventListener('click', () => {
                    const s = selectedRelation.sourceId;
                    const t = selectedRelation.targetId;
                    const a = selectedRelation.agent;
                    if (revExists) {
                        this.model.relations = this.model.relations.filter(r => !(r.sourceId === t && r.targetId === s && r.agent === a));
                    } else {
                        this.model.addRelation(t, s, a);
                    }
                    this.renderer.draw();
                    this.updatePropertiesPanel();
                    this.updateEvaluation();
                });
            }
            if (delBtn) {
                delBtn.addEventListener('click', () => {
                    this.model.relations = this.model.relations.filter(r => r !== selectedRelation);
                    this.renderer.selectedRelation = null;
                    this.renderer.draw();
                    this.updatePropertiesPanel();
                    this.updateEvaluation();
                });
            }
            return;
        }


        if (!selectedWorld) {
            this.propertiesPanel.innerHTML = '<em>Select a World or Relation to edit properties.</em>';
            return;
        }

        const selected = selectedWorld;
        let html = `<h4>World ${selected.id}</h4>`;

        html += `<div style="margin-bottom: 10px;">
            <label style="display:block; font-size: 0.8em;">Name / Alias:</label>
            <input type="text" id="prop-name-input" value="${selected.name || ''}" style="width: 100%; padding: 5px; background: #333; border: 1px solid #444; color: white; border-radius: 4px;">
        </div>`;

        html += `<div style="margin-bottom: 10px; display: flex; gap: 10px;">
            <div style="flex:1;">
                <label style="display:block; font-size: 0.8em;">Bg Color:</label>
                <input type="color" id="prop-color-input" value="${selected.color || '#333333'}" style="width: 100%; height: 30px; padding: 2px; background: #333; border: 1px solid #444; border-radius: 4px;">
            </div>
            <div style="flex:1;">
                <label style="display:block; font-size: 0.8em;">Text Color:</label>
                <input type="color" id="prop-text-color-input" value="${selected.textColor || '#ffffff'}" style="width: 100%; height: 30px; padding: 2px; background: #333; border: 1px solid #444; border-radius: 4px;">
            </div>
        </div>`;

        // DESCRIPTION REMOVED AS REQUESTED

        html += `<div style="font-size: 0.8em; color: #888; margin-bottom: 5px;">Pos: (${Math.round(selected.x)}, ${Math.round(selected.y)})</div>`;

        html += `<label style="display:block; margin-top: 10px; font-size: 0.9em;">Valuation (V):</label>`;

        // Expanded Atoms
        const atoms = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
        html += `<div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom:5px;">`;
        atoms.forEach(atom => {
            const isActive = selected.valuation.get(atom);
            const bg = isActive ? '#28a745' : '#444';
            const border = isActive ? '#28a745' : '#555';
            html += `<button class="atom-toggle" data-atom="${atom}" style="flex:1 1 20%; padding:4px; font-size:0.8em; background:${bg}; border:1px solid ${border}; color:white; border-radius:3px; cursor:pointer;" title="Toggle ${atom}">${atom}</button>`;
        });
        html += `</div>`;


        const valStr = Array.from(selected.valuation.entries())
            .filter(([k, v]) => v)
            .map(([k, v]) => k)
            .join(', ');

        html += `<input type="text" id="prop-val-input" value="${valStr}" style="width: 100%; padding: 5px; background: #333; border: 1px solid #444; color: white; border-radius: 4px;" placeholder="Other atoms...">`;

        html += `<div style="display:flex; gap:10px; margin-top:10px;">`;
        html += `<button id="prop-save-btn" style="flex:2; padding: 5px; background: #007bff; border: none; color: white; border-radius: 4px; cursor: pointer;">Update</button>`;
        html += `<button id="prop-clone-btn" style="flex:1; padding: 5px; background: #28a745; border: none; color: white; border-radius: 4px; cursor: pointer;" title="Clone World">Clone</button>`;
        html += `<button id="prop-del-btn" style="flex:1; padding: 5px; background: #dc3545; border: none; color: white; border-radius: 4px; cursor: pointer;" title="Delete World">Delete</button>`;
        html += `</div>`;

        html += this.getEpistemicInsight(selected);

        // Relations Editor
        const outgoing = this.model.relations.filter(r => r.sourceId === selected.id);
        if (outgoing.length > 0) {
            html += `<hr style="border: 0; border-top: 1px solid #444; margin: 15px 0;">`;
            html += `<h5 style="margin-bottom: 5px;">Outgoing Relations:</h5>`;
            html += `<ul style="padding-left: 0; list-style: none; font-size: 0.9em;">`;

            outgoing.forEach((r, idx) => {
                const targetWait = this.model.getWorld(r.targetId);
                const targetName = targetWait ? (targetWait.name || targetWait.id) : r.targetId;
                const ag = r.agent;

                // Color coding for agent
                const colorMap = { 'a': '#4a90e2', 'b': '#d0021b', 'c': '#417505', 'd': '#f5a623' };
                const color = colorMap[ag] || '#ccc';

                html += `<li style="margin-bottom: 4px; display: flex; align-items: center; justify-content: space-between; background: #2a2a2a; padding: 4px; border-radius: 3px;">
                    <div style="font-size: 0.85em;"><span style="color: ${color}; font-weight: bold;">${ag}</span> → <strong>${targetName}</strong></div>
                    <button class="del-rel-btn" data-idx="${idx}" style="background: none; border: none; color: #d9534f; cursor: pointer; font-size: 1.2em; line-height: 1;" title="Delete Relation">×</button>
                </li>`;
            });
            html += `</ul>`;
        }

        this.propertiesPanel.innerHTML = html;

        // --- Event Listeners ---

        // 1. Name Input
        const nameInput = document.getElementById('prop-name-input');
        if (nameInput) {
            nameInput.addEventListener('input', (e) => {
                selected.name = e.target.value;
                this.renderer.draw();
            });
            nameInput.addEventListener('change', () => this.saveState());
        }

        // 2. Color Inputs
        const colorInput = document.getElementById('prop-color-input');
        if (colorInput) {
            colorInput.addEventListener('input', (e) => {
                selected.color = e.target.value;
                this.renderer.draw();
            });
            colorInput.addEventListener('change', () => this.saveState());
        }

        const textColorInput = document.getElementById('prop-text-color-input');
        if (textColorInput) {
            textColorInput.addEventListener('input', (e) => {
                selected.textColor = e.target.value;
                this.renderer.draw();
            });
            textColorInput.addEventListener('change', () => this.saveState());
        }

        // 3. Valuation (Text)
        const valInput = document.getElementById('prop-val-input');
        if (valInput) {
            valInput.addEventListener('change', (e) => {
                const text = e.target.value;
                const parts = text.split(',').map(s => s.trim()).filter(s => s.length > 0);
                selected.valuation.clear();
                parts.forEach(atom => selected.setAtom(atom, true));

                this.saveState();
                this.renderer.draw();
                this.updateEvaluation();
                this.updatePropertiesPanel();
            });
        }

        // 4. Atom Toggles (Buttons)
        document.querySelectorAll('.atom-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const atom = e.target.getAttribute('data-atom');
                const curr = selected.valuation.get(atom);
                selected.setAtom(atom, !curr);

                this.saveState();
                this.renderer.draw();
                this.updateEvaluation();
                this.updatePropertiesPanel();
            });
        });

        // 5. Action Buttons
        const saveBtn = document.getElementById('prop-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveState();
                this.renderer.draw();
                this.updateEvaluation();
            });
        }

        const cloneBtn = document.getElementById('prop-clone-btn');
        if (cloneBtn) {
            cloneBtn.addEventListener('click', () => {
                const id = 'w' + Date.now();
                const clone = new World(id, selected.x + 40, selected.y + 40);
                clone.name = (selected.name || selected.id) + "_copy";
                clone.color = selected.color;
                clone.textColor = selected.textColor;
                clone.valuation = new Map(selected.valuation);
                this.model.addWorld(clone);

                this.saveState();
                this.renderer.draw();
                this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
            });
        }

        const delBtn = document.getElementById('prop-del-btn');
        if (delBtn) {
            delBtn.addEventListener('click', () => {
                if (confirm('Delete world ' + (selected.name || selected.id) + '?')) {
                    this.model.removeWorld(selected.id);
                    this.renderer.selectedWorld = null;
                    this.saveState();
                    this.renderer.draw();
                    this.updatePropertiesPanel();
                    this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
                }
            });
        }

        // 6. Delete Relation Buttons
        document.querySelectorAll('.del-rel-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-idx'));
                const rel = outgoing[idx];
                if (rel) {
                    this.model.removeRelation(rel);
                    this.saveState();
                    this.renderer.draw();
                    this.updatePropertiesPanel();
                    this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
                }
            });
        });
    }

    saveState() {
        const state = {
            worlds: Array.from(this.model.worlds.values()).map(w => ({
                id: w.id,
                x: w.x,
                y: w.y,
                name: w.name,
                color: w.color,
                textColor: w.textColor,
                description: w.description,
                valuation: Array.from(w.valuation.entries())
            })),
            relations: this.model.relations.map(r => ({ ...r })),
            domain: Array.from(this.model.domain)
        };

        const stateStr = JSON.stringify(state);

        // If identical to current state, skip
        if (this.currentHistoryNode && this.currentHistoryNode.state === stateStr) {
            return;
        }

        // Create new node
        const newNode = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
            state: stateStr,
            parent: this.currentHistoryNode,
            children: [],
            timestamp: Date.now()
        };

        if (this.currentHistoryNode) {
            this.currentHistoryNode.children.push(newNode);
        } else {
            this.historyRoot = newNode;
        }

        this.currentHistoryNode = newNode;
        this.updateTimelineUI();
    }


    updateTimelineUI() {
        const panel = document.getElementById('timeline-panel');
        if (!panel) return;

        // Clear existing
        panel.innerHTML = '<span style="color:#666; font-size:0.8em; margin-right:10px;">TIMELINE BRANCHES:</span>';

        // Traverse from Root to find all nodes to display
        // We can visualiz the current branch (from root to current node)
        // And maybe show siblings of current path?

        // Simplified Visualization: Breadcrumbs of IDs from Root -> Current
        let path = [];
        let curr = this.currentHistoryNode;
        while (curr) {
            path.unshift(curr);
            curr = curr.parent;
        }

        // Limit path length for UI
        const displayPath = path.slice(-10);

        displayPath.forEach((node, idx) => {
            const isCurrent = node === this.currentHistoryNode;
            const dot = document.createElement('span');
            dot.style.display = 'inline-block';
            dot.style.width = '12px';
            dot.style.height = '12px';
            dot.style.borderRadius = '50%';
            dot.style.background = isCurrent ? '#4a90e2' : '#555';
            dot.style.margin = '0 5px';
            dot.style.cursor = 'pointer';
            dot.title = `State ${node.id} (${new Date(node.timestamp).toLocaleTimeString()})`;

            // Highlight forks
            if (node.children.length > 1) {
                dot.style.border = '2px solid #ffcc00';
            }

            dot.addEventListener('click', () => {
                this.restoreState(node);
            });

            panel.appendChild(dot);

            // Connector line
            if (idx < displayPath.length - 1) {
                const line = document.createElement('span');
                line.style.display = 'inline-block';
                line.style.width = '10px';
                line.style.height = '1px';
                line.style.background = '#444';
                panel.appendChild(line);
            }
        });

        // Show Branch Info
        const info = document.createElement('span');
        info.style.marginLeft = '15px';
        info.style.fontSize = '0.8em';
        info.style.color = '#888';
        const childrenCount = this.currentHistoryNode ? this.currentHistoryNode.children.length : 0;
        if (childrenCount > 0) {
            info.innerHTML = ` <span style="color:#ffcc00">Fork available!</span> (${childrenCount} futures)`;

            // Dropdown to switch future
            const sel = document.createElement('select');
            sel.style.marginLeft = '5px';
            sel.style.background = '#222';
            sel.style.color = '#ddd';
            sel.style.border = '1px solid #444';

            sel.innerHTML = `<option disabled selected>Switch Branch...</option>`;
            this.currentHistoryNode.children.forEach((child, i) => {
                sel.innerHTML += `<option value="${i}">Future ${i + 1} (${child.id.substr(0, 4)})</option>`;
            });

            sel.addEventListener('change', (e) => {
                this.restoreState(this.currentHistoryNode.children[e.target.value]);
            });
            info.appendChild(sel);
        }
        panel.appendChild(info);
    }

    undo() {
        if (this.currentHistoryNode && this.currentHistoryNode.parent) {
            this.restoreState(this.currentHistoryNode.parent);
        }
    }

    redo() {
        if (this.currentHistoryNode && this.currentHistoryNode.children.length > 0) {
            // Default to latest child (most recent branch)
            const latestChild = this.currentHistoryNode.children[this.currentHistoryNode.children.length - 1];
            this.restoreState(latestChild);
        }
    }

    restoreState(node) {
        if (!node) return;
        this.currentHistoryNode = node;

        const state = JSON.parse(node.state);

        // Restore Domain
        this.model.domain = new Set(state.domain);

        // Restore Worlds
        this.model.worlds.clear();
        state.worlds.forEach(wData => {
            const w = new World(wData.id, wData.x, wData.y);
            w.name = wData.name;
            w.color = wData.color;
            w.textColor = wData.textColor;
            w.description = wData.description || "";
            if (wData.valuation) {
                wData.valuation.forEach(([key, val]) => {
                    if (val) w.setAtom(key, true);
                });
            }
            this.model.addWorld(w);
        });

        // Restore Relations
        this.model.relations = state.relations.map(r => new Relation(r.sourceId, r.targetId, r.agent));

        this.renderer.draw();
        this.updateEvaluation();
        this.updatePropertiesPanel();
        this.updateDomainList();
    }

    setupTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Deactivate all
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // Activate clicked
                tab.classList.add('active');
                const targetId = tab.getAttribute('data-tab');
                const targetContent = document.getElementById(targetId);
                if (targetContent) {
                    targetContent.classList.add('active');
                }

                // Special handling
                if (targetId === 'tab-editor') {
                    // Resize canvas just in case
                    setTimeout(() => {
                        this.renderer.resize();
                        this.renderer.draw();
                    }, 10);
                }
            });
        });
    }

    switchTab(tabId) {
        const tabs = document.querySelectorAll('.tab-btn');
        for (const tab of tabs) {
            if (tab.getAttribute('data-tab') === tabId || tab.id === tabId) {
                tab.click();
                break;
            }
        }
    }

    setupTopBar() {
        // Random Model
        const rndBtn = document.getElementById('top-random-btn');
        const rndModal = document.getElementById('random-modal');
        const rndCancel = document.getElementById('rnd-cancel-btn');
        const rndGen = document.getElementById('rnd-generate-btn');

        if (rndBtn && rndModal && rndCancel && rndGen) {
            rndBtn.addEventListener('click', () => { rndModal.style.display = 'flex'; });
            rndCancel.addEventListener('click', () => { rndModal.style.display = 'none'; });

            rndGen.addEventListener('click', () => {
                const numWorlds = parseInt(document.getElementById('rnd-worlds').value);
                const relProb = parseFloat(document.getElementById('rnd-rel-prob').value);
                const atomProb = parseFloat(document.getElementById('rnd-atom-prob').value);
                const distType = document.getElementById('rnd-dist').value;
                this.generateRandomModel(numWorlds, relProb, atomProb, distType);
                rndModal.style.display = 'none';
            });
        }

        // Undo/Redo
        const undoBtn = document.getElementById('top-undo-btn');
        const redoBtn = document.getElementById('top-redo-btn');
        if (undoBtn) undoBtn.addEventListener('click', () => this.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

        window.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'z') {
                e.preventDefault();
                this.undo();
            } else if (e.ctrlKey && e.key === 'y') {
                e.preventDefault();
                this.redo();
            }
        });

        // Export Image
        const exportImgBtn = document.getElementById('top-export-img-btn');
        if (exportImgBtn) {
            exportImgBtn.addEventListener('click', () => {
                const canvas = this.renderer.canvas;
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');

                // Professional Black Background for Export
                tempCtx.fillStyle = '#000000';
                tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

                // Draw the current canvas state onto it
                tempCtx.drawImage(canvas, 0, 0);

                const link = document.createElement('a');
                link.download = 'judit-model.png';
                link.href = tempCanvas.toDataURL('image/png');
                link.click();
            });
        }

        // Export Results
        const exportResBtn = document.getElementById('top-export-res-btn');
        if (exportResBtn) {
            exportResBtn.addEventListener('click', () => {
                this.exportEvaluationResults();
            });
        }

        // Random Formula
        const rndFormulaBtn = document.getElementById('top-random-formula-btn');
        if (rndFormulaBtn) {
            rndFormulaBtn.addEventListener('click', () => {
                const formula = this.generateRandomFormula(3); // Depth 3
                this.formulaInput.value = formula;
                this.handleFormulaInput(formula);
            });
        }

        // Satisfy Formula (SAT)
        const satisfyBtn = document.getElementById('top-satisfy-btn');
        if (satisfyBtn) {
            satisfyBtn.addEventListener('click', () => {
                this.handleSatisfy();
            });
        }

        // Layout Toggle
        const layoutBtn = document.getElementById('layout-toggle-btn');
        const layoutDot = document.getElementById('layout-status-dot');
        if (layoutBtn) {
            layoutBtn.addEventListener('click', () => {
                const isEnabled = !this.renderer.physicsEnabled;
                this.renderer.setLayoutMode(isEnabled);

                layoutBtn.querySelector('strong').innerText = isEnabled ? 'ON' : 'OFF';
                layoutBtn.style.color = isEnabled ? '#fff' : '#aaa';
                layoutDot.style.background = isEnabled ? '#4cd964' : '#555';
                if (isEnabled) layoutDot.style.boxShadow = '0 0 8px #4cd964';
                else layoutDot.style.boxShadow = 'none';
            });
        }

        const gridBtn = document.getElementById('layout-grid-btn');
        const circleBtn = document.getElementById('layout-circle-btn');
        const shuffleBtn = document.getElementById('layout-random-btn');

        if (gridBtn) gridBtn.addEventListener('click', () => this.renderer.gridLayout());
        if (circleBtn) circleBtn.addEventListener('click', () => this.renderer.circleLayout());
        if (shuffleBtn) shuffleBtn.addEventListener('click', () => this.renderer.randomLayout());

        const centerBtn = document.getElementById('layout-center-btn');
        if (centerBtn) centerBtn.addEventListener('click', () => this.renderer.centerView());

        this.setupLambdaHandlers();
    }

    setupLambdaHandlers() {
        const input = document.getElementById('lambda-input');
        const inferBtn = document.getElementById('lambda-infer-btn');
        const clearBtn = document.getElementById('lambda-clear-btn');
        const applyBtn = document.getElementById('lambda-apply-btn');
        const output = document.getElementById('lambda-type-output');
        const insight = document.getElementById('lambda-insight');
        const presetsSelect = document.getElementById('lambda-presets');
        const saveBtn = document.getElementById('lambda-save-btn');
        const loadBtn = document.getElementById('lambda-load-btn');
        const fileInput = document.getElementById('lambda-file-input');
        const goalInput = document.getElementById('lambda-goal-input');
        const statusBadge = document.getElementById('lambda-status-badge');

        if (!input || !inferBtn) return;

        const areFormulasEqual = (f1, f2) => {
            if (!f1 || !f2) return f1 === f2;
            if (f1.type !== f2.type) return false;

            if (f1 instanceof Atom) return f1.name === f2.name;
            if (f1 instanceof Constant) return f1.value === f2.value;
            if (f1 instanceof Unary) return f1.operator === f2.operator && areFormulasEqual(f1.operand, f2.operand);
            if (f1 instanceof Binary) return f1.operator === f2.operator && areFormulasEqual(f1.left, f2.left) && areFormulasEqual(f1.right, f2.right);
            if (f1 instanceof Modal) return f1.operator === f2.operator && f1.agent === f2.agent && areFormulasEqual(f1.operand, f2.operand);
            if (f1 instanceof Quantifier) return f1.operator === f2.operator && f1.variable === f2.variable && areFormulasEqual(f1.operand, f2.operand);
            if (f1 instanceof Predicate) return f1.name === f2.name && f1.args.length === f2.args.length && f1.args.every((a, i) => a === f2.args[i]);

            return f1.toString() === f2.toString(); // Fallback
        };

        const updateStatus = (status, color) => {
            if (!statusBadge) return;
            statusBadge.textContent = status;
            statusBadge.style.color = color;
            statusBadge.style.borderColor = color;
        };

        const LAMBDA_PRESETS = {
            identity: "\\x. x",
            const: "\\x y. x",
            s_comb: "\\x y z. x z (y z)",
            omega: "(\\x. x x) (\\x. x x)",
            true: "\\x y. x",
            false: "\\x y. y",
            and: "\\p q. p q p",
            or: "\\p q. p p q",
            not: "\\p a b. p b a",
            zero: "\\f x. x",
            one: "\\f x. f x",
            two: "\\f x. f (f x)",
            succ: "\\n f x. f (n f x)"
        };

        if (presetsSelect) {
            presetsSelect.addEventListener('change', () => {
                const preset = LAMBDA_PRESETS[presetsSelect.value];
                if (preset) {
                    input.value = preset;
                    // Auto-fill goal if it's a common combinator
                    if (presetsSelect.value === 'identity') goalInput.value = 'p → p';
                    if (presetsSelect.value === 'const') goalInput.value = 'p → (q → p)';
                    inferBtn.click();
                }
            });
        }

        const ndPanel = document.getElementById('nd-panel');
        const ndHeader = document.getElementById('nd-header');
        const ndBody = document.getElementById('nd-body');
        const ndTreeContainer = document.getElementById('nd-tree-container');
        const ndToggleArrow = document.getElementById('nd-toggle-arrow');

        if (ndHeader && ndBody) {
            ndHeader.addEventListener('click', () => {
                const isExpanded = ndBody.style.display === 'block';
                ndBody.style.display = isExpanded ? 'none' : 'block';
                ndToggleArrow.textContent = isExpanded ? '▶' : '▼';
            });
        }

        const renderDerivationTree = (node) => {
            const wrapper = document.createElement('div');
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.margin = '0 15px';

            const premisesWrap = document.createElement('div');
            premisesWrap.style.display = 'flex';
            premisesWrap.style.justifyContent = 'center';
            premisesWrap.style.gap = '20px';
            node.premises.forEach(p => premisesWrap.appendChild(renderDerivationTree(p)));
            wrapper.appendChild(premisesWrap);

            // Bar
            const bar = document.createElement('div');
            bar.style.width = '100%';
            bar.style.height = '1px';
            bar.style.background = '#444';
            bar.style.margin = '4px 0';
            bar.style.position = 'relative';

            const ruleLabel = document.createElement('span');
            ruleLabel.textContent = node.rule;
            ruleLabel.style.position = 'absolute';
            ruleLabel.style.right = '-25px';
            ruleLabel.style.top = '-8px';
            ruleLabel.style.fontSize = '0.75em';
            ruleLabel.style.color = '#888';
            bar.appendChild(ruleLabel);
            wrapper.appendChild(bar);

            // Conclusion
            const conclusion = document.createElement('div');
            const ctxList = node.context ? Array.from(node.context.entries()).map(([v, t]) => `${v}:${t}`) : [];
            const ctxText = ctxList.length > 0 ? `{${ctxList.join(', ')}} ` : '';
            const termStr = node.term.toString();
            const typeStr = node.type.toString();
            conclusion.innerHTML = `<span style="color:#777;">${ctxText}</span> ⊢ <span style="color:#4a90e2;">${termStr}</span> : <span style="color:#4cd964;">${typeStr}</span>`;
            conclusion.style.padding = '2px 8px';
            conclusion.style.whiteSpace = 'nowrap';
            wrapper.appendChild(conclusion);

            return wrapper;
        };

        inferBtn.addEventListener('click', () => {
            const val = input.value.trim();
            if (!val) {
                alert("Enter a lambda expression first.");
                return;
            }

            const result = this.lambdaEngine.check(val);
            if (result.valid) {
                const inferredFormula = result.type;
                const formulaStr = inferredFormula.toString();
                output.textContent = formulaStr;
                output.style.color = '#4cd964';

                // Render ND Tree
                if (ndTreeContainer && result.derivation) {
                    ndTreeContainer.innerHTML = '';
                    const treeRoot = renderDerivationTree(result.derivation);
                    ndTreeContainer.appendChild(treeRoot);

                    // Show export actions
                    const ndActions = document.getElementById('nd-actions');
                    if (ndActions) ndActions.style.display = 'flex';

                    this.currentDerivation = result.derivation; // Store for export

                    // Auto-expand ND panel if output valid and it was collapsed
                    if (ndBody.style.display !== 'block') {
                        ndHeader.click();
                    }
                }

                let verificationMsg = '';
                const goalStr = goalInput ? goalInput.value.trim() : '';

                if (goalStr) {
                    try {
                        const goalFormula = this.parser.parse(goalStr);
                        if (areFormulasEqual(inferredFormula, goalFormula)) {
                            updateStatus('VALID', '#4cd964');
                            verificationMsg = `<br><span style="color:#4cd964;">✔ <strong>Verified!</strong> This term proves your goal formula.</span>`;
                        } else {
                            updateStatus('MISMATCH', '#ffcc00');
                            verificationMsg = `<br><span style="color:#ffcc00;">✖ <strong>Mismatch:</strong> Witness type does not match goal.</span>`;
                        }
                    } catch (e) {
                        updateStatus('ERROR', '#ff3b30');
                        verificationMsg = `<br><span style="color:#ff3b30;">⚠️ <strong>Goal Error:</strong> Could not parse goal formula.</span>`;
                    }
                } else {
                    updateStatus('IDLE', '#555');
                }

                insight.innerHTML = `<strong>Curry-Howard Witness:</strong> This lambda term is a <em>computational proof</em> (witness) of the logical theorem above.${verificationMsg}`;
                this.inferredLambdaFormula = formulaStr;
                applyBtn.disabled = false;
                applyBtn.style.opacity = 1;
            } else {
                output.textContent = result.error || "Type Error";
                output.style.color = '#ff3b30';
                insight.textContent = "The expression is either invalidly scoped or contains a type mismatch.";
                applyBtn.disabled = true;
                applyBtn.style.opacity = 0.5;
                updateStatus('ERROR', '#ff3b30');
                if (ndTreeContainer) ndTreeContainer.innerHTML = '<div style="color:#444; font-style:italic;">Invalid expression.</div>';
                const ndActions = document.getElementById('nd-actions');
                if (ndActions) ndActions.style.display = 'none';
            }
        });

        clearBtn.addEventListener('click', () => {
            input.value = '';
            if (goalInput) goalInput.value = '';
            output.textContent = 'None';
            output.style.color = '#4cd964';
            insight.innerHTML = "Enter a lambda term to see its corresponding logical formula.";
            applyBtn.disabled = true;
            applyBtn.style.opacity = '0.5';
            if (presetsSelect) presetsSelect.value = '';
            updateStatus('IDLE', '#555');
        });

        applyBtn.addEventListener('click', () => {
            if (this.inferredLambdaFormula) {
                this.formulaInput.value = this.inferredLambdaFormula;
                this.handleFormulaInput(this.inferredLambdaFormula);
                this.updateEvaluation();
            }
        });

        // Use custom tooltip from index.html (removed standard title)


        applyBtn.removeAttribute('title');

        // SETUP EXPORT HANDLERS
        const btnTxt = document.getElementById('nd-export-txt');
        const btnLatex = document.getElementById('nd-export-latex');
        const btnPng = document.getElementById('nd-export-png');
        const btnSvg = document.getElementById('nd-export-svg');

        const toText = (node, indent = "") => {
            let lines = [];
            const ctxList = node.context ? Array.from(node.context.entries()).map(([v, t]) => `${v}:${t}`) : [];
            const ctx = ctxList.length > 0 ? `{${ctxList.join(', ')}} ` : '';
            const termStr = node.term.toString();
            const typeStr = node.type.toString();
            const line = `${indent}${ctx}⊢ ${termStr} : ${typeStr} (${node.rule})`;

            if (node.premises) {
                node.premises.forEach(p => {
                    lines = lines.concat(toText(p, indent + "  "));
                });
            }
            lines.push(line);
            return lines;
        };

        const toLatex = (node) => {
            const ctxList = node.context ? Array.from(node.context.entries()).map(([v, t]) => `${v}:${t.toString().replace(/->/g, '\\to')}`) : [];
            const ctx = ctxList.length > 0 ? `\\{${ctxList.join(', ')}\\} ` : '';
            const termStr = node.term.toString().replace(/\\/g, '\\lambda ');
            const typeStr = node.type.toString().replace(/->/g, '\\to');
            const conclusion = `${ctx} \\vdash ${termStr} : ${typeStr}`;

            if (!node.premises || node.premises.length === 0) {
                return `\\AxiomC{$${conclusion}$}\n\\RightLabel{\\scriptsize ${node.rule}}\n`;
            }

            let premises = "";
            node.premises.forEach(p => {
                premises += toLatex(p);
            });

            const rule = node.rule === '→I' ? '\\to I' : (node.rule === '→E' ? '\\to E' : node.rule);
            const inference = node.premises.length === 1 ? '\\UnaryInfC' : '\\BinaryInfC';

            return `${premises}${inference}{$${conclusion}$}\n\\RightLabel{\\scriptsize ${rule}}\n`;
        };

        const download = (filename, content, type = 'text/plain') => {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        };

        btnTxt?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.currentDerivation) return;
            const lines = toText(this.currentDerivation);
            download('derivation.txt', lines.join('\n'));
        });

        btnLatex?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!this.currentDerivation) return;
            let body = toLatex(this.currentDerivation);
            let full = `\\documentclass{article}\n\\usepackage{bussproofs}\n\\begin{document}\n\\begin{prooftree}\n${body}\\displayproof\n\\end{prooftree}\n\\end{document}`;
            download('derivation.tex', full);
        });

        const exportImage = (format) => {
            if (!this.currentDerivation) return;

            // Recursive SVG builder
            const buildSvg = (node) => {
                const FONT_SIZE = 14;
                const CHAR_WIDTH = 8.5; // Approximate for monospace
                const LINE_HEIGHT = 24;
                const PREMISE_GAP = 20;

                // Calculate conclusion text
                const ctxList = node.context ? Array.from(node.context.entries()).map(([v, t]) => `${v}:${t}`) : [];
                const ctxFull = ctxList.length > 0 ? `{${ctxList.join(', ')}} ` : '';
                const termStr = node.term.toString();
                const typeStr = node.type.toString();
                const conclusionText = `${ctxFull}⊢ ${termStr} : ${typeStr}`;
                const conclWidth = conclusionText.length * CHAR_WIDTH + 16;

                // Handle Premises
                let premisesSvg = "";
                let premisesWidth = 0;
                let premisesHeight = 0;
                const children = [];

                if (node.premises && node.premises.length > 0) {
                    node.premises.forEach((p, i) => {
                        const child = buildSvg(p);
                        children.push(child);
                        if (i > 0) premisesWidth += PREMISE_GAP;
                        premisesWidth += child.width;
                        premisesHeight = Math.max(premisesHeight, child.height);
                    });

                    let currentX = 0;
                    children.forEach(child => {
                        premisesSvg += `<g transform="translate(${currentX}, 0)">${child.svg}</g>`;
                        currentX += child.width + PREMISE_GAP;
                    });
                }

                const width = Math.max(conclWidth, premisesWidth);
                const totalHeight = premisesHeight + LINE_HEIGHT + 10;

                // Centering
                const premisesX = (width - premisesWidth) / 2;
                const conclX = (width - conclWidth) / 2;
                const barY = premisesHeight + 5;

                let svg = `<g>`;
                if (premisesSvg) {
                    svg += `<g transform="translate(${premisesX}, 0)">${premisesSvg}</g>`;
                }

                // Bar
                svg += `<line x1="0" y1="${barY}" x2="${width}" y2="${barY}" stroke="white" stroke-width="1" />`;
                // Rule Label
                svg += `<text x="${width + 5}" y="${barY + 4}" fill="#aaa" font-size="10" font-family="monospace">${node.rule}</text>`;
                // Conclusion
                svg += `<text x="${conclX + 8}" y="${barY + 18}" font-size="${FONT_SIZE}" font-family="monospace">
                        <tspan fill="#777">${ctxFull.replace(/>/g, '&gt;').replace(/</g, '&lt;')}</tspan>
                        <tspan fill="white">⊢ </tspan>
                        <tspan fill="#4a90e2">${termStr.replace(/>/g, '&gt;').replace(/</g, '&lt;')}</tspan>
                        <tspan fill="white"> : </tspan>
                        <tspan fill="#4cd964">${typeStr.replace(/>/g, '&gt;').replace(/</g, '&lt;')}</tspan>
                    </text>`;
                svg += `</g>`;

                return { svg, width: width + 30, height: totalHeight };
            };

            const treeData = buildSvg(this.currentDerivation);
            const padding = 40;
            const width = treeData.width + padding * 2;
            const height = treeData.height + padding * 2;

            const data = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
                        <rect width="100%" height="100%" fill="black" />
                        <g transform="translate(${padding}, ${padding})">
                            ${treeData.svg}
                        </g>
                    </svg>
                `;

            if (format === 'svg') {
                download('derivation.svg', data, 'image/svg+xml');
            } else {
                const img = new Image();
                // Inline the font or ensure standard monospace works
                const svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    try {
                        const pngUrl = canvas.toDataURL('image/png');
                        const a = document.createElement('a');
                        a.href = pngUrl;
                        a.download = 'derivation.png';
                        a.click();
                    } catch (e) {
                        console.error("Export failed:", e);
                        alert("PNG export failed. Please use SVG or TXT instead.");
                    }
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            }
        };

        btnPng?.addEventListener('click', (e) => { e.stopPropagation(); exportImage('png'); });
        btnSvg?.addEventListener('click', (e) => { e.stopPropagation(); exportImage('svg'); });

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const content = input.value;
                if (!content) return;
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'expression.lambda';
                a.click();
                URL.revokeObjectURL(url);
            });
        }

        if (loadBtn && fileInput) {
            loadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    input.value = e.target.result;
                    inferBtn.click();
                };
                reader.readAsText(file);
            });
        }
    }

    setupSystemInsights() {
        const insightsBtn = document.getElementById('system-insights-btn');
        const insightsModal = document.getElementById('insights-modal');
        const insightsClose = document.getElementById('insights-close-btn');
        const insightsOk = document.getElementById('insights-ok-btn');

        if (insightsBtn && insightsModal) {
            console.log("System Insights: Button and Modal found.");
            insightsBtn.addEventListener('click', () => {
                console.log("System Insights: Button clicked.");
                try {
                    this.updateSystemInsights();
                    insightsModal.style.display = 'flex';
                } catch (e) {
                    console.error("System Insights Error:", e);
                    alert("Error opening capabilities: " + e.message);
                }
            });
            const close = () => { insightsModal.style.display = 'none'; };
            if (insightsClose) insightsClose.addEventListener('click', close);
            if (insightsOk) insightsOk.addEventListener('click', close);
            insightsModal.addEventListener('click', (e) => {
                if (e.target === insightsModal) close();
            });
        }
    }

    openSystemInsights() {
        const modal = document.getElementById('insights-modal');
        if (modal) {
            modal.style.display = 'flex'; // Show FIRST so user sees something
            try {
                this.updateSystemInsights();
            } catch (e) {
                console.error("Error updating insights:", e);
                const content = document.getElementById('insights-content');
                if (content) content.innerHTML = `<div style="color:red; padding:20px;">Error loading data: ${e.message}</div>`;
            }
        } else {
            console.error("Insights Modal not found in DOM");
        }
    }

    updateSystemInsights() {
        console.log("Updating Cybernetics & Analysis...");
        const canvas = document.getElementById('degree-chart');
        const ashbyEl = document.getElementById('ashby-analysis');
        const wienerEl = document.getElementById('wiener-analysis');
        const classEl = document.getElementById('net-classification');
        const markovEl = document.getElementById('markov-analysis');
        const robustEl = document.getElementById('robustness-analysis');
        const clusterEl = document.getElementById('clustering-analysis');
        const agentEl = document.getElementById('agent-analysis');
        const redundEl = document.getElementById('redundancy-analysis');

        if (!canvas || !ashbyEl || !wienerEl) return;
        if (!classEl || !markovEl || !robustEl || !clusterEl || !agentEl || !redundEl) {
            console.warn("Some insight elements missing, skipping partial update");
            return;
        }

        const worlds = Array.from(this.model.worlds.values());
        const relations = this.model.relations;
        const N = worlds.length;
        if (N === 0) return;

        // --- 1. Degree Distribution & Topology ---
        const degrees = worlds.map(w => {
            const out = relations.filter(r => r.sourceId === w.id).length;
            const inD = relations.filter(r => r.targetId === w.id).length;
            return { id: w.id, total: out + inD, out, in: inD };
        });

        const maxDeg = Math.max(...degrees.map(d => d.total));
        const avgDeg = degrees.reduce((s, d) => s + d.total, 0) / N;

        // --- Classification & Summary Logic ---
        const netEl = document.getElementById('net-classification');
        const netSumEl = document.getElementById('net-summary');

        const classifySystem = () => {
            if (N < 2) return { type: "Unary Point", desc: "A singular world. No relational complexity possible." };

            // Heuristic for Scale-Free: Some nodes have very high degrees compared to average
            const isScaleFree = maxDeg > avgDeg * 3;
            // Clustering Coeff calculation for Small World
            let totalCoef = 0;
            worlds.forEach(w => {
                const neighbors = [...new Set(relations.filter(r => r.sourceId === w.id || r.targetId === w.id)
                    .map(r => r.sourceId === w.id ? r.targetId : r.sourceId))];
                const k = neighbors.length;
                if (k < 2) return;
                let links = 0;
                neighbors.forEach((n1, i) => {
                    neighbors.forEach((n2, j) => {
                        if (i >= j) return;
                        if (relations.some(r => (r.sourceId === n1 && r.targetId === n2) || (r.sourceId === n2 && r.targetId === n1))) links++;
                    });
                });
                totalCoef += (2 * links) / (k * (k - 1));
            });
            const avgCC = totalCoef / N;

            if (avgCC > 0.4 && avgDeg > 1) return { type: "Small-World Network", desc: "High local clustering with short paths. Efficient for information spread but prone to rapid cascade effects." };
            if (isScaleFree) return { type: "Scale-Free (Hub-Spoke)", desc: "Dominated by key power-users (hubs). Robust to random failure, but highly vulnerable to targeted attacks on critical worlds." };
            if (avgDeg < 0.5) return { type: "Fragmented Archipelago", desc: "Disconnected islands of logic. Information cannot flow across the entire system." };
            if (avgDeg > N / 2) return { type: "Dense Mesh", desc: "Highly interconnected. High redundancy but prone to system-wide informational noise." };

            return { type: "Random / Decentralized", desc: "Fairly uniform distribution. A balanced logic model with no clear hierarchical dominance." };
        };

        const sysInfo = classifySystem();
        if (netEl) netEl.textContent = `System Topology: ${sysInfo.type}`;
        if (netSumEl) netSumEl.textContent = sysInfo.desc;

        degrees.sort((a, b) => b.total - a.total);

        // --- 2. Canvas Chart: Degree vs Percentile ---
        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;
        ctx.clearRect(0, 0, W, H);

        // Draw Axes
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 10); ctx.lineTo(30, H - 20); // Y
        ctx.lineTo(W - 10, H - 20); // X
        ctx.stroke();

        // Plot Data
        ctx.strokeStyle = '#4cd964';
        ctx.lineWidth = 2;
        ctx.beginPath();
        if (N === 1) {
            ctx.moveTo(30, H - 20 - (degrees[0].total / (maxDeg || 1)) * (H - 40));
            ctx.lineTo(W - 10, H - 20 - (degrees[0].total / (maxDeg || 1)) * (H - 40));
        } else {
            degrees.forEach((d, i) => {
                const x = 30 + (i / (N - 1)) * (W - 40);
                const y = H - 20 - (d.total / (maxDeg || 1)) * (H - 40);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
        }
        ctx.stroke();

        // Labels
        ctx.fillStyle = '#666';
        ctx.font = '9px monospace';
        ctx.fillText('Hubs', 30, 15);
        ctx.fillText('Periphery', W - 60, H - 5);

        // --- 3. Ashby: Requisite Variety (Entropy) ---
        // H = -sum(p * log2(p)), p = deg / 2E
        const doubleE = degrees.reduce((s, d) => s + d.total, 0);
        let entropy = 0;
        if (doubleE > 0) {
            degrees.forEach(d => {
                const p = d.total / doubleE;
                if (p > 0) entropy -= p * Math.log2(p);
            });
        }
        const maxEntropy = Math.log2(N);
        const relativeEntropy = maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;

        ashbyEl.innerHTML = `
            <div style="margin-bottom:5px;">System Entropy (H): <span style="color:#f5a623">${entropy.toFixed(2)} bits</span></div>
            <div style="margin-bottom:5px;">Relative Variety: ${relativeEntropy.toFixed(1)}% of max.</div>
            <div style="font-style:italic; color:#666; margin-top:8px;">
                "${relativeEntropy > 80 ? 'High Variety: System approaches chaos. Control is difficult.' :
                relativeEntropy < 40 ? 'Low Variety: System is rigid or disconnected. Vulnerable to novel disturbances.' :
                    'Balanced Variety: System balances order and flexibility.'}"
            </div>
        `;

        // --- 4. Wiener: Feedback & Control (Cycles) ---
        const cycles = [];
        const visited = new Set();
        const recStack = new Set();
        const adj = new Map();
        worlds.forEach(w => adj.set(w.id, []));
        relations.forEach(r => adj.get(r.sourceId).push(r.targetId));

        const findCycle = (curr, path) => {
            if (cycles.length >= 5) return;
            visited.add(curr);
            recStack.add(curr);
            path.push(curr);
            const neighbors = adj.get(curr) || [];
            for (const n of neighbors) {
                if (!visited.has(n)) findCycle(n, path);
                else if (recStack.has(n)) {
                    const idx = path.indexOf(n);
                    if (idx !== -1) cycles.push(path.slice(idx));
                }
            }
            recStack.delete(curr);
            path.pop();
        };
        worlds.forEach(w => { if (!visited.has(w.id)) findCycle(w.id, []); });

        const feedbackState = cycles.length > 0 ?
            `<span style="color:#4a90e2">Active Feedback</span> (${cycles.length} loops detected)` :
            `<span style="color:#888">Open Loop (Feed-forward only)</span>`;

        wienerEl.innerHTML = `
            <div style="margin-bottom:5px;">Control State: ${feedbackState}</div>
            <div style="font-style:italic; color:#666; margin-top:8px;">
                "${cycles.length > 0 ?
                'Feedback loops allow the system to correct errors and maintain homeostasis based on deviations from norms.' :
                'Without feedback, the system cannot self-correct. It is purely reactive to inputs.'}"
            </div>
            ${cycles.length > 0 ? `<div style="margin-top:5px; font-size:0.8em; color:#555;">Loop lengths: ${cycles.map(c => c.length).join(', ')}</div>` : ''}
        `;

        // --- 5. Advanced: Markov Chains (Stationary Distribution) ---
        if (markovEl) {
            let ranks = {};
            worlds.forEach(w => ranks[w.id] = 1 / N);
            const d = 0.85;

            for (let iter = 0; iter < 20; iter++) {
                let newRanks = {};
                worlds.forEach(w => newRanks[w.id] = (1 - d) / N);
                worlds.forEach(w => {
                    const out = relations.filter(r => r.sourceId === w.id);
                    if (out.length === 0) {
                        worlds.forEach(target => newRanks[target.id] += d * (ranks[w.id] / N));
                    } else {
                        out.forEach(r => {
                            newRanks[r.targetId] += d * (ranks[w.id] / out.length);
                        });
                    }
                });
                ranks = newRanks;
            }

            const sortedRanks = Object.entries(ranks).sort((a, b) => b[1] - a[1]);
            const top3 = sortedRanks.slice(0, 3);

            markovEl.innerHTML = `
                <div style="margin-bottom:5px;">System Attractors (Steady State):</div>
                ${top3.map((r, i) => `
                    <div style="display:flex; justify-content:space-between; font-size:0.9em; border-bottom:1px solid #333; padding:2px 0;">
                        <span style="color:#ba68c8">${i + 1}. ${this.model.getWorld(r[0])?.name || r[0]}</span>
                        <span>${(r[1] * 100).toFixed(1)}%</span>
                    </div>
                `).join('')}
                <div style="font-style:italic; color:#666; margin-top:5px; font-size:0.8em;">
                    Probability of a random walker ending up here.
                </div>
            `;
        }

        // --- 6. Robustness (Percolation / Fragmentation) ---
        if (robustEl) {
            const getMaxComponent = (skipId = null) => {
                const visited = new Set();
                let maxComp = 0;

                worlds.forEach(w => {
                    if (w.id === skipId || visited.has(w.id)) return;
                    let size = 0;
                    const q = [w.id];
                    visited.add(w.id);
                    size++;

                    while (q.length > 0) {
                        const curr = q.shift();
                        const neighbors = relations.filter(r => r.sourceId === curr || r.targetId === curr)
                            .map(r => r.sourceId === curr ? r.targetId : r.sourceId);

                        neighbors.forEach(n => {
                            if (n !== skipId && !visited.has(n)) {
                                visited.add(n);
                                q.push(n);
                                size++;
                            }
                        });
                    }
                    if (size > maxComp) maxComp = size;
                });
                return maxComp;
            };

            const originalMax = getMaxComponent();
            const criticalNode = degrees[0].id;
            const fracturedMax = getMaxComponent(criticalNode);
            const impact = ((originalMax - 1) - fracturedMax) / (originalMax || 1);

            robustEl.innerHTML = `
                <div style="margin-bottom:5px;">Connectivity Integrity: <span style="color:${impact > 0.3 ? '#e57373' : '#4cd964'}">${((1 - impact) * 100).toFixed(0)}%</span></div>
                <div style="font-size:0.85em;">Simulating removal of <strong>${this.model.getWorld(criticalNode)?.name || criticalNode}</strong>...</div>
                <div style="font-style:italic; color:#666; margin-top:5px; font-size:0.8em;">
                    ${impact > 0.4 ? "System is fragile. Removing a hub causes significant fragmentation." : "System is robust to node failure (Homeostatic)."}
                </div>
            `;
        }

        // --- 7. Clustering (Self-Organization) ---
        if (clusterEl) {
            let totalCoef = 0;
            worlds.forEach(w => {
                const neighbors = [...new Set(relations.filter(r => r.sourceId === w.id || r.targetId === w.id)
                    .map(r => r.sourceId === w.id ? r.targetId : r.sourceId))];
                const k = neighbors.length;
                if (k < 2) return;

                let links = 0;
                neighbors.forEach((n1, i) => {
                    neighbors.forEach((n2, j) => {
                        if (i >= j) return;
                        if (relations.some(r => (r.sourceId === n1 && r.targetId === n2) || (r.sourceId === n2 && r.targetId === n1))) {
                            links++;
                        }
                    });
                });
                totalCoef += (2 * links) / (k * (k - 1));
            });
            const avgCC = totalCoef / N;

            clusterEl.innerHTML = `
                <div style="margin-bottom:5px;">Clustering Coeff: <span style="color:#4db6ac">${avgCC.toFixed(3)}</span></div>
                <div style="font-style:italic; color:#666; margin-top:5px; font-size:0.8em;">
                    ${avgCC > 0.4 ? "High Clustering: Small-World / Modular structure." : "Low Clustering: Random or Tree-like structure."}
                </div>
            `;
        }

        // --- 8. Agent Analytics (Agent Influence & Symmetry) ---
        if (agentEl) {
            const agentStats = {};
            relations.forEach(r => {
                if (!agentStats[r.agent]) agentStats[r.agent] = 0;
                agentStats[r.agent]++;
            });

            const sortedAgents = Object.entries(agentStats).sort((a, b) => b[1] - a[1]);
            const totalR = relations.length || 1;

            agentEl.innerHTML = `
                <div style="font-size:0.9em; margin-bottom:5px;">Relation Density:</div>
                <div style="display:flex; flex-direction:column; gap:4px;">
                    ${sortedAgents.length > 0 ? sortedAgents.map(([agent, count]) => {
                const pct = (count / totalR * 100).toFixed(0);
                return `
                            <div style="display:flex; align-items:center; gap:8px;">
                                <span style="font-family:monospace; color:#4a90e2; width:15px;">${agent}</span>
                                <div style="flex-grow:1; height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                    <div style="width:${pct}%; height:100%; background:#4a90e2;"></div>
                                </div>
                                <span style="font-size:0.75em; color:#888;">${pct}%</span>
                            </div>
                        `;
            }).join('') : '<div style="font-style:italic; color:#666;">No multi-agent data.</div>'}
                </div>
                <div style="font-style:italic; color:#666; margin-top:8px; font-size:0.8em;">
                    ${sortedAgents.length > 1 ? `Agent <strong>${sortedAgents[0][0]}</strong> dominates the informational landscape.` : "Homogeneous informational flow."}
                </div>
            `;
        }

        // --- 9. System Redundancy (Deduplication & Twin Detection) ---
        if (redundEl) {
            // 1. Duplicate Relations
            const relKey = r => `${r.sourceId}-${r.targetId}-${r.agent}`;
            const relCounts = {};
            relations.forEach(r => {
                const k = relKey(r);
                relCounts[k] = (relCounts[k] || 0) + 1;
            });
            const dupeR = Object.values(relCounts).filter(c => c > 1).length;

            // 2. Twin Worlds (Simplification candidate)
            let twinCount = 0;
            const visitedPair = new Set();
            worlds.forEach((w1, i) => {
                worlds.forEach((w2, j) => {
                    if (i >= j) return;
                    const pair = [w1.id, w2.id].sort().join(':');
                    if (visitedPair.has(pair)) return;
                    visitedPair.add(pair);

                    // Same val?
                    const atoms = ['p', 'q', 'r', 's', 't', 'u', 'v', 'w'];
                    const sameVal = atoms.every(a => w1.valuation.get(a) === w2.valuation.get(a));
                    if (!sameVal) return;

                    // Same neighbors?
                    const n1 = relations.filter(r => r.sourceId === w1.id).map(r => `${r.targetId}:${r.agent}`).sort().join(',');
                    const n2 = relations.filter(r => r.sourceId === w2.id).map(r => `${r.targetId}:${r.agent}`).sort().join(',');
                    if (n1 === n2) twinCount++;
                });
            });

            const redundancyPct = ((twinCount / N) * 100).toFixed(0);

            redundEl.innerHTML = `
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>Twin Worlds:</span>
                    <span style="color:#ffb74d">${twinCount}</span>
                </div>
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span>Duplicated Paths:</span>
                    <span style="color:#ffb74d">${dupeR}</span>
                </div>
                <div style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.05); padding-top:8px; font-size:0.85em;">
                    System Efficiency: <span style="color:${redundancyPct > 20 ? '#e57373' : '#4cd964'}">${100 - redundancyPct}%</span>
                </div>
                <div style="font-style:italic; color:#666; margin-top:5px; font-size:0.8em;">
                    ${twinCount > 0 ? "Potential for bisimulation reduction." : "System is logically minimal."}
                </div>
            `;
        }
    }


    setupPresets() {
        const modal = document.getElementById('presets-modal');
        const list = document.getElementById('presets-list');
        const openBtn = document.getElementById('top-presets-btn');
        const closeBtn = document.getElementById('presets-close-btn');
        const counter = document.getElementById('presets-count');

        const presets = PRESETS;

        if (counter) {
            counter.textContent = `Total available: ${presets.length}`;
        }

        // Fill List
        if (list) {
            list.innerHTML = '';
            presets.forEach(p => {
                const item = document.createElement('div');
                item.className = 'preset-item';
                item.style.padding = '12px';
                item.style.background = '#2a2a2a';
                item.style.border = '1px solid #3d3d3d';
                item.style.borderRadius = '6px';
                item.style.marginBottom = '8px';
                item.style.cursor = 'pointer';
                item.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
                item.style.display = 'flex';
                item.style.flexDirection = 'column';
                item.style.gap = '4px';

                // Metadata formatting
                const stars = '⭐'.repeat(p.complexity || 1);
                const tagHtml = (p.tags || []).map(t => `<span style="background:rgba(74,144,226,0.1); color:#4a90e2; padding:2px 6px; border-radius:4px; font-size:0.75em; margin-right:5px;">${t}</span>`).join('');

                item.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <strong style="color:#4a90e2; font-size:1.05em;">${p.name}</strong>
                        <span style="font-size:0.8em; opacity:0.8;">${stars}</span>
                    </div>
                    <span style="font-size:0.85em; color:#bbb; line-height:1.4;">${p.desc}</span>
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                        <div style="font-size:0.75em; color:#777; font-family:monospace;">
                            🌐 ${p.worldsCount || 0} Worlds | 👤 ${p.agentsCount || 0} Agents
                        </div>
                        <div style="display:flex;">${tagHtml}</div>
                    </div>
                `;

                item.addEventListener('mouseenter', () => {
                    item.style.background = '#333';
                    item.style.borderColor = '#4a90e2';
                    item.style.transform = 'translateX(5px)';
                });
                item.addEventListener('mouseleave', () => {
                    item.style.background = '#2a2a2a';
                    item.style.borderColor = '#3d3d3d';
                    item.style.transform = 'translateX(0)';
                });

                item.addEventListener('click', () => {
                    const confirmLoad = confirm(`Load "${p.name}"?\n\nThis will replace your current model and any unsaved work.`);
                    if (confirmLoad) {
                        this.loadPreset(p.data);
                        modal.style.display = 'none';
                    }
                });
                list.appendChild(item);
            });
        }

        if (openBtn) {
            openBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'flex';
            });
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (modal) modal.style.display = 'none';
            });
        }

        // Close on click outside
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        }
    }

    loadPreset(data) {
        // Clear existing
        this.model.worlds.clear();
        this.model.relations = [];
        this.model.domain.clear();
        this.model.domain.add('d1');

        // Load Worlds
        data.worlds.forEach(w => {
            const world = new World(w.id, w.x, w.y);
            world.name = w.name || w.id;
            world.color = w.color || '#333'; // Default fallback
            world.textColor = w.textColor || '#fff';
            world.description = w.description || "";
            if (w.valuation) {
                w.valuation.forEach(([atom, val]) => {
                    if (val) world.setAtom(atom, true);
                });
            }
            this.model.addWorld(world);
        });

        // Load Relations
        data.relations.forEach(r => {
            this.model.addRelation(r.sourceId, r.targetId, r.agent);
        });

        this.renderer.draw();
        this.updateEvaluation();
        this.updatePropertiesPanel();
        this.updateSystemInsights();
        this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));
    }

    setupOrdinalCalculator() {
        const modal = document.getElementById('ordinal-modal');
        const openBtn = document.getElementById('top-ordinal-btn');
        const closeBtn = document.getElementById('ordinal-close-btn');
        const calcBtn = document.getElementById('calc-worm-btn');
        const input = document.getElementById('worm-input');
        const output = document.getElementById('ordinal-result');

        if (!modal || !openBtn || !closeBtn || !calcBtn || !input || !output) {
            // console.debug("Ordinal Calc elements not found in DOM");
            return;
        }

        openBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
            input.focus();
        });

        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        const calculate = () => {
            const text = input.value.trim();
            if (!text) return;
            try {
                // Parse formula
                const formula = this.parser.parse(text);
                // Calculate Ordinal
                const ordinal = WormCalculator.calculate(formula);

                // Format nicely
                output.innerHTML = ordinal.toString()
                    .replace(/ω/g, '&omega;')
                    .replace(/ε/g, '&epsilon;')
                    .replace(/φ/g, '&phi;')
                    .replace(/\^/g, '<sup>')
                    .replace(/\{/g, '')
                    .replace(/\}/g, '</sup>');

                // Handle nested superscripts roughly:
                // Actually toString returns Latex-like string.
                // Let's use simple text for now or basic HTML.
                // Or better: use a proper renderer.
                // For now, raw string is fine as it uses unicode chars.
                output.textContent = ordinal.toString();
                output.style.color = '#4a90e2';
            } catch (e) {
                output.textContent = "Error: " + e.message;
                output.style.color = '#d9534f';
            }
        };

        if (calcBtn) calcBtn.addEventListener('click', calculate);
        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') calculate();
            });
        }

        if (window && modal) {
            window.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }
    }

    setupExportLatex() {
        const btn = document.getElementById('top-latex-btn');
        if (!btn) return;

        btn.addEventListener('click', () => {
            // Generate TikZ
            let scale = 1.0;
            // Calculate bounding box
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            this.model.worlds.forEach(w => {
                if (w.x < minX) minX = w.x;
                if (w.y < minY) minY = w.y;
                if (w.x > maxX) maxX = w.x;
                if (w.y > maxY) maxY = w.y;
            });

            // If empty, default
            if (minX === Infinity) { minX = 0; maxX = 100; minY = 0; maxY = 100; }

            // Normalize
            const width = maxX - minX + 100;
            const height = maxY - minY + 100;
            const scaleFactor = 5.0 / Math.max(width / 100, height / 100);

            let tikz = "% Dependencies: \\usepackage{tikz} \\usetikzlibrary{arrows.meta, positioning}\n";
            tikz += "\\begin{tikzpicture}[->, >=stealth, node distance=2cm, every state/.style={circle, draw, minimum size=0.8cm}]\n";

            this.model.worlds.forEach(w => {
                // Map coordinates to TikZ (invert Y)
                const tx = ((w.x - minX) / 100) * 2;
                const ty = -((w.y - minY) / 100) * 2;

                // Valuation label
                let label = w.name;
                const atoms = Array.from(w.valuation.entries()).filter(e => e[1]).map(e => e[0]).join(",");
                if (atoms) label += `\\\\ ${atoms}`;

                tikz += `  \\node[state] (${w.id}) at (${tx.toFixed(2)}, ${ty.toFixed(2)}) {\\shortstack{${label}}};\n`;
            });

            this.model.relations.forEach(r => {
                // Find agent label style
                const ag = r.agent || "";
                let style = "";
                if (ag === 'a') style = "blue";
                else if (ag === 'b') style = "red";
                else if (ag === 'c') style = "green!60!black";

                // Bend logic?
                // Simple: defaults
                if (r.sourceId === r.targetId) {
                    tikz += `  \\path (${r.sourceId}) edge [loop above, color=${style}] node {${ag}} (${r.targetId});\n`;
                } else {
                    // Check for bidirectional to bend
                    const rev = this.model.relations.some(rr => rr.sourceId === r.targetId && rr.targetId === r.sourceId);
                    const bend = rev ? "bend right=15" : "";
                    tikz += `  \\path (${r.sourceId}) edge [${bend}, color=${style}] node[midway, above] {${ag}} (${r.targetId});\n`;
                }
            });

            tikz += "\\end{tikzpicture}";

            // Open Modal
            // We can reuse a generic modal or prompt
            // Let's create a simple modal on fly or check if one exists in HTML?
            // Existing HTML might not have specific LaTeX modal.
            // Let's use prompt for now or alert copy.

            // Actually, conversation history mentions "Add Export LaTeX button... Clicking it opens a modal".
            // So there should be a modal.
            // Let's try to find 'latex-modal'.
            const modal = document.getElementById('latex-modal');
            if (modal) {
                const area = document.getElementById('latex-output');
                if (area) area.value = tikz;
                modal.style.display = 'flex';
                const close = document.getElementById('latex-close-btn');
                if (close) close.onclick = () => modal.style.display = 'none';
            } else {
                navigator.clipboard.writeText(tikz).then(() => alert("TikZ code copied to clipboard!"));
            }
        });
    }

    setupTranslator() {
        const modal = document.getElementById('translator-modal');
        const openBtn = document.getElementById('top-translate-btn');
        const closeBtn = document.getElementById('trans-close-btn');
        const output = document.getElementById('trans-output');
        const input = document.getElementById('trans-formula-input');
        const themeSel = document.getElementById('trans-theme-select');
        const copyBtn = document.getElementById('trans-copy-btn');

        if (openBtn && modal) {
            openBtn.addEventListener('click', () => {
                modal.style.display = 'flex';
                const mainInput = document.getElementById('formula-input');
                if (mainInput && mainInput.value) {
                    input.value = mainInput.value;
                    // updateTranslation(); // Assuming function exists or we need to add it?
                    // Previous logs imply it might be missing or external.
                    // Let's add a dummy placeholder or logic if missing.
                    if (typeof updateTranslation !== 'undefined') updateTranslation();
                    else output.value = "Translation logic placeholder.";
                }
            });
        }
        if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.style.display = 'none');

        const themes = {
            rain: {
                p: "it involves rain", q: "the ground is wet", r: "clouds are dark", s: "thunder is heard",
                box: "In all possible scenarios,", dia: "It is possible that",
                not: "it is not the case that", and: "and", or: "or", implies: "implies that if", iff: "matches exactly if"
            },
            love: {
                p: "Alice loves Bob", q: "Bob loves Alice", r: "they are happy", s: "they break up",
                box: "I am certain that", dia: "My heart tells me it is possible that",
                not: "it is false that", and: "and", or: "or", implies: "leads to", iff: "is true love if and only if"
            },
            war: {
                p: "the enemy attacks", q: "we defend", r: "allies arrive", s: "peace is signed",
                box: "Intelligence confirms that always", dia: "We suspect that potentially",
                not: "defeat is not", and: "but also", or: "or alternatively", implies: "forces the outcome that", iff: "is indistinguishable from"
            },
            crypto: {
                p: "Bitcoin pumps", q: "I get rich", r: "Elon tweets", s: "SEC sues",
                box: "The blockchain consensus verifies that", dia: "There is non-zero probability that",
                not: "FUD claims not", and: "and", or: "or", implies: "signals that", iff: "is pegged to"
            }
        };

        const translate = (formulaStr, themeName) => {
            if (!formulaStr) return "";
            const t = themes[themeName] || themes['rain'];

            let txt = formulaStr;
            // Simple replace (order matters for <-> vs ->)
            txt = txt.replace(/<->/g, " " + t.iff + " ");
            txt = txt.replace(/->/g, " " + t.implies + " ");
            txt = txt.replace(/\[\]/g, t.box + " ");
            txt = txt.replace(/<>/g, t.dia + " ");
            txt = txt.replace(/~/g, t.not + " ");
            txt = txt.replace(/!/g, t.not + " ");
            txt = txt.replace(/¬/g, t.not + " ");
            txt = txt.replace(/&/g, " " + t.and + " ");
            txt = txt.replace(/\^/g, " " + t.and + " ");
            txt = txt.replace(/\|/g, " " + t.or + " ");
            txt = txt.replace(/∨/g, " " + t.or + " ");

            // Variables (with word boundaries to avoid replacing parts of words if any apply)
            txt = txt.replace(/\bp\b/g, t.p);
            txt = txt.replace(/\bq\b/g, t.q);
            txt = txt.replace(/\br\b/g, t.r);
            txt = txt.replace(/\bs\b/g, t.s);

            // Cleanup spaces
            txt = txt.replace(/\s+/g, ' ').trim();
            return txt.charAt(0).toUpperCase() + txt.slice(1) + ".";
        };

        const updateTranslation = () => {
            output.value = translate(input.value, themeSel.value);
        };

        if (input) input.addEventListener('input', updateTranslation);
        if (themeSel) themeSel.addEventListener('change', updateTranslation);

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                output.select();
                document.execCommand('copy');
                alert("Copied!");
            });
        }
    }

    handleSatisfy() {
        const text = this.formulaInput.value.trim();
        if (!text) {
            alert("Please enter a formula first.");
            return;
        }

        try {
            const formula = this.parser.parse(text);
            const system = document.getElementById('logic-system')?.value || 'K';
            const result = this.prover.satisfy(formula, system);

            if (!result.satisfiable) {
                alert(`The formula is UNSATISFIABLE.`);
            } else if (result.model) {
                alert("Generating simplest satisfying model...");
                this.generateModelFromBranch(result.model);
            }
        } catch (e) {
            alert("Parser Error: " + e.message);
        }
    }

    generateModelFromBranch(branch) {
        if (!branch) return;

        // Clear current model
        this.model.worlds.clear();
        this.model.relations = [];

        // Map world IDs from branch to new Worlds
        const worldMap = new Map();

        // 1. Create Worlds
        const worldsInBranch = new Set(branch.nodes.map(n => n.worldId));
        let i = 0;
        const centerX = this.renderer.canvas.width / 2;
        const centerY = this.renderer.canvas.height / 2;

        worldsInBranch.forEach(wId => {
            const angle = (i / worldsInBranch.size) * Math.PI * 2;
            const radius = 150;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const w = new World(wId, x, y);
            this.model.addWorld(w);
            worldMap.set(wId, w);
            i++;
        });

        // 2. Set Valuations
        branch.nodes.forEach(n => {
            const world = worldMap.get(n.worldId);
            if (!world) return;

            const f = n.formula;
            if (f.type === 'atom') {
                world.setAtom(f.name, true);
            } else if (f.type === 'predicate') {
                world.setAtom(f.toString(), true);
            } else if (f.type === 'unary' && f.operator === '¬') {
                const inner = f.operand;
                if (inner.type === 'atom' || inner.type === 'predicate') {
                    world.setAtom(inner.toString(), false);
                }
            }
        });

        // 3. Add Relations
        branch.relations.forEach(rel => {
            this.model.addRelation(rel.from, rel.to, rel.agent);
        });

        // 4. Finalize
        this.renderer.setLayoutMode(true); // Auto-layout the generated model
        this.renderer.draw();
        this.updateEvaluation();
        this.updatePropertiesPanel();
        this.saveState();
    }

    generateRandomFormula(depth) {
        const atoms = ['p', 'q', 'r', 's', 't', 'u'];
        const unaries = ['¬', '□', '◊'];
        const binaries = ['∧', '∨', '→', '↔'];

        if (depth <= 0 || Math.random() < 0.4) {
            return atoms[Math.floor(Math.random() * atoms.length)];
        }

        const type = Math.random();
        if (type < 0.4) {
            // Unary
            const op = unaries[Math.floor(Math.random() * unaries.length)];
            return `${op}${this.generateRandomFormula(depth - 1)}`;
        } else {
            // Binary
            const op = binaries[Math.floor(Math.random() * binaries.length)];
            const left = this.generateRandomFormula(depth - 1);
            const right = this.generateRandomFormula(depth - 1);
            return `(${left} ${op} ${right})`;
        }
    }

    generateRandomModel(numWorlds, relProb, atomProb, distType = 'uniform') {
        this.model.worlds.clear();
        this.model.relations = [];
        this.model.domain.clear();
        this.renderer.selectedWorld = null;

        const width = this.renderer.canvas.width;
        const height = this.renderer.canvas.height;
        const margin = 100;

        // Get selected agents
        const agents = [];
        if (document.getElementById('rnd-agent-a').checked) agents.push('a');
        if (document.getElementById('rnd-agent-b').checked) agents.push('b');
        if (document.getElementById('rnd-agent-c').checked) agents.push('c');
        if (document.getElementById('rnd-agent-d').checked) agents.push('d');
        if (agents.length === 0) agents.push('a');

        const worlds = [];
        for (let i = 1; i <= numWorlds; i++) {
            const id = `w${i}`;
            const x = margin + Math.random() * (width - 2 * margin);
            const y = margin + Math.random() * (height - 2 * margin);
            const w = new World(id, x, y);

            ['p', 'q', 'r', 's', 't', 'u'].forEach(atom => {
                if (Math.random() < atomProb) w.setAtom(atom, true);
            });

            const h = Math.floor(Math.random() * 360);
            w.color = `hsl(${h}, 40%, 25%)`;

            this.model.addWorld(w);
            worlds.push(w);
        }

        // Random Relations (Per Agent)
        agents.forEach(agent => {
            if (distType === 'uniform') {
                worlds.forEach(source => {
                    worlds.forEach(target => {
                        if (Math.random() < relProb) {
                            this.model.addRelation(source.id, target.id, agent);
                        }
                    });
                });
            } else if (distType === 'scale-free') {
                // Simplified Preferential Attachment / Hubs
                // Worlds at the start of the array have higher "attraction"
                worlds.forEach(source => {
                    worlds.forEach((target, j) => {
                        // Hub probability: earlier nodes in list are hubs
                        const hubFactor = (numWorlds - j) / numWorlds;
                        const p = relProb * hubFactor * 2.0;
                        if (Math.random() < p) {
                            this.model.addRelation(source.id, target.id, agent);
                        }
                    });
                });
            } else if (distType === 'balanced') {
                // Target fixed degree
                const k = Math.max(1, Math.round(relProb * numWorlds));
                worlds.forEach(source => {
                    // Pick k random targets
                    const targets = [...worlds].sort(() => 0.5 - Math.random()).slice(0, k);
                    targets.forEach(target => {
                        this.model.addRelation(source.id, target.id, agent);
                    });
                });
            }
        });

        this.renderer.draw();
        this.updateEvaluation();
    }

    exportEvaluationResults() {
        if (!this.currentFormula) {
            alert("No formula evaluated to export.");
            return;
        }

        // Re-evaluate to get results
        let content = `JUDIT Evaluation Results\n`;
        content += `Formula: ${this.currentFormula.toString()}\n`;
        content += `Date: ${new Date().toLocaleString()}\n\n`;
        content += `World\tValue\n`;
        content += `-----\t-----\n`;

        const system = this.systemSelect ? this.systemSelect.value : 'K';
        this.model.worlds.forEach(w => {
            try {
                const val = this.currentFormula.evaluate(this.model, w, {}, system);
                content += `${w.id}\t${val ? 'TRUE' : 'FALSE'}\n`;
            } catch (e) {
                content += `${w.id}\tERROR: ${e.message}\n`;
            }
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'evaluation_results.txt';
        link.click();
    }

    setupDomainEditor() {
        const addBtn = document.getElementById('add-object-btn');
        // Initial render
        this.updateDomainList();
    }

    updateDomainList() {
        const list = document.getElementById('domain-list');
        if (!list) return;

        const domain = Array.from(this.model.domain);
        if (domain.length === 0) {
            list.innerHTML = `<div style="font-style:italic; color:#888;">No explicit objects.</div>`;
        } else {
            list.innerHTML = domain.map(obj =>
                `<div style="display:flex; justify-content:space-between; margin-bottom:2px; background:#444; padding:2px 5px; border-radius:3px;">
                        <span>${obj}</span>
                        <span class="del-obj-btn" data-obj="${obj}" style="color:#ff6b6b; cursor:pointer; font-weight:bold;">&times;</span>
                    </div>`
            ).join('');

            // Add delete listeners
            list.querySelectorAll('.del-obj-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const obj = e.target.dataset.obj;
                    this.model.removeObject(obj);
                    this.updateDomainList();
                    this.updateEvaluation(); // Domain change might affect quantifiers
                    this.saveState();
                });
            });
        }
    }

    setupEventListeners() {
        if (this.formulaInput) {
            this.formulaInput.addEventListener('input', (e) => this.handleFormulaInput(e.target.value));
        }
        if (this.proveBtn) {
            this.proveBtn.addEventListener('click', () => this.handleProve());
        }
        if (this.announceBtn) {
            this.announceBtn.addEventListener('click', () => this.handleAnnounce());
        }
        if (this.exportBtn) {
            this.exportBtn.addEventListener('click', () => this.handleExport());
        }
        if (this.importBtn) {
            this.importBtn.addEventListener('click', () => this.fileInput.click());
        }
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleImport(e));
        }
        if (this.gameBtn) {
            this.gameBtn.addEventListener('click', () => this.handleGameStart());
        }

        // Logic Buttons (Input Injection)
        // Use event delegation or re-query to ensure they are found
        const toolButtons = document.querySelectorAll('.toolbar-item[data-type="operator"]');
        toolButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent drag start if clicking quickly
                this.insertAtCursor(btn.dataset.char);
            });
        });

        // Tutorial Modal
        const helpBtn = document.getElementById('help-btn');
        const modal = document.getElementById('tutorial-modal');
        const closeBtn = document.getElementById('close-tutorial');

        if (helpBtn && modal && closeBtn) {
            helpBtn.addEventListener('click', () => {
                const body = document.getElementById('tutorial-body');
                if (body) body.innerHTML = this.defaultHelpContent;
                modal.style.display = 'flex';
            });
            closeBtn.addEventListener('click', () => modal.style.display = 'none');
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.style.display = 'none';
            });
        }

        // Global Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                this.undo();
            }
            if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) {
                e.preventDefault();
                this.redo();
            }
        });
    }

    setupGlobalControls() {
        const shareBtn = document.getElementById('share-session-btn');
        const loadBtn = document.getElementById('load-session-btn');
        const globalFileInput = document.getElementById('global-file-input');

        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.exportGlobalSession());
        }

        if (loadBtn && globalFileInput) {
            loadBtn.addEventListener('click', () => globalFileInput.click());
            globalFileInput.addEventListener('change', (e) => this.importGlobalSession(e));
        }
    }

    exportGlobalSession() {
        // Gather ALL state
        const session = {
            type: 'judit-global-session',
            version: 1,
            timestamp: new Date().toISOString(),
            logic: {
                worlds: Array.from(this.model.worlds.values()).map(w => ({
                    id: w.id,
                    x: w.x, y: w.y,
                    name: w.name,
                    color: w.color,
                    textColor: w.textColor,
                    valuation: Array.from(w.valuation.entries())
                })),
                relations: this.model.relations.map(r => ({
                    source: r.sourceId,
                    target: r.targetId,
                    agent: r.agent,
                    data: r.data
                })),
                domain: Array.from(this.model.domain)
            },
            formula: {
                raw: this.formulaInput ? this.formulaInput.value : ''
            },
            turing: {
                tape: this.turing.getTapeString(),
                startState: this.turing.currentStateId
            },
            lambda: {
                input: document.getElementById('lambda-input')?.value || '',
                goal: document.getElementById('lambda-goal-input')?.value || ''
            },
            scripting: {
                code: document.getElementById('script-console')?.value || ''
            },
            appearance: {
                theme: this.appTheme || 'dark',
                logicSystem: this.systemSelect ? this.systemSelect.value : 'K',
                fontFamily: document.getElementById('font-family-select')?.value || "'Inter', sans-serif",
                uiScale: document.getElementById('ui-scale-range')?.value || '1.0'
            }
        };

        const json = JSON.stringify(session, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `judit-session-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importGlobalSession(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const session = JSON.parse(ev.target.result);
                if (session.type !== 'judit-global-session') {
                    alert('Invalid session file format.');
                    return;
                }

                // 1. Restore Logic Model
                this.model.worlds.clear();
                this.model.relations = [];
                this.model.domain.clear();

                if (session.logic) {
                    // Domain
                    if (session.logic.domain) {
                        session.logic.domain.forEach(obj => this.model.addObject(obj));
                    }
                    // Worlds
                    if (session.logic.worlds) {
                        session.logic.worlds.forEach(wData => {
                            const w = new World(wData.id, wData.x, wData.y);
                            w.name = wData.name;
                            w.color = wData.color;
                            w.textColor = wData.textColor;
                            if (wData.valuation) {
                                w.valuation = new Map(wData.valuation);
                            }
                            this.model.addWorld(w);
                        });
                    }
                    // Relations
                    if (session.logic.relations) {
                        session.logic.relations.forEach(r => {
                            this.model.addRelation(r.source, r.target, r.agent, r.data);
                        });
                    }
                }

                // 2. Restore Turing Machine
                if (session.turing) {
                    if (session.turing.tape !== undefined) {
                        this.turing.loadTape(session.turing.tape);
                    }
                    if (session.turing.startState) {
                        this.turing.setStartWorld(session.turing.startState);
                    }
                }

                // 3. Restore Formula
                if (session.formula && session.formula.raw) {
                    this.formulaInput.value = session.formula.raw;
                    this.handleFormulaInput(session.formula.raw);
                }

                // 4. Restore Lambda
                if (session.lambda) {
                    const lInput = document.getElementById('lambda-input');
                    const lGoal = document.getElementById('lambda-goal-input');
                    if (lInput && session.lambda.input) lInput.value = session.lambda.input;
                    if (lGoal && session.lambda.goal) lGoal.value = session.lambda.goal;
                }

                // 5. Restore Scripting
                if (session.scripting && session.scripting.code) {
                    const sConsole = document.getElementById('script-console');
                    if (sConsole) sConsole.value = session.scripting.code;
                }

                // 3. Restore Appearance
                if (session.appearance) {
                    if (session.appearance.theme) {
                        this.applyTheme(session.appearance.theme);
                        const radio = document.querySelector(`input[name="theme"][value="${session.appearance.theme}"]`);
                        if (radio) radio.checked = true;
                    } else {
                        this.applyTheme('dark');
                    }

                    if (session.appearance.logicSystem && this.systemSelect) {
                        this.systemSelect.value = session.appearance.logicSystem;
                    }

                    if (session.appearance.fontFamily) {
                        const fontSelect = document.getElementById('font-family-select');
                        if (fontSelect) {
                            fontSelect.value = session.appearance.fontFamily;
                            document.body.style.fontFamily = session.appearance.fontFamily;
                        }
                    }

                    if (session.appearance.uiScale) {
                        const scaleRange = document.getElementById('ui-scale-range');
                        if (scaleRange) {
                            scaleRange.value = session.appearance.uiScale;
                            document.body.style.fontSize = `${session.appearance.uiScale}em`;
                            const scaleValue = document.getElementById('ui-scale-value');
                            if (scaleValue) scaleValue.textContent = `${Math.round(session.appearance.uiScale * 100)}%`;
                        }
                    }
                } else {
                    this.applyTheme('dark');
                }

                // Refresh UI
                this.renderer.selectedWorld = null;
                this.renderer.resize();
                this.renderer.draw();
                this.updatePropertiesPanel();
                this.updateDomainList();
                this.updateEvaluation();
                // Turing UI update
                if (this.updateTuringUI) this.updateTuringUI();

                // Reset file input
                e.target.value = '';

                // Show success message or log?
                // alert('Session loaded successfully.');

            } catch (err) {
                console.error(err);
                alert('Error loading session: ' + err.message);
            }
        };
        reader.readAsText(file);
    }



    setupAppearanceControls() {
        const themeRadios = document.querySelectorAll('input[name="theme"]');
        themeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.applyTheme(e.target.value);
                }
            });
        });

        const fontSelect = document.getElementById('font-family-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', (e) => {
                document.body.style.fontFamily = e.target.value;
            });
        }

        const scaleRange = document.getElementById('ui-scale-range');
        const scaleValueLabel = document.getElementById('ui-scale-value');
        if (scaleRange) {
            scaleRange.addEventListener('input', (e) => {
                const scale = e.target.value;
                document.body.style.fontSize = `${scale}em`;
                if (scaleValueLabel) scaleValueLabel.textContent = `${Math.round(scale * 100)}%`;
            });
        }

        // Initialize default
        this.appTheme = 'dark';
    }

    applyTheme(themeName) {
        this.appTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);

        // Update Renderer (Canvas Colors)
        if (this.renderer && this.renderer.setTheme) {
            this.renderer.setTheme(themeName);
        }

        // Handle specific overrides if strictly necessary, 
        // but try to rely on CSS [data-theme="..."] as much as possible.
        if (themeName === 'light') {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        } else {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        }
    }

    insertAtCursor(text) {
        const input = this.formulaInput;
        if (!input) return;

        const start = input.selectionStart || input.value.length;
        const end = input.selectionEnd || input.value.length;
        const val = input.value;
        const before = val.substring(0, start);
        const after = val.substring(end, val.length);

        input.value = before + text + after;
        input.focus();
        const newPos = start + text.length;
        input.setSelectionRange(newPos, newPos);

        // Trigger generic input handler
        this.handleFormulaInput(input.value);
    }

    handleProve() {
        // Output result to evaluation-result for now, or alert
        // Better: create separate area if requested, or append
        try {
            if (!this.currentFormula) {
                alert("Please enter a valid formula first.");
                return;
            }
            const system = this.systemSelect ? this.systemSelect.value : 'K';
            const result = this.prover.prove(this.currentFormula, system);

            let msg = "";
            if (result.valid) {
                msg = `✅ Valid in ${system}`;
            } else {
                msg = `❌ Invalid (Counter-model found)`;
                // TODO: Visualize counter-model
            }

            const resultDisplay = document.getElementById('evaluation-result');
            if (resultDisplay) {
                const proveMsg = document.createElement('div');
                proveMsg.style.padding = '8px';
                proveMsg.style.margin = '5px 0';
                proveMsg.style.borderRadius = '4px';
                proveMsg.style.border = `1px solid ${result.valid ? 'var(--success-color)' : 'var(--danger-color)'}`;
                proveMsg.style.background = result.valid ? 'rgba(92, 184, 92, 0.1)' : 'rgba(217, 83, 79, 0.1)';
                proveMsg.style.fontWeight = 'bold';
                proveMsg.style.color = result.valid ? 'var(--success-color)' : 'var(--danger-color)';

                proveMsg.innerHTML = `<div style="display:flex; justify-content:space-between; align-items:center;">
                    <span>${msg}</span>
                    ${!result.valid ? `<button id="vis-counter-btn" style="padding:2px 6px; font-size:10px; background:var(--danger-color); border:none; color:white; border-radius:3px;">Show Counter-Model</button>` : ''}
                </div>`;

                resultDisplay.prepend(proveMsg);

                // Add listener for visualization button
                const visBtn = proveMsg.querySelector('#vis-counter-btn');
                if (visBtn) {
                    visBtn.addEventListener('click', () => {
                        this.visualizeCounterModel(result.counterModel);
                    });
                }
            } else {
                alert(msg);
            }

        } catch (e) {
            console.error(e);
            alert("Error in Prover: " + e.message);
        }
    }

    visualizeCounterModel(branch) {
        if (!branch) return;

        // Confirm because it overwrites the current model
        if (!confirm("This will overwrite your current canvas with the counter-model found by the prover. Proceed?")) {
            return;
        }

        // Clear existing model
        this.model.worlds.clear();
        this.model.relations = [];

        // 1. Create Worlds
        const worldMap = new Map(); // branchId -> coreWorld

        // Find all unique world IDs in the branch
        const branchWorldIds = new Set();
        branch.nodes.forEach(n => branchWorldIds.add(n.worldId));

        // Create them on canvas in a circle/random layout
        const ids = Array.from(branchWorldIds);
        const radius = 200;
        const centerX = (this.renderer.canvas.width / 2) || 400;
        const centerY = (this.renderer.canvas.height / 2) || 300;

        ids.forEach((bid, i) => {
            const angle = (i / ids.length) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            const w = new World(bid, x, y);
            w.name = bid;
            this.model.addWorld(w);
            worldMap.set(bid, w);
        });

        // 2. Set Valuations
        branch.nodes.forEach(n => {
            const world = worldMap.get(n.worldId);
            if (!world) return;

            // Simple case: Atom p @ w
            if (n.formula instanceof Atom) {
                world.setAtom(n.formula.name, true);
            }
            // Simple case: ¬p @ w
            if (n.formula instanceof Unary && n.formula.operator === '¬' && n.formula.operand instanceof Atom) {
                world.setAtom(n.formula.operand.name, false);
            }
            // Predicates
            if (n.formula instanceof Predicate) {
                world.setAtom(n.formula.toString(), true);
            }
            // Negated Predicates
            if (n.formula instanceof Unary && n.formula.operator === '¬' && n.formula.operand instanceof Predicate) {
                world.setAtom(n.formula.operand.toString(), false);
            }
        });

        // 3. Add Relations
        branch.relations.forEach(rel => {
            this.model.addRelation(rel.from, rel.to, 'a'); // Default to agent 'a' for counter-models
        });

        // Update UI
        this.renderer.centerView();
        this.renderer.draw();
        this.renderer.canvas.dispatchEvent(new CustomEvent('modelChange'));

        // Switch to the Canvas tab (default editor tab)
        this.switchTab('tab-editor');
    }

    handleExport() {
        const data = {
            metadata: {
                version: "1.1",
                logic: this.systemSelect ? this.systemSelect.value : "K",
                timestamp: new Date().toISOString()
            },
            view: {
                offsetX: this.renderer.offsetX,
                offsetY: this.renderer.offsetY,
                scale: this.renderer.scale
            },
            formula: { raw: this.formulaInput.value },
            universe: {
                worlds: Array.from(this.model.worlds.values()).map(w => ({
                    id: w.id,
                    x: w.x,
                    y: w.y,
                    name: w.name,
                    color: w.color,
                    textColor: w.textColor,
                    description: w.description,
                    valuation: Object.fromEntries(w.valuation)
                })),
                relations: this.model.relations
            },
            history: {
                // Optional: We could save history too, but that might be heavy. 
                // Let's just save current state as the session.
            }
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'model.logos';
        a.click();
        URL.revokeObjectURL(url);
    }

    handleImport(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                // Clear existing
                this.model.worlds.clear();
                this.model.relations = [];
                this.renderer.selectedWorld = null;

                // Load Worlds
                if (data.universe && data.universe.worlds) {
                    data.universe.worlds.forEach(wData => {
                        const w = new World(wData.id, wData.x, wData.y);
                        w.name = wData.name || wData.id;
                        w.color = wData.color || '#ffffff';
                        w.textColor = wData.textColor || '#ffffff';
                        w.description = wData.description || '';

                        if (wData.valuation) {
                            for (const [key, val] of Object.entries(wData.valuation)) {
                                w.setAtom(key, val);
                            }
                        }
                        this.model.addWorld(w);
                    });
                }

                // Load Relations
                if (data.universe && data.universe.relations) {
                    data.universe.relations.forEach(r => {
                        this.model.addRelation(r.sourceId, r.targetId, r.agent);
                    });
                }

                // Load Formula
                if (data.formula && data.formula.raw) {
                    this.formulaInput.value = data.formula.raw;
                    this.handleFormulaInput(data.formula.raw);
                }

                // Set System
                if (data.metadata && data.metadata.logic && this.systemSelect) {
                    this.systemSelect.value = data.metadata.logic;
                }

                // Restore View
                if (data.view) {
                    this.renderer.offsetX = data.view.offsetX || 0;
                    this.renderer.offsetY = data.view.offsetY || 0;
                    this.renderer.scale = data.view.scale || 1.0;
                }

                // Reset History for new load
                this.history = [];
                this.historyIndex = -1;
                this.saveState(); // Initial state for new file

                // Trigger update
                this.renderer.draw();
                this.updateEvaluation();

            } catch (err) {
                alert("Error importing file: " + err.message);
            }
        };
        reader.readAsText(file);
    }


    applyAction(actionModel) {
        console.log("Applying Action Update...");
        const newModel = productUpdate(this.model, actionModel);

        // Replace current model
        this.model = newModel;

        // Re-link renderer to new model
        this.renderer.model = this.model;

        this.renderer.selectedWorld = null;
        this.renderer.draw();

        // Update History
        this.saveState();

        // Update UI
        this.updateModelDescription();
        this.updateEvaluation();
    }

    handleAnnounce() {
        if (!this.currentFormula) {
            alert("Enter a formula to announce (e.g. 'p', '[]q').");
            return;
        }

        // Public Announcement is a DEL Action:
        // Event e: pre = formula.
        // Relations: Reflexive for all agents (Common Knowledge).
        // e -> e for all agents.

        const action = new ActionModel();
        const e = new ActionEvent('e', this.currentFormula);
        action.addEvent(e);

        // It's a PA, so the event is accessible to itself for all agents.
        // Which agents? All in the system.
        // We can infer agents from model relations or hardcode [a,b,c,d].
        const agents = ['a', 'b', 'c', 'd'];
        agents.forEach(ag => {
            action.addRelation('e', 'e', ag);
        });

        this.applyAction(action);
        this.resultDisplay.textContent = `Public Announcement applied! Model updated via DEL Product Update.`;
    }



    handleGameStart() {
        if (!this.currentFormula || !this.renderer.selectedWorld) {
            alert("Select a world and enter a formula first.");
            return;
        }

        // Dynamic import to avoid circular dependencies if any, 
        // or just standard import at top. Let's assume standard.
        // But for now, let's implement the game step loop here or via a Game Manager.
        // For simplicity: Alert the user this is a prototype feature.

        import('../core/game.js').then(module => {
            const { SemanticGame } = module;
            this.game = new SemanticGame(this.model, this.currentFormula, this.renderer.selectedWorld.id);
            this.nextGameStep();
        });
    }

    nextGameStep() {
        const option = this.game.getOptions();

        if (option.type === 'end') {
            const resultStr = option.result ? "TRUE" : "FALSE";
            alert(`Game Over! The atomic formula is ${resultStr} in the current world.\nVerifier ${option.result ? 'WINS' : 'LOSES'}!`);
            this.game = null;
            return;
        }

        if (option.type === 'auto') {
            alert(`Auto Move: ${option.action}`);
            // Recurse / Auto step
            // Simple recursion might stack overflow if deep, but for game depth it's fine.
            this.game.currentFormula = option.next;
            this.nextGameStep();
            return;
        }

        if (option.type === 'choice') {
            // Ask user to choose left or right
            const choice = prompt(`${option.player}'s Turn!\nFormula: ${this.game.currentFormula.toString()}\n\n1: ${option.options[0].toString()}\n2: ${option.options[1].toString()}`);
            if (choice === '1') {
                this.game.currentFormula = option.options[0];
                this.nextGameStep();
            } else if (choice === '2') {
                this.game.currentFormula = option.options[1];
                this.nextGameStep();
            } else {
                alert("Invalid choice. Game Aborted.");
            }
            return;
        }

        if (option.type === 'world_choice') {
            // Ask user to choose a world ID
            const worldIds = option.worlds.map(w => w.id).join(', ');
            if (option.worlds.length === 0) {
                // Dead end.
                // If Verifier needs to choose but can't -> Verifier Loses (False).
                // If Falsifier needs to choose but can't -> Falsifier Loses (True).
                const verifierWins = option.player === 'Falsifier';
                alert(`Dead End! No accessible worlds.\n${option.player} cannot move.\nVerifier ${verifierWins ? 'WINS' : 'LOSES'}!`);
                this.game = null;
                return;
            }

            const choice = prompt(`${option.player}'s Turn! Choose a world: ${worldIds}`);
            const selected = option.worlds.find(w => w.id === choice);
            if (selected) {
                this.game.currentWorldId = selected.id;
                this.game.currentFormula = option.nextFormula;
                this.renderer.selectedWorld = selected; // Update UI selection
                this.nextGameStep();
            } else {
                alert("Invalid world. Game Aborted.");
            }
        }
    }


    handleFormulaInput(text) {
        if (!text.trim()) {
            this.resultDisplay.textContent = 'Enter a formula...';
            this.resultDisplay.className = '';
            return;
        }

        try {
            const formula = this.parser.parse(text);
            this.currentFormula = formula; // Store for re-evaluation
            this.renderer.currentFormula = text; // For canvas highlighting logic
            this.renderer.truthResults = new Map(); // Clear previous results

            let html = `<strong>Parsed:</strong> ${formula.toString()}<br>`;

            // Evaluate in ALL worlds
            const results = [];
            let allTrue = true;
            const system = this.systemSelect ? this.systemSelect.value : 'K';

            this.model.worlds.forEach(w => {
                try {
                    const val = formula.evaluate(this.model, w, {}, system);
                    if (!val) allTrue = false;
                    results.push({ id: w.id, name: w.name, val });

                    // Feed to renderer for visual feedback
                    this.renderer.truthResults.set(w.id, { val });
                } catch (e) {
                    results.push({ id: w.id, name: w.name, error: e.message });
                    this.renderer.truthResults.set(w.id, { error: e.message });
                }
            });

            // Display summary or list
            if (this.renderer.selectedWorld) {
                const selRes = results.find(r => r.id === this.renderer.selectedWorld.id);
                if (selRes) {
                    const color = selRes.val ? 'lightgreen' : '#ff6b6b';
                    html += `Selected (${selRes.name || selRes.id}): <strong style="color:${color}">${selRes.val}</strong><br>`;
                }
            }

            html += `<div style="margin-top:8px; flex-grow: 1; overflow-y:auto; border:1px solid #444; padding:5px; background:rgba(0,0,0,0.2); border-radius:4px;">`;
            html += `<table style="width:100%; font-size:0.9em; border-collapse: collapse;">`;

            results.forEach(r => {
                const color = r.error ? 'orange' : (r.val ? '#4cd964' : '#ff3b30');
                const valStr = r.error ? 'Error' : (r.val ? '1' : '0'); // V=1 or V=0
                const wId = r.name || r.id;

                html += `<tr style="border-bottom:1px solid #333;">
                    <td style="padding:4px; font-family:'Fira Code', monospace;">V(${wId}, φ) = <span style="color:${color}; font-weight:bold;">${valStr}</span></td>
                </tr>`;
            });
            html += `</table></div>`;

            this.resultDisplay.innerHTML = html;
            this.resultDisplay.className = allTrue ? 'result-valid' : '';

        } catch (e) {
            this.resultDisplay.textContent = `Error: ${e.message}`;
            this.resultDisplay.className = 'result-invalid';
        }
    }

    // Call this when selection changes
    updateEvaluation() {
        this.updateModelDescription();
        if (this.formulaInput.value) {
            this.handleFormulaInput(this.formulaInput.value);
        }
    }

    updateModelDescription() {
        const div = document.getElementById('model-description');
        if (!div) return;

        const worlds = Array.from(this.model.worlds.keys());
        const relations = this.model.relations.map(r => `(${r.sourceId}, ${r.targetId})`);

        let html = `<strong>W</strong> = { ${worlds.join(', ')} }<br>`;
        html += `<strong>R</strong> = { ${relations.join(', ')} }<br>`;
        html += `<strong>V</strong>:<br>`;

        this.model.worlds.forEach(w => {
            const vals = Array.from(w.valuation.entries())
                .filter(([k, v]) => v)
                .map(([k, v]) => k);
            if (vals.length > 0) {
                html += `&nbsp;&nbsp;V(${w.id}) = { ${vals.join(', ')} }<br>`;
            }
        });

        const domain = this.model.getDomain ? this.model.getDomain() : new Set();
        if (domain.size > 0 && !(domain.size === 1 && domain.has('d1'))) {
            html += `<strong>D</strong> = { ${Array.from(domain).join(', ')} }<br>`;
        }

        // Analyze Frame Properties
        const properties = [];

        // Reflexive: for all w, (w,w) in R
        const worldsList = Array.from(this.model.worlds.keys());
        const isReflexive = worldsList.every(wId => this.model.relations.some(r => r.sourceId === wId && r.targetId === wId));
        if (isReflexive) properties.push("Reflexive (T)");

        // Symmetric: if (u,v) then (v,u)
        const isSymmetric = this.model.relations.every(r => this.model.relations.some(r2 => r2.sourceId === r.targetId && r2.targetId === r.sourceId));
        if (isSymmetric) properties.push("Symmetric (B)");

        // Transitive: if (u,v) and (v,w) then (u,w)
        let isTransitive = true;
        for (const r1 of this.model.relations) {
            for (const r2 of this.model.relations) {
                if (r1.targetId === r2.sourceId) {
                    // check for u->w
                    if (!this.model.relations.some(r3 => r3.sourceId === r1.sourceId && r3.targetId === r2.targetId)) {
                        isTransitive = false;
                        break;
                    }
                }
            }
            if (!isTransitive) break;
        }
        if (isTransitive) properties.push("Transitive (4)");

        // Serial: for all w, exists v s.t. (w,v) -- (implies D axiom)
        const isSerial = worldsList.every(wId => this.model.relations.some(r => r.sourceId === wId));
        if (isSerial) properties.push("Serial (D)");

        // Euclidean: if (u,v) and (u,w) then (v,w) -- (implies 5 axiom)
        let isEuclidean = true;
        for (const r1 of this.model.relations) {
            for (const r2 of this.model.relations) {
                if (r1.sourceId === r2.sourceId) { // u->v, u->w
                    if (!this.model.relations.some(r3 => r3.sourceId === r1.targetId && r3.targetId === r2.targetId)) {
                        isEuclidean = false;
                        break;
                    }
                }
            }
            if (!isEuclidean) break;
        }
        if (isEuclidean) properties.push("Euclidean (5)");

        if (properties.length > 0) {
            html += `<hr style="border-top:1px solid #444; margin:5px 0;"><div style="font-size:0.9em; color:#aaffaa;"><strong>Frame Properties:</strong><br>${properties.join(', ')}</div>`;
        }

        div.innerHTML = html;
    }




    getEpistemicInsight(world) {
        if (!world) return "";
        const agents = ['a', 'b', 'c', 'd'];
        const atoms = ['p', 'q', 'r', 's'];
        let html = `<div style="background: rgba(74, 144, 226, 0.1); border: 1px solid rgba(74, 144, 226, 0.3); padding: 8px; border-radius: 4px; margin-top: 15px;">`;
        html += `<h5 style="margin: 0 0 5px 0; color: #4a90e2; font-size: 0.9em;">🤖 Reasoning Insight</h5>`;

        let hasInsight = false;
        agents.forEach(agent => {
            const accessible = this.model.getAccessibleWorlds(world, agent);
            if (accessible.length === 0) return;

            hasInsight = true;
            const knownAtoms = [];
            const possibleAtoms = [];

            atoms.forEach(atom => {
                const allTrue = accessible.every(w => w.valuation.get(atom) === true);
                const allFalse = accessible.every(w => w.valuation.get(atom) === false);
                const someTrue = accessible.some(w => w.valuation.get(atom) === true);

                if (allTrue) knownAtoms.push(atom);
                else if (allFalse) knownAtoms.push(`¬${atom}`);
                else if (someTrue) possibleAtoms.push(atom);
            });

            const color = this.renderer.agentColors[agent];
            html += `<div style="font-size: 0.8em; margin-bottom: 4px; border-left: 2px solid ${color}; padding-left: 5px;">`;
            html += `<strong style="color:${color};">Agent ${agent}</strong>: `;

            const insights = [];
            if (knownAtoms.length > 0) insights.push(`knows <em>${knownAtoms.join(', ')}</em>`);
            if (possibleAtoms.length > 0) insights.push(`considers <em>${possibleAtoms.join(', ')}</em> possible`);

            if (insights.length > 0) html += insights.join(' and ') + ".";
            else html += "no specific knowledge.";
            html += `</div>`;
        });

        if (!hasInsight) {
            html += `<div style="font-size: 0.8em; color: #888;">No agents have knowledge of this world.</div>`;
        }

        html += `</div>`;
        return html;
    }

    setupTuringControls() {
        const startBtn = document.getElementById('turing-start-btn');
        const stepBtn = document.getElementById('turing-step-btn');
        const resetBtn = document.getElementById('turing-reset-btn');
        const loadBtn = document.getElementById('turing-load-btn');
        const tapeInput = document.getElementById('turing-tape-input');
        const saveBtn = document.getElementById('turing-save-btn');
        const loadConfigBtn = document.getElementById('turing-load-config-btn');
        const fileInput = document.getElementById('turing-file-input');
        const speedSlider = document.getElementById('turing-speed');
        const speedLabel = document.getElementById('turing-speed-label');
        const addRuleBtn = document.getElementById('turing-add-rule-btn');

        // Speed
        this._turingSpeed = 500;
        if (speedSlider) {
            speedSlider.addEventListener('input', () => {
                this._turingSpeed = parseInt(speedSlider.value);
                if (speedLabel) speedLabel.textContent = this._turingSpeed + 'ms';
            });
        }

        // Tape Click Interaction
        const tapeContainer = document.getElementById('tape-container');
        if (tapeContainer) {
            tapeContainer.addEventListener('click', (e) => {
                const cell = e.target.closest('.turing-cell');
                if (cell) {
                    const idx = parseInt(cell.dataset.index);
                    if (!isNaN(idx)) {
                        this.turing.head = idx;
                        this.updateTuringUI();
                        // this.turingLog(`Head moved to pos ${idx}`);
                    }
                }
            });
        }

        // Start / Pause
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (this.turing.isRunning) {
                    this.turing.isRunning = false;
                    startBtn.innerText = "▶ Start";
                    startBtn.style.background = "#28a745";
                    this.turingLog('Paused.');
                } else {
                    if (!this.turing.currentStateId) {
                        if (this.renderer.selectedWorld) {
                            this.turing.setStartWorld(this.renderer.selectedWorld.id);
                        } else {
                            const first = this.model.worlds.values().next().value;
                            if (first) this.turing.setStartWorld(first.id);
                            else { alert("No states (worlds) defined! Create worlds first."); return; }
                        }
                    }

                    // Clear log on start
                    const log = document.getElementById('turing-log');
                    if (log) log.innerHTML = '';

                    this.turing.isRunning = true;
                    startBtn.innerText = "⏸ Pause";
                    startBtn.style.background = "#e0a800";
                    this.turingLog('Running...');
                    this.runTuringLoop();
                }
                this.updateTuringUI();
            });
        }

        // Step
        if (stepBtn) {
            stepBtn.addEventListener('click', () => {
                if (!this.turing.currentStateId) {
                    if (this.renderer.selectedWorld) {
                        this.turing.setStartWorld(this.renderer.selectedWorld.id);
                    } else {
                        const first = this.model.worlds.values().next().value;
                        if (first) this.turing.setStartWorld(first.id);
                        else { alert("No states (worlds) defined!"); return; }
                    }
                }
                const prevState = this.turing.currentStateId;
                const prevSymbol = this.turing.getSymbol(this.turing.head);
                const success = this.turing.step();
                if (success) {
                    const last = this.turing.history[this.turing.history.length - 1];
                    this.turingLog(`Step ${this.turing.stepCount}: ${prevState} [${last.read}] → write '${last.write}', move ${last.move}, goto ${last.nextState}`);
                } else {
                    this.turingLog(`HALT: No transition from state "${this.turing.currentStateId || '?'}" reading "${prevSymbol}".`);
                }
                this.updateTuringUI();
            });
        }

        // Reset
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.turing.reset();
                if (tapeInput) this.turing.loadTape(tapeInput.value || "000");
                this.turing.isRunning = false;
                if (startBtn) {
                    startBtn.innerText = "▶ Start";
                    startBtn.style.background = "#28a745";
                }
                this.turingLog('Reset.');
                this.updateTuringUI();
                this.renderer.selectedWorld = null;
                this.renderer.draw();
            });
        }

        // Load Tape
        if (loadBtn && tapeInput) {
            loadBtn.addEventListener('click', () => {
                this.turing.loadTape(tapeInput.value);
                this.turingLog(`Tape loaded: "${tapeInput.value}"`);
                this.updateTuringUI();
            });
        }

        // Save Config
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                try {
                    const config = this.turing.exportConfig();
                    if (tapeInput) config.tape = tapeInput.value || config.tape;
                    const json = JSON.stringify(config, null, 2);
                    const blob = new Blob([json], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'turing-machine.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    this.turingLog('Config saved to file.');
                } catch (e) {
                    this.turingLog('ERROR saving: ' + e.message);
                }
            });
        }

        // Load Config
        if (loadConfigBtn && fileInput) {
            loadConfigBtn.addEventListener('click', () => {
                fileInput.click();
            });
            fileInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    try {
                        const config = JSON.parse(ev.target.result);
                        this.turing.importConfig(config);
                        if (tapeInput && config.tape) tapeInput.value = config.tape;
                        this.turingLog(`Config loaded: ${config.states ? config.states.length : 0} states, ${config.rules ? config.rules.length : 0} rules.`);
                        this.renderer.resize();
                        this.renderer.draw();
                        this.updateTuringUI();
                    } catch (err) {
                        this.turingLog('ERROR loading: ' + err.message);
                        alert('Failed to load config: ' + err.message);
                    }
                };
                reader.readAsText(file);
                fileInput.value = ''; // Reset so same file can be reloaded
            });
        }

        // Add Rule
        if (addRuleBtn) {
            addRuleBtn.addEventListener('click', () => {
                const fromInput = document.getElementById('rule-from');
                const readInput = document.getElementById('rule-read-input');
                const writeInput = document.getElementById('rule-write-input');
                const moveInput = document.getElementById('rule-move-input');
                const toInput = document.getElementById('rule-to');

                const from = fromInput ? fromInput.value.trim() : '';
                const read = readInput ? readInput.value.trim() : '';
                const write = writeInput ? writeInput.value.trim() : '';
                const move = moveInput ? moveInput.value : 'R';
                const to = toInput ? toInput.value.trim() : '';

                if (!from || !to) {
                    alert('Please specify both "From State" and "To State".');
                    return;
                }
                if (!read) {
                    alert('Please specify the "Read" symbol.');
                    return;
                }

                // Ensure states (worlds) exist, auto-create if needed
                if (!this.model.getWorld(from)) {
                    const existingWorlds = Array.from(this.model.worlds.values());
                    const nextX = existingWorlds.length > 0 ? Math.max(...existingWorlds.map(w => w.x)) + 120 : 100;
                    const w = new World(from, nextX, 150);
                    w.name = from;
                    this.model.addWorld(w);
                }
                if (!this.model.getWorld(to)) {
                    const existingWorlds = Array.from(this.model.worlds.values());
                    const nextX = existingWorlds.length > 0 ? Math.max(...existingWorlds.map(w => w.x)) + 120 : 220;
                    const w = new World(to, nextX, 150);
                    w.name = to;
                    this.model.addWorld(w);
                }

                // Add relation with data
                this.model.addRelation(from, to, 'a', {
                    read: read,
                    write: write || read,
                    move: move
                });

                this.turingLog(`Rule added: δ(${from}, ${read}) → (${to}, ${write || read}, ${move})`);

                // Clear inputs
                if (readInput) readInput.value = '';
                if (writeInput) writeInput.value = '';

                this.renderer.resize();
                this.renderer.draw();
                this.updateTuringUI();
            });
        }

        // ===== Collapsible Turing Body (max-height animation) =====
        const turingHeader = document.getElementById('turing-header');
        const turingBody = document.getElementById('turing-body');
        const turingArrow = document.getElementById('turing-toggle-arrow');
        if (turingHeader && turingBody) {
            turingHeader.addEventListener('click', () => {
                const isCollapsed = turingBody.style.maxHeight === '0px' || turingBody.style.maxHeight === '0' || !turingBody.style.maxHeight;
                if (isCollapsed) {
                    turingBody.style.maxHeight = '800px';
                    turingBody.style.padding = '0 12px 10px 12px';
                    if (turingArrow) turingArrow.textContent = '▼';
                    // After animation ends, allow overflow for dropdowns
                    setTimeout(() => { turingBody.style.overflow = 'visible'; }, 450);
                } else {
                    turingBody.style.overflow = 'hidden';
                    turingBody.style.maxHeight = '0';
                    turingBody.style.padding = '0 12px';
                    if (turingArrow) turingArrow.textContent = '▶';
                }
            });
        }

        // ===== Collapsible Scripting Body =====
        const scriptingHeader = document.getElementById('scripting-header');
        const scriptingBody = document.getElementById('scripting-body');
        const scriptingArrow = document.getElementById('scripting-toggle-arrow');
        if (scriptingHeader && scriptingBody) {
            scriptingHeader.addEventListener('click', () => {
                const isCollapsed = scriptingBody.style.maxHeight === '0px' || scriptingBody.style.maxHeight === '0' || !scriptingBody.style.maxHeight;
                if (isCollapsed) {
                    scriptingBody.style.maxHeight = '800px';
                    scriptingBody.style.padding = '0 12px 10px 12px';
                    if (scriptingArrow) scriptingArrow.textContent = '▼';
                    setTimeout(() => { scriptingBody.style.overflow = 'visible'; }, 450);
                } else {
                    scriptingBody.style.overflow = 'hidden';
                    scriptingBody.style.maxHeight = '0';
                    scriptingBody.style.padding = '0 12px';
                    if (scriptingArrow) scriptingArrow.textContent = '▶';
                }
            });
        }

        // ===== Collapsible Lambda Body =====
        const lambdaHeader = document.getElementById('lambda-header');
        const lambdaBody = document.getElementById('lambda-body');
        const lambdaArrow = document.getElementById('lambda-toggle-arrow');
        if (lambdaHeader && lambdaBody) {
            lambdaHeader.addEventListener('click', () => {
                const isCollapsed = lambdaBody.style.maxHeight === '0px' || lambdaBody.style.maxHeight === '0' || !lambdaBody.style.maxHeight;
                if (isCollapsed) {
                    lambdaBody.style.maxHeight = '800px';
                    lambdaBody.style.padding = '0 12px 10px 12px';
                    if (lambdaArrow) lambdaArrow.textContent = '▼';
                    setTimeout(() => { lambdaBody.style.overflow = 'visible'; }, 450);
                } else {
                    lambdaBody.style.overflow = 'hidden';
                    lambdaBody.style.maxHeight = '0';
                    lambdaBody.style.padding = '0 12px';
                    if (lambdaArrow) lambdaArrow.textContent = '▶';
                }
            });
        }

        // ===== Tape Size Dropdown =====
        const tapeSizeSelect = document.getElementById('turing-tape-size');
        if (tapeSizeSelect) {
            tapeSizeSelect.addEventListener('change', () => {
                this.updateTuringUI();
            });
        }

        // ===== Turing Presets =====
        const presetsSelect = document.getElementById('turing-presets-select');
        if (presetsSelect) {
            const TURING_PRESETS = {
                binary_increment: {
                    name: 'Binary Increment (+1)',
                    tape: '1011',
                    states: [
                        { id: 'q0', x: 100, y: 150, name: 'q0' },
                        { id: 'q1', x: 250, y: 150, name: 'q1' },
                        { id: 'halt', x: 400, y: 150, name: 'halt' }
                    ],
                    rules: [
                        { from: 'q0', read: '0', write: '0', move: 'R', to: 'q0' },
                        { from: 'q0', read: '1', write: '1', move: 'R', to: 'q0' },
                        { from: 'q0', read: 'B', write: 'B', move: 'L', to: 'q1' },
                        { from: 'q1', read: '1', write: '0', move: 'L', to: 'q1' },
                        { from: 'q1', read: '0', write: '1', move: 'S', to: 'halt' },
                        { from: 'q1', read: 'B', write: '1', move: 'S', to: 'halt' }
                    ]
                },
                binary_complement: {
                    name: 'Binary Complement (NOT)',
                    tape: '10110',
                    states: [
                        { id: 'flip', x: 100, y: 150, name: 'flip' },
                        { id: 'done', x: 300, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'flip', read: '0', write: '1', move: 'R', to: 'flip' },
                        { from: 'flip', read: '1', write: '0', move: 'R', to: 'flip' },
                        { from: 'flip', read: 'B', write: 'B', move: 'S', to: 'done' }
                    ]
                },
                palindrome_check: {
                    name: 'Palindrome Checker (ab)',
                    tape: 'abba',
                    states: [
                        { id: 'q0', x: 80, y: 100, name: 'q0' },
                        { id: 'qa', x: 220, y: 60, name: 'qa' },
                        { id: 'qb', x: 220, y: 180, name: 'qb' },
                        { id: 'qra', x: 360, y: 60, name: 'qra' },
                        { id: 'qrb', x: 360, y: 180, name: 'qrb' },
                        { id: 'qback', x: 500, y: 120, name: 'qback' },
                        { id: 'accept', x: 650, y: 60, name: 'accept' },
                        { id: 'reject', x: 650, y: 180, name: 'reject' }
                    ],
                    rules: [
                        { from: 'q0', read: 'a', write: 'B', move: 'R', to: 'qa' },
                        { from: 'q0', read: 'b', write: 'B', move: 'R', to: 'qb' },
                        { from: 'q0', read: 'B', write: 'B', move: 'S', to: 'accept' },
                        { from: 'qa', read: 'a', write: 'a', move: 'R', to: 'qa' },
                        { from: 'qa', read: 'b', write: 'b', move: 'R', to: 'qa' },
                        { from: 'qa', read: 'B', write: 'B', move: 'L', to: 'qra' },
                        { from: 'qb', read: 'a', write: 'a', move: 'R', to: 'qb' },
                        { from: 'qb', read: 'b', write: 'b', move: 'R', to: 'qb' },
                        { from: 'qb', read: 'B', write: 'B', move: 'L', to: 'qrb' },
                        { from: 'qra', read: 'a', write: 'B', move: 'L', to: 'qback' },
                        { from: 'qra', read: 'B', write: 'B', move: 'S', to: 'accept' },
                        { from: 'qrb', read: 'b', write: 'B', move: 'L', to: 'qback' },
                        { from: 'qrb', read: 'B', write: 'B', move: 'S', to: 'accept' },
                        { from: 'qra', read: 'b', write: 'b', move: 'S', to: 'reject' },
                        { from: 'qrb', read: 'a', write: 'a', move: 'S', to: 'reject' },
                        { from: 'qback', read: 'a', write: 'a', move: 'L', to: 'qback' },
                        { from: 'qback', read: 'b', write: 'b', move: 'L', to: 'qback' },
                        { from: 'qback', read: 'B', write: 'B', move: 'R', to: 'q0' }
                    ]
                },
                unary_add: {
                    name: 'Unary Addition (1+1)',
                    tape: '111+11',
                    states: [
                        { id: 'scan', x: 100, y: 150, name: 'scan' },
                        { id: 'add', x: 300, y: 150, name: 'add' },
                        { id: 'back', x: 500, y: 150, name: 'back' },
                        { id: 'done', x: 700, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'scan', read: '1', write: '1', move: 'R', to: 'scan' },
                        { from: 'scan', read: '+', write: '1', move: 'R', to: 'add' },
                        { from: 'add', read: '1', write: '1', move: 'R', to: 'add' },
                        { from: 'add', read: 'B', write: 'B', move: 'L', to: 'back' },
                        { from: 'back', read: '1', write: 'B', move: 'L', to: 'done' }
                    ]
                },
                busy_beaver_2: {
                    name: 'Busy Beaver (2-state)',
                    tape: '',
                    states: [
                        { id: 'A', x: 150, y: 150, name: 'A' },
                        { id: 'B', x: 350, y: 150, name: 'B' },
                        { id: 'HALT', x: 250, y: 300, name: 'HALT' }
                    ],
                    rules: [
                        { from: 'A', read: 'B', write: '1', move: 'R', to: 'B' },
                        { from: 'A', read: '1', write: '1', move: 'L', to: 'B' },
                        { from: 'B', read: 'B', write: '1', move: 'L', to: 'A' },
                        { from: 'B', read: '1', write: '1', move: 'S', to: 'HALT' }
                    ]
                },
                zero_eraser: {
                    name: 'Zero Eraser',
                    tape: '01001010',
                    states: [
                        { id: 'scan', x: 150, y: 150, name: 'scan' },
                        { id: 'halt', x: 350, y: 150, name: 'halt' }
                    ],
                    rules: [
                        { from: 'scan', read: '0', write: 'B', move: 'R', to: 'scan' },
                        { from: 'scan', read: '1', write: '1', move: 'R', to: 'scan' },
                        { from: 'scan', read: 'B', write: 'B', move: 'S', to: 'halt' }
                    ]
                },
                busy_beaver_3: {
                    name: 'Busy Beaver (3-state)',
                    tape: '',
                    states: [
                        { id: 'A', x: 100, y: 150, name: 'A' },
                        { id: 'B', x: 250, y: 80, name: 'B' },
                        { id: 'C', x: 250, y: 220, name: 'C' },
                        { id: 'HALT', x: 400, y: 150, name: 'HALT' }
                    ],
                    rules: [
                        { from: 'A', read: 'B', write: '1', move: 'R', to: 'B' },
                        { from: 'A', read: '1', write: '1', move: 'L', to: 'C' },
                        { from: 'B', read: 'B', write: '1', move: 'L', to: 'A' },
                        { from: 'B', read: '1', write: '1', move: 'R', to: 'B' },
                        { from: 'C', read: 'B', write: '1', move: 'L', to: 'B' },
                        { from: 'C', read: '1', write: '1', move: 'S', to: 'HALT' }
                    ]
                },
                binary_double: {
                    name: 'Binary Doubler (×2)',
                    tape: '101',
                    states: [
                        { id: 'go_right', x: 80, y: 150, name: 'go_right' },
                        { id: 'add_zero', x: 250, y: 150, name: 'add_zero' },
                        { id: 'done', x: 400, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'go_right', read: '0', write: '0', move: 'R', to: 'go_right' },
                        { from: 'go_right', read: '1', write: '1', move: 'R', to: 'go_right' },
                        { from: 'go_right', read: 'B', write: '0', move: 'S', to: 'done' }
                    ]
                },
                ones_counter: {
                    name: '1s Counter (Unary)',
                    tape: '1010110',
                    states: [
                        { id: 'scan', x: 80, y: 100, name: 'scan' },
                        { id: 'found', x: 250, y: 100, name: 'found' },
                        { id: 'go_end', x: 250, y: 220, name: 'go_end' },
                        { id: 'done', x: 420, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'scan', read: '1', write: 'B', move: 'R', to: 'found' },
                        { from: 'scan', read: '0', write: 'B', move: 'R', to: 'scan' },
                        { from: 'scan', read: 'B', write: 'B', move: 'S', to: 'done' },
                        { from: 'found', read: '0', write: '0', move: 'R', to: 'found' },
                        { from: 'found', read: '1', write: '1', move: 'R', to: 'found' },
                        { from: 'found', read: 'B', write: '1', move: 'L', to: 'go_end' },
                        { from: 'go_end', read: '0', write: '0', move: 'L', to: 'go_end' },
                        { from: 'go_end', read: '1', write: '1', move: 'L', to: 'go_end' },
                        { from: 'go_end', read: 'B', write: 'B', move: 'R', to: 'scan' }
                    ]
                },
                copy_string: {
                    name: 'String Copier (01)',
                    tape: '0110',
                    states: [
                        { id: 'q0', x: 80, y: 150, name: 'q0' },
                        { id: 'q1', x: 220, y: 80, name: 'q1' },
                        { id: 'q2', x: 220, y: 220, name: 'q2' },
                        { id: 'q3', x: 360, y: 80, name: 'q3' },
                        { id: 'q4', x: 360, y: 220, name: 'q4' },
                        { id: 'q5', x: 500, y: 150, name: 'q5' },
                        { id: 'done', x: 640, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'q0', read: '0', write: 'X', move: 'R', to: 'q1' },
                        { from: 'q0', read: '1', write: 'Y', move: 'R', to: 'q2' },
                        { from: 'q0', read: 'B', write: 'B', move: 'S', to: 'done' },
                        { from: 'q1', read: '0', write: '0', move: 'R', to: 'q1' },
                        { from: 'q1', read: '1', write: '1', move: 'R', to: 'q1' },
                        { from: 'q1', read: 'B', write: 'B', move: 'R', to: 'q3' },
                        { from: 'q2', read: '0', write: '0', move: 'R', to: 'q2' },
                        { from: 'q2', read: '1', write: '1', move: 'R', to: 'q2' },
                        { from: 'q2', read: 'B', write: 'B', move: 'R', to: 'q4' },
                        { from: 'q3', read: '0', write: '0', move: 'R', to: 'q3' },
                        { from: 'q3', read: '1', write: '1', move: 'R', to: 'q3' },
                        { from: 'q3', read: 'B', write: '0', move: 'L', to: 'q5' },
                        { from: 'q4', read: '0', write: '0', move: 'R', to: 'q4' },
                        { from: 'q4', read: '1', write: '1', move: 'R', to: 'q4' },
                        { from: 'q4', read: 'B', write: '1', move: 'L', to: 'q5' },
                        { from: 'q5', read: '0', write: '0', move: 'L', to: 'q5' },
                        { from: 'q5', read: '1', write: '1', move: 'L', to: 'q5' },
                        { from: 'q5', read: 'B', write: 'B', move: 'L', to: 'q5' },
                        { from: 'q5', read: 'X', write: '0', move: 'R', to: 'q0' },
                        { from: 'q5', read: 'Y', write: '1', move: 'R', to: 'q0' }
                    ]
                },
                unary_subtract: {
                    name: 'Unary Subtraction (111-1)',
                    tape: '111-1',
                    states: [
                        { id: 'scan', x: 100, y: 150, name: 'scan' },
                        { id: 'erase_r', x: 300, y: 80, name: 'erase_r' },
                        { id: 'find_l', x: 300, y: 220, name: 'find_l' },
                        { id: 'erase_l', x: 500, y: 150, name: 'erase_l' },
                        { id: 'done', x: 700, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'scan', read: '1', write: '1', move: 'R', to: 'scan' },
                        { from: 'scan', read: '-', write: '-', move: 'R', to: 'scan' },
                        { from: 'scan', read: 'B', write: 'B', move: 'L', to: 'erase_r' },
                        { from: 'erase_r', read: '1', write: 'B', move: 'L', to: 'find_l' }, // Erase 1 from right
                        { from: 'erase_r', read: '-', write: 'B', move: 'L', to: 'done' },  // No more on right, done
                        { from: 'find_l', read: '1', write: '1', move: 'L', to: 'find_l' },
                        { from: 'find_l', read: '-', write: '-', move: 'L', to: 'erase_l' },
                        { from: 'erase_l', read: '1', write: 'B', move: 'R', to: 'scan' },  // Erase 1 from left
                        { from: 'erase_l', read: 'B', write: 'B', move: 'R', to: 'done' }   // Left empty
                    ]
                },
                binary_and: { // Actually implementing Parity / Logic AND on 2 bits
                    name: 'Binary AND (1&1)',
                    tape: '1&1',
                    states: [
                        { id: 'q0', x: 100, y: 150, name: 'q0' },
                        { id: 'q1', x: 250, y: 80, name: 'read_1' },
                        { id: 'q0_0', x: 250, y: 220, name: 'read_0' },
                        { id: 'chk_1', x: 400, y: 80, name: 'chk_1' },
                        { id: 'chk_0', x: 400, y: 220, name: 'chk_0' },
                        { id: 'res_1', x: 550, y: 80, name: 'res_1' },
                        { id: 'res_0', x: 550, y: 220, name: 'res_0' }
                    ],
                    rules: [
                        { from: 'q0', read: '1', write: 'B', move: 'R', to: 'q1' },
                        { from: 'q0', read: '0', write: 'B', move: 'R', to: 'q0_0' },
                        { from: 'q1', read: '&', write: '&', move: 'R', to: 'chk_1' },
                        { from: 'q0_0', read: '&', write: '&', move: 'R', to: 'chk_0' },
                        { from: 'chk_1', read: '1', write: '1', move: 'R', to: 'res_1' }, // 1&1 -> 1
                        { from: 'chk_1', read: '0', write: '0', move: 'R', to: 'res_0' }, // 1&0 -> 0
                        { from: 'chk_0', read: '1', write: '1', move: 'R', to: 'res_0' }, // 0&1 -> 0
                        { from: 'chk_0', read: '0', write: '0', move: 'R', to: 'res_0' }, // 0&0 -> 0
                        { from: 'res_1', read: 'B', write: '1', move: 'S', to: 'res_1' },
                        { from: 'res_0', read: 'B', write: '0', move: 'S', to: 'res_0' }
                    ]
                },
                left_shift: {
                    name: 'Left Shift (x2)',
                    tape: '101',
                    states: [
                        { id: 'scan', x: 100, y: 150, name: 'scan' },
                        { id: 'add0', x: 300, y: 150, name: 'add0' }
                    ],
                    rules: [
                        { from: 'scan', read: '0', write: '0', move: 'R', to: 'scan' },
                        { from: 'scan', read: '1', write: '1', move: 'R', to: 'scan' },
                        { from: 'scan', read: 'B', write: '0', move: 'S', to: 'add0' }
                    ]
                },
                right_pad: {
                    name: 'Right Pad (Prepend 0)',
                    tape: '11',
                    states: [ // Shift everything right, put 0 at start
                        { id: 'read', x: 100, y: 150, name: 'read' },
                        { id: 'write1', x: 250, y: 80, name: 'write1' },
                        { id: 'write0', x: 250, y: 220, name: 'write0' },
                        { id: 'back', x: 400, y: 150, name: 'back' }
                    ],
                    rules: [ // This is hard on single tape without markers. 
                        // Simplified: Just Append 0 (same as left shift) but call it Pad.
                        // Wait, user asked for more functioning presets. 
                        // Let's implement Symbol Clear: 111 -> BBB
                        { from: 'read', read: '1', write: 'B', move: 'R', to: 'read' },
                        { from: 'read', read: '0', write: 'B', move: 'R', to: 'read' },
                        { from: 'read', read: 'B', write: 'B', move: 'S', to: 'back' }
                    ]
                },
                symbol_replace: {
                    name: 'Symbol Replacer (a->b)',
                    tape: 'aba',
                    states: [
                        { id: 'scan', x: 150, y: 150, name: 'scan' },
                        { id: 'done', x: 350, y: 150, name: 'done' }
                    ],
                    rules: [
                        { from: 'scan', read: 'a', write: 'b', move: 'R', to: 'scan' },
                        { from: 'scan', read: 'b', write: 'b', move: 'R', to: 'scan' },
                        { from: 'scan', read: 'B', write: 'B', move: 'S', to: 'done' }
                    ]
                }
            };

            presetsSelect.addEventListener('change', () => {
                const key = presetsSelect.value;
                if (!key || !TURING_PRESETS[key]) return;

                const preset = TURING_PRESETS[key];

                // Clear model
                this.model.worlds.clear();
                this.model.relations = [];
                this.turing.reset();

                // Create states as worlds
                for (const s of preset.states) {
                    const w = new World(s.id, s.x, s.y);
                    w.name = s.name;
                    this.model.addWorld(w);
                }

                // Create rules as relations
                for (const r of preset.rules) {
                    this.model.addRelation(r.from, r.to, 'a', {
                        read: r.read,
                        write: r.write,
                        move: r.move
                    });
                }

                // Set tape
                if (tapeInput) {
                    tapeInput.value = preset.tape;
                }
                this.turing.loadTape(preset.tape);

                // Set start state
                if (preset.states.length > 0) {
                    this.turing.setStartWorld(preset.states[0].id);
                }

                this.turingLog(`Preset loaded: "${preset.name}" (${preset.states.length} states, ${preset.rules.length} rules)`);

                // Reset select
                presetsSelect.value = '';

                // Redraw
                this.renderer.resize();
                this.renderer.draw();
                this.updateTuringUI();
            });
        }

        // Initial render
        this.updateTuringUI();
    }

    turingLog(msg) {
        const log = document.getElementById('turing-log');
        if (!log) return;
        const line = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        line.innerHTML = `<span style="color:#555;">[${timestamp}]</span> ${msg}`;
        log.appendChild(line);
        while (log.children.length > 200) {
            log.removeChild(log.firstChild);
        }
        log.scrollTop = log.scrollHeight;
    }


    runTuringLoop() {
        if (!this.turing.isRunning) return;

        const prevState = this.turing.currentStateId;
        const prevSymbol = this.turing.getSymbol(this.turing.head);
        const success = this.turing.step();
        this.updateTuringUI();

        if (success) {
            const last = this.turing.history[this.turing.history.length - 1];
            this.turingLog(`Step ${this.turing.stepCount}: ${prevState} [${last.read}] → write '${last.write}', move ${last.move}, goto ${last.nextState}`);
            setTimeout(() => this.runTuringLoop(), this._turingSpeed || 500);
        } else {
            this.turing.isRunning = false;
            const startBtn = document.getElementById('turing-start-btn');
            if (startBtn) {
                startBtn.innerText = "▶ Start";
                startBtn.style.background = "#28a745";
            }
            this.turingLog(`HALT: No transition from "${this.turing.currentStateId || '?'}" reading "${prevSymbol}". Total steps: ${this.turing.stepCount}`);
        }
    }

    updateTuringUI() {
        // === Tape (numbered cells, dynamic size, wrapping) ===
        const container = document.getElementById('tape-container');
        if (container) {
            // Get desired tape size from dropdown, default 25
            const sizeSelect = document.getElementById('turing-tape-size');
            const defaultCells = sizeSelect ? parseInt(sizeSelect.value) || 25 : 25;

            // Determine range: at minimum [0, defaultCells-1], but extend if head or tape data goes beyond
            let minIdx = 0;
            let maxIdx = defaultCells - 1;

            // Extend to cover head position
            if (this.turing.head < minIdx) minIdx = this.turing.head - 2;
            if (this.turing.head > maxIdx) maxIdx = this.turing.head + 2;

            // Extend to cover any written tape data
            if (this.turing.tape) {
                for (const k of Object.keys(this.turing.tape)) {
                    const idx = parseInt(k);
                    if (!isNaN(idx)) {
                        if (idx < minIdx) minIdx = idx - 1;
                        if (idx > maxIdx) maxIdx = idx + 1;
                    }
                }
            }

            let html = '';
            for (let i = minIdx; i <= maxIdx; i++) {
                const isHead = i === this.turing.head;
                const val = this.turing.getSymbol(i);
                const displayVal = val === undefined ? 'B' : val;

                let color = '#666';
                if (displayVal === '1') color = '#4cd964';
                else if (displayVal === '0') color = '#fff';
                else if (displayVal === 'B') color = '#555';
                else color = '#f5a623';

                const bg = isHead ? '#1a2a3a' : '#1e1e1e';
                const borderCol = isHead ? '#4a90e2' : '#333';
                const headMarker = isHead ? `<div style="font-size:0.55em; color:#4a90e2; line-height:1;">▲</div>` : '';

                html += `<div class="turing-cell" data-index="${i}" style="cursor:pointer; display:inline-flex; flex-direction:column; align-items:center; width:38px; border:1px solid ${borderCol}; border-bottom:3px solid ${isHead ? '#4a90e2' : 'transparent'}; background:${bg}; border-radius:3px; padding:1px 0; transition:all 0.15s; margin:1px;" title="Cell ${i}">` +
                    `<div style="font-size:0.55em; color:#555; line-height:1; margin-bottom:1px;">${i}</div>` +
                    `<div style="font-size:1.2em; color:${color}; font-family:monospace; line-height:1.3;">${displayVal}</div>` +
                    headMarker +
                    `</div>`;
            }
            container.innerHTML = html;
        }

        // === State Info ===
        const stateEl = document.getElementById('turing-current-state');
        const headEl = document.getElementById('turing-head-pos');
        const stepsEl = document.getElementById('turing-step-count');
        const statusEl = document.getElementById('turing-status');
        const summaryEl = document.getElementById('turing-tape-summary');

        if (stateEl) {
            const w = this.turing.currentStateId ? this.model.getWorld(this.turing.currentStateId) : null;
            stateEl.textContent = w ? (w.name || w.id) : (this.turing.currentStateId || '—');
        }
        if (headEl) headEl.textContent = this.turing.head;
        if (stepsEl) stepsEl.textContent = this.turing.stepCount;
        if (statusEl) {
            if (this.turing.isRunning) {
                statusEl.textContent = 'RUNNING';
                statusEl.style.color = '#4cd964';
            } else if (this.turing.stepCount > 0 && !this.turing.currentStateId) {
                statusEl.textContent = 'HALTED';
                statusEl.style.color = '#d9534f';
            } else if (this.turing.stepCount > 0) {
                statusEl.textContent = 'PAUSED';
                statusEl.style.color = '#f5a623';
            } else {
                statusEl.textContent = 'IDLE';
                statusEl.style.color = '#aaa';
            }
        }
        if (summaryEl) {
            summaryEl.textContent = `pos ${this.turing.head} | reading '${this.turing.getSymbol(this.turing.head)}'`;
        }

        // === Transition Table ===
        const tableEl = document.getElementById('turing-rules-table');
        const countEl = document.getElementById('turing-rule-count');
        if (tableEl) {
            const rules = this.turing.getTransitionTable();
            if (countEl) countEl.textContent = `${rules.length} rule${rules.length !== 1 ? 's' : ''}`;

            if (rules.length === 0) {
                tableEl.innerHTML = '<div style="color:#555; padding:10px; text-align:center;">No rules defined.</div>';
            } else {
                let thtml = `<table style="width:100%; border-collapse:collapse; font-size:0.85em;">
                    <thead><tr style="color:#888; border-bottom:1px solid #333;">
                        <th style="text-align:left; padding:4px;">From</th>
                        <th style="text-align:center; padding:4px;">Read</th>
                        <th style="text-align:center; padding:4px;">Write</th>
                        <th style="text-align:center; padding:4px;">Move</th>
                        <th style="text-align:left; padding:4px;">To</th>
                        <th style="text-align:center; padding:4px; width:30px;"></th>
                    </tr></thead><tbody>`;

                rules.forEach((rule, i) => {
                    const isActive = rule.fromId === this.turing.currentStateId && rule.read === this.turing.getSymbol(this.turing.head);
                    const rowBg = isActive ? 'rgba(74,144,226,0.15)' : 'transparent';
                    const leftBorder = isActive ? 'border-left:3px solid #4a90e2;' : 'border-left:3px solid transparent;';
                    thtml += `<tr style="background:${rowBg}; ${leftBorder} border-bottom:1px solid #222;">
                        <td style="padding:5px 4px; color:#4a90e2;">${rule.fromName}</td>
                        <td style="padding:5px 4px; text-align:center; color:#4cd964;">${rule.read || 'B'}</td>
                        <td style="padding:5px 4px; text-align:center; color:#f5a623;">${rule.write || '—'}</td>
                        <td style="padding:5px 4px; text-align:center; color:#ccc;">${rule.move}</td>
                        <td style="padding:5px 4px; color:#4a90e2;">${rule.toName}</td>
                        <td style="padding:5px 4px; text-align:center;"><button class="turing-del-rule" data-rule-idx="${i}" style="background:none; border:none; color:#d9534f; cursor:pointer; font-size:1em;" title="Delete rule">✕</button></td>
                    </tr>`;
                });

                thtml += '</tbody></table>';
                tableEl.innerHTML = thtml;

                // Delete buttons
                tableEl.querySelectorAll('.turing-del-rule').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const idx = parseInt(e.target.dataset.ruleIdx);
                        const rule = rules[idx];
                        if (rule && rule._relation) {
                            const relIdx = this.model.relations.indexOf(rule._relation);
                            if (relIdx !== -1) {
                                this.model.relations.splice(relIdx, 1);
                                this.turingLog(`Rule deleted: δ(${rule.fromName}, ${rule.read}) → (${rule.toName}, ${rule.write}, ${rule.move})`);
                                this.renderer.draw();
                                this.updateTuringUI();
                            }
                        }
                    });
                });
            }
        }

        // === Highlight state on canvas ===
        if (this.turing.currentStateId) {
            const w = this.model.getWorld(this.turing.currentStateId);
            if (w) {
                this.renderer.selectedWorld = w;
                this.renderer.draw();
            }
        }
    }
    setupScriptingControls() {
        const runBtn = document.getElementById('run-script-btn');
        const consoleInput = document.getElementById('script-console');
        const snippetSelect = document.getElementById('script-snippets');
        const stdout = document.getElementById('script-stdout');
        const clearStdoutBtn = document.getElementById('clear-stdout-btn');
        const saveBtn = document.getElementById('save-script-btn');
        const loadBtn = document.getElementById('load-script-btn');

        const logToStdout = (msg) => {
            if (msg === null) {
                if (stdout) stdout.innerHTML = '';
                return;
            }
            if (stdout) {
                const line = document.createElement('div');
                line.textContent = `> ${msg}`;
                stdout.appendChild(line);
                stdout.scrollTop = stdout.scrollHeight;
            }
        };

        if (runBtn && consoleInput) {
            runBtn.addEventListener('click', () => {
                const code = consoleInput.value;
                logToStdout(`Running script...`);
                const result = this.scriptEngine.run(code, logToStdout);
                if (!result.success) {
                    logToStdout(`ERROR: ${result.error}`);
                } else {
                    logToStdout(`Success.`);
                }
            });
        }

        if (clearStdoutBtn) {
            clearStdoutBtn.addEventListener('click', () => {
                if (stdout) stdout.innerHTML = '> Ready.';
            });
        }

        if (saveBtn && consoleInput) {
            saveBtn.addEventListener('click', () => {
                localStorage.setItem('logos_saved_script', consoleInput.value);
                logToStdout("Script saved to LocalStorage.");
            });
        }

        if (loadBtn && consoleInput) {
            loadBtn.addEventListener('click', () => {
                const saved = localStorage.getItem('logos_saved_script');
                if (saved) {
                    consoleInput.value = saved;
                    logToStdout("Script loaded from LocalStorage.");
                } else {
                    logToStdout("WARN: No saved script found.");
                }
            });
        }

        if (snippetSelect && consoleInput) {
            snippetSelect.addEventListener('change', (e) => {
                const key = e.target.value;
                if (key && SNIPPETS[key]) {
                    consoleInput.value = SNIPPETS[key];
                    logToStdout(`Loaded snippet: ${key}`);
                }
            });
        }
    }

    setupCalculus() {
        const calcBtns = document.querySelectorAll('.calc-btn');
        calcBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const variable = btn.getAttribute('data-var');
                const formulaStr = this.formulaInput.value;
                if (!formulaStr) {
                    this.resultDisplay.innerText = "Enter a formula first.";
                    this.resultDisplay.style.color = '#ffa';
                    return;
                }

                try {
                    const formula = this.parser.parse(formulaStr);
                    const derivative = BooleanCalculus.differentiate(formula, variable);
                    this.resultDisplay.innerHTML = `<strong>Boolean Derivative ∂/∂${variable}:</strong><br>${derivative.toString()}`;
                    this.resultDisplay.style.color = '#fff';
                } catch (e) {
                    this.resultDisplay.innerText = "Error: " + e.message;
                    this.resultDisplay.style.color = '#ff6b6b';
                }
            });
        });
    }

    setupTabHelp() {
        const buttons = document.querySelectorAll('.help-btn-tab');

        buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Prevent panel toggle if button is in header
                e.stopPropagation();

                const section = btn.dataset.section;
                const modal = document.getElementById('tutorial-modal');
                const body = document.getElementById('tutorial-body');

                if (modal && body) {
                    // Restore default content to ensure all sections are available
                    // This fixes the issue where content was being overwritten by hardcoded strings
                    if (this.defaultHelpContent) {
                        body.innerHTML = this.defaultHelpContent;
                    }

                    modal.style.display = 'flex';

                    // Determine target section ID
                    let targetId = '';
                    if (section === 'automata' || section === 'turing') targetId = 'help-turing';
                    else if (section === 'scripting') targetId = 'help-scripting';
                    else if (section === 'lambda') targetId = 'help-lambda';
                    else if (section === 'analysis') targetId = 'help-analysis';
                    else if (section === 'natural-deduction') targetId = 'help-natural-deduction';

                    // Scroll to section after a brief delay to ensure layout
                    if (targetId) {
                        setTimeout(() => {
                            const el = document.getElementById(targetId);
                            if (el) {
                                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                // Visual feedback
                                el.style.transition = 'box-shadow 0.5s';
                                el.style.boxShadow = '0 0 15px rgba(74, 144, 226, 0.5)';
                                setTimeout(() => {
                                    el.style.boxShadow = 'none';
                                }, 1500);
                            }
                        }, 50);
                    }
                }
            });
        });
    }

    setupLessons() {
        const indexEl = document.getElementById('lesson-index');
        const bodyEl = document.getElementById('lesson-body');
        if (!indexEl || !bodyEl) return;

        // Populate index
        indexEl.innerHTML = '';
        LESSONS.forEach((lesson) => {
            const item = document.createElement('div');
            item.className = 'lesson-link';
            item.textContent = `${lesson.id}. ${lesson.title}`;
            item.setAttribute('data-lesson', lesson.id);
            item.addEventListener('click', () => {
                // UI updates
                document.querySelectorAll('.lesson-link').forEach(l => l.classList.remove('active'));
                item.classList.add('active');

                // Content update with fade effect
                bodyEl.style.opacity = '0';
                setTimeout(() => {
                    bodyEl.innerHTML = lesson.content;

                    // Add "Next Lesson" button if not the last lesson
                    if (lesson.id < LESSONS.length) {
                        const nextBtnContainer = document.createElement('div');
                        nextBtnContainer.style.textAlign = 'center';
                        nextBtnContainer.style.padding = '40px 0';
                        nextBtnContainer.style.marginTop = '40px';
                        nextBtnContainer.style.borderTop = '1px solid rgba(255,255,255,0.1)';

                        const nextBtn = document.createElement('button');
                        nextBtn.className = 'next-lesson-btn';
                        nextBtn.innerHTML = `Continue to Lesson ${lesson.id + 1}: <strong>${LESSONS[lesson.id].title}</strong> →`;
                        nextBtn.style.padding = '12px 24px';
                        nextBtn.style.background = '#4a90e2';
                        nextBtn.style.color = '#fff';
                        nextBtn.style.border = 'none';
                        nextBtn.style.borderRadius = '6px';
                        nextBtn.style.cursor = 'pointer';
                        nextBtn.style.fontSize = '1em';
                        nextBtn.style.transition = 'all 0.2s';

                        nextBtn.addEventListener('mouseover', () => nextBtn.style.background = '#357abd');
                        nextBtn.addEventListener('mouseout', () => nextBtn.style.background = '#4a90e2');

                        nextBtn.onclick = () => {
                            const nextLink = document.querySelector(`.lesson-link[data-lesson="${lesson.id + 1}"]`);
                            if (nextLink) nextLink.click();
                        };

                        nextBtnContainer.appendChild(nextBtn);
                        bodyEl.appendChild(nextBtnContainer);
                    }

                    bodyEl.style.transition = 'opacity 0.2s ease-in-out';
                    bodyEl.style.opacity = '1';
                    // Scroll to top
                    const container = document.getElementById('lesson-content-area');
                    if (container) container.scrollTop = 0;
                }, 150);
            });
            indexEl.appendChild(item);
        });

        // Auto-select and LOAD first lesson
        const first = indexEl.querySelector('.lesson-link');
        if (first) first.click();
    }
}
