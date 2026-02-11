
import { World } from '../core/logic.js';

export class WorldRenderer {
    constructor(model, canvasId) {
        this.model = model;
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());


        this.selectedWorld = null;
        this.selectedRelation = null;
        this.draggedWorld = null;
        this.isDragging = false;

        // Evaluation State for Highlighting
        this.truthResults = new Map(); // worldId -> { val: boolean, error: string }
        this.currentFormula = "";

        // Interaction State
        this.mode = 'select'; // select, add-world, add-relation
        this.creationDragStart = null; // For creating relations

        // Pan and Zoom
        this.scale = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;

        // Physics State
        this.physicsEnabled = false;
        this.velocities = new Map(); // worldId -> {vx, vy}
        this.repulsionStrength = 20000;
        this.springStrength = 0.05;
        this.springLength = 180;
        this.damping = 0.8;

        this.setupInteractions();
        this.startLoop();
    }

    resize() {
        this.resizeCanvas();
    }

    setLayoutMode(enabled) {
        this.physicsEnabled = enabled;
        if (enabled) {
            // Initialize velocities if they don't exist
            for (const world of this.model.worlds.values()) {
                if (!this.velocities.has(world.id)) {
                    this.velocities.set(world.id, { vx: 0, vy: 0 });
                }
            }
        }
    }

    getViewportWorldBounds() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        return {
            minX: (0 - this.offsetX) / this.scale,
            minY: (0 - this.offsetY) / this.scale,
            maxX: (width - this.offsetX) / this.scale,
            maxY: (height - this.offsetY) / this.scale,
            width: width / this.scale,
            height: height / this.scale,
            centerX: (width / 2 - this.offsetX) / this.scale,
            centerY: (height / 2 - this.offsetY) / this.scale
        };
    }

    randomLayout() {
        const bounds = this.getViewportWorldBounds();
        const margin = 50 / this.scale;
        for (const world of this.model.worlds.values()) {
            world.x = bounds.minX + margin + Math.random() * (bounds.width - 2 * margin);
            world.y = bounds.minY + margin + Math.random() * (bounds.height - 2 * margin);
            if (this.velocities.has(world.id)) {
                this.velocities.set(world.id, { vx: 0, vy: 0 });
            }
        }
        this.draw();
    }

    centerView() {
        const worlds = Array.from(this.model.worlds.values());
        if (worlds.length === 0) {
            this.offsetX = 0;
            this.offsetY = 0;
            this.scale = 1.0;
            this.draw();
            return;
        }

        let sumX = 0, sumY = 0;
        worlds.forEach(w => {
            sumX += w.x;
            sumY += w.y;
        });
        const avgX = sumX / worlds.length;
        const avgY = sumY / worlds.length;

        // Center the arithmetic mean in the middle of canvas
        this.offsetX = (this.canvas.width / 2) - (avgX * this.scale);
        this.offsetY = (this.canvas.height / 2) - (avgY * this.scale);
        this.draw();
    }

    circleLayout() {
        const worlds = Array.from(this.model.worlds.values());
        if (worlds.length === 0) return;

        // Sort by Degree (Descending)
        const getDegree = (wId) => this.model.relations.filter(r => r.sourceId === wId || r.targetId === wId).length;
        worlds.sort((a, b) => getDegree(b.id) - getDegree(a.id));

        const bounds = this.getViewportWorldBounds();
        const radius = Math.min(bounds.width, bounds.height) * 0.35;

        worlds.forEach((world, i) => {
            // Start at top (-PI/2) and move clockwise (+angle)
            const angle = -Math.PI / 2 + (i / worlds.length) * Math.PI * 2;
            world.x = bounds.centerX + Math.cos(angle) * radius;
            world.y = bounds.centerY + Math.sin(angle) * radius;
            if (this.velocities.has(world.id)) {
                this.velocities.set(world.id, { vx: 0, vy: 0 });
            }
        });
        this.draw();
    }

    gridLayout() {
        const worlds = Array.from(this.model.worlds.values());
        if (worlds.length === 0) return;

        // Sort by Degree (Descending)
        const getDegree = (wId) => this.model.relations.filter(r => r.sourceId === wId || r.targetId === wId).length;
        worlds.sort((a, b) => getDegree(b.id) - getDegree(a.id));

        const n = worlds.length;
        const cols = Math.ceil(Math.sqrt(n));
        const rows = Math.ceil(n / cols);

        const bounds = this.getViewportWorldBounds();
        const spacingX = bounds.width / (cols + 1);
        const spacingY = bounds.height / (rows + 1);

        worlds.forEach((world, i) => {
            const r = Math.floor(i / cols);
            const c = i % cols;
            world.x = bounds.minX + (c + 1) * spacingX;
            world.y = bounds.minY + (r + 1) * spacingY;
            if (this.velocities.has(world.id)) {
                this.velocities.set(world.id, { vx: 0, vy: 0 });
            }
        });
        this.draw();
    }

    updatePhysics() {
        if (!this.physicsEnabled) return;

        const worlds = Array.from(this.model.worlds.values());

        // 1. Repulsion (All nodes push each other)
        for (let i = 0; i < worlds.length; i++) {
            for (let j = i + 1; j < worlds.length; j++) {
                const w1 = worlds[i];
                const w2 = worlds[j];
                const dx = (w1.x - w2.x) || (Math.random() - 0.5); // Prevent overlap division by zero
                const dy = (w1.y - w2.y) || (Math.random() - 0.5);
                const distSq = dx * dx + dy * dy + 100; // Buffer for stability
                const dist = Math.sqrt(distSq);

                // Repulsion force clamped for stability
                const force = Math.min(this.repulsionStrength / distSq, 20);

                let fx = (dx / dist) * force;
                let fy = (dy / dist) * force;

                // Hard Separation: If too close (diameter is 60), push apart strongly
                const minDistance = 75; // 60px diameter + 15px buffer
                if (dist < minDistance) {
                    const overlap = minDistance - dist;
                    const sepForce = overlap * 0.5; // Strong linear push
                    fx += (dx / dist) * sepForce;
                    fy += (dy / dist) * sepForce;
                }

                const v1 = this.velocities.get(w1.id) || { vx: 0, vy: 0 };
                const v2 = this.velocities.get(w2.id) || { vx: 0, vy: 0 };

                v1.vx += fx; v1.vy += fy;
                v2.vx -= fx; v2.vy -= fy;

                this.velocities.set(w1.id, v1);
                this.velocities.set(w2.id, v2);
            }
        }

        // 2. Spring Attraction (Relations pull nodes together)
        for (const rel of this.model.relations) {
            const w1 = this.model.getWorld(rel.sourceId);
            const w2 = this.model.getWorld(rel.targetId);
            if (!w1 || !w2 || w1 === w2) continue;

            const dx = w1.x - w2.x;
            const dy = w1.y - w2.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 0.1;
            const force = (dist - this.springLength) * this.springStrength;

            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;

            const v1 = this.velocities.get(w1.id) || { vx: 0, vy: 0 };
            const v2 = this.velocities.get(w2.id) || { vx: 0, vy: 0 };

            v1.vx -= fx; v1.vy -= fy;
            v2.vx += fx; v2.vy += fy;

            this.velocities.set(w1.id, v1);
            this.velocities.set(w2.id, v2);
        }

        // 3. Center Gravity & Dynamics
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const speedLimit = 10;

        for (const world of worlds) {
            const v = this.velocities.get(world.id) || { vx: 0, vy: 0 };

            // Soften center gravity
            v.vx -= (world.x - centerX) * 0.003;
            v.vy -= (world.y - centerY) * 0.003;

            // Apply Damping
            v.vx *= this.damping;
            v.vy *= this.damping;

            // Velocity Capping (Prevent jumping)
            const speed = Math.sqrt(v.vx * v.vx + v.vy * v.vy);
            if (speed > speedLimit) {
                const ratio = speedLimit / speed;
                v.vx *= ratio;
                v.vy *= ratio;
            }

            // Sleep threshold
            if (Math.abs(v.vx) < 0.1) v.vx = 0;
            if (Math.abs(v.vy) < 0.1) v.vy = 0;

            // Apply Movement
            if (world !== this.draggedWorld) {
                world.x += v.vx;
                world.y += v.vy;
            }

            this.velocities.set(world.id, v);
        }
    }

    resizeCanvas() {
        const oldW = this.canvas.width;
        const oldH = this.canvas.height;
        const dpr = window.devicePixelRatio || 1;

        const displayW = this.canvas.parentElement.clientWidth;
        const displayH = this.canvas.parentElement.clientHeight;

        // Set CSS display size
        this.canvas.style.width = displayW + 'px';
        this.canvas.style.height = displayH + 'px';

        // Set buffer size to match CSS pixels (not physical pixels)
        // This keeps a 1:1 mapping between CSS pixels and canvas coordinates
        this.canvas.width = displayW;
        this.canvas.height = displayH;

        // Preserve center point on resize
        if (oldW > 0 && oldH > 0) {
            this.offsetX += (this.canvas.width - oldW) / 2;
            this.offsetY += (this.canvas.height - oldH) / 2;
        }
    }

    setupInteractions() {
        document.body.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'copy';
        });

        document.body.addEventListener('drop', (e) => {
            if (e.target.id === 'world-canvas' || e.target.closest('#canvas-container')) {
                this.handleDrop(e);
            }
        });

        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));

        // Zoom
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));

        // Double click to edit visuals (now handled by Inspector, but we can keep for fallback)
        this.canvas.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
    }

    handleWheel(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        const newScale = Math.min(Math.max(0.1, this.scale + delta), 5); // Limit zoom

        // Zoom towards mouse pointer
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - this.offsetX) / this.scale;
        const worldY = (mouseY - this.offsetY) / this.scale;

        this.offsetX = mouseX - worldX * newScale;
        this.offsetY = mouseY - worldY * newScale;
        this.scale = newScale;
    }

    handleDrop(e) {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');

        // Use unified getMousePos for correct coordinates
        const { x, y } = this.getMousePos(e);

        const CURATED_PALETTE = [
            '#E74C3C', '#8E44AD', '#3498DB', '#16A085', // Red, Purple, Blue, Teal
            '#27AE60', '#F1C40F', '#E67E22', '#D35400', // Green, Yellow, Orange, Burnt Orange
            '#2C3E50', '#7F8C8D', '#1ABC9C', '#9B59B6', // Navy, Grey, Cyan, Violet
            '#C0392B', '#2980B9', '#F39C12', '#BDC3C7'  // Dark Red, Strong Blue, Amber, Silver
        ];

        if (type === 'world') {
            const id = `w${this.model.worlds.size + 1}`;
            const world = new World(id, x, y);

            // Random color from Curated Palette
            const colorIdx = Math.floor(Math.random() * CURATED_PALETTE.length);
            world.color = CURATED_PALETTE[colorIdx];

            // Randomly assign p and q
            if (Math.random() > 0.5) world.setAtom('p', true);
            if (Math.random() > 0.5) world.setAtom('q', true);

            this.model.addWorld(world);
            this.canvas.dispatchEvent(new CustomEvent('modelChange'));
        } else if (type === 'relation') {
            alert("To add a relation, hold Shift and drag from one world to another.");
        }
    }

    handleMouseDown(e) {
        const { x, y } = this.getMousePos(e); // World coords
        const target = this.findWorldAt(x, y);

        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            // Middle click or Alt+Click for Pan
            this.isPanning = true;
            this.panStartX = e.clientX;
            this.panStartY = e.clientY;
            return;
        }

        if (target) {
            if (e.shiftKey) {
                // Start creating relation
                this.creationDragStart = target;
            } else {
                // Select / Start Drag
                this.selectedWorld = target;
                this.selectedRelation = null; // Clear relation selection
                this.canvas.dispatchEvent(new CustomEvent('selectionChange'));

                this.draggedWorld = target;
                this.isDragging = true;
            }
        } else {
            // Check for Relation Hit
            const rel = this.findRelationAt(x, y);
            if (rel) {
                this.selectedRelation = rel;
                this.selectedWorld = null;
                this.canvas.dispatchEvent(new CustomEvent('selectionChange'));

                // Dispatch Request to edit
                this.canvas.dispatchEvent(new CustomEvent('requestRelationEdit', {
                    detail: { relation: rel, clientX: e.clientX, clientY: e.clientY }
                }));

            } else {
                this.selectedWorld = null;
                this.selectedRelation = null;
                this.canvas.dispatchEvent(new CustomEvent('selectionChange'));

                // Background drag = Pan? Maybe default behavior if no target
                this.isPanning = true;
                this.panStartX = e.clientX;
                this.panStartY = e.clientY;
            }
        }
    }

    handleMouseMove(e) {
        if (this.isPanning) {
            const dx = e.clientX - this.panStartX;
            const dy = e.clientY - this.panStartY;
            this.offsetX += dx;
            this.offsetY += dy;
            this.panStartX = e.clientX;
            this.panStartY = e.clientY;
            return;
        }

        const { x, y } = this.getMousePos(e); // World coords

        if (this.isDragging && this.draggedWorld) {
            this.draggedWorld.x = x;
            this.draggedWorld.y = y;
        }

        // Store mouse pos for drawing temporary relation line
        this.currentMouseX = x;
        this.currentMouseY = y;
    }

    handleMouseUp(e) {
        if (this.isPanning) {
            this.isPanning = false;
            return;
        }

        if (this.creationDragStart) {
            const { x, y } = this.getMousePos(e);

            // Note: getMousePos returns World Coords.
            // For the popup we want Screen Coords (e.clientX).
            // We'll pass both or just e.client.

            const target = this.findWorldAt(x, y);

            // Allow loop if target is same as start
            if (target) {
                // Dispatch event for UI Manager to handle popup
                this.canvas.dispatchEvent(new CustomEvent('requestAgentSelection', {
                    detail: {
                        sourceId: this.creationDragStart.id,
                        targetId: target.id,
                        clientX: e.clientX,
                        clientY: e.clientY
                    }
                }));
            }
            this.creationDragStart = null;
        }

        this.isDragging = false;
        this.draggedWorld = null;
    }

    handleDoubleClick(e) {
        const { x, y } = this.getMousePos(e);
        const rel = this.findRelationAt(x, y);
        if (rel) {
            this.canvas.dispatchEvent(new CustomEvent('requestRelationEdit', {
                detail: {
                    relation: rel,
                    clientX: e.clientX,
                    clientY: e.clientY
                }
            }));
            return;
        }
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;

        // Transform to world coords
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    findWorldAt(x, y) {
        for (const world of this.model.worlds.values()) {
            const dx = world.x - x;
            const dy = world.y - y;
            if (dx * dx + dy * dy < 900) { // Radius 30 squared
                return world;
            }
        }
        return null;
    }

    findRelationAt(x, y) {
        const threshold = 10; // Hit radius
        const spacing = 16;  // Match draw spacing

        // Group relations by pair (s-t)
        const edgeGroups = new Map();
        for (const rel of this.model.relations) {
            const key = `${rel.sourceId}-${rel.targetId}`;
            if (!edgeGroups.has(key)) edgeGroups.set(key, []);
            edgeGroups.get(key).push(rel);
        }

        // Iterate groups to calculate precise positions
        for (const [key, rels] of edgeGroups.entries()) {
            const source = this.model.getWorld(rels[0].sourceId);
            const target = this.model.getWorld(rels[0].targetId);
            if (!source || !target) continue;

            if (source === target) {
                // Check Loops - Simplified Peak Hit Detection
                const uniqueAgents = new Set();
                const cleanRels = [];
                rels.forEach(r => {
                    if (r.agent && !uniqueAgents.has(r.agent)) {
                        uniqueAgents.add(r.agent);
                        cleanRels.push(r);
                    }
                });
                cleanRels.sort((a, b) => a.agent.localeCompare(b.agent));

                const count = cleanRels.length;
                const loopSpacing = 0.5;
                const baseAngle = -Math.PI / 2;
                const center = (count - 1) / 2;

                for (let i = 0; i < cleanRels.length; i++) {
                    const rel = cleanRels[i];
                    const angleOffset = (i - center) * loopSpacing;
                    const angle = baseAngle + angleOffset;
                    const r = 35; // Match World Radius
                    // Peak of the loop is roughly at distance (r + loopHeight)
                    const loopHeight = 35;
                    const peakX = source.x + (r + loopHeight) * Math.cos(angle);
                    const peakY = source.y + (r + loopHeight) * Math.sin(angle);
                    const dx = x - peakX;
                    const dy = y - peakY;
                    if (dx * dx + dy * dy < 20 * 20) return rel;
                }
                continue;
            }

            // Normal Edges
            const hasReverse = this.model.relations.some(r => r.sourceId === target.id && r.targetId === source.id);
            if (hasReverse && source.id > target.id) continue;

            const forwardRels = rels;
            const backwardRels = this.model.relations.filter(r => r.sourceId === target.id && r.targetId === source.id);

            const agentSet = new Set();
            forwardRels.forEach(r => agentSet.add(r.agent));
            backwardRels.forEach(r => agentSet.add(r.agent));
            const sorted = Array.from(agentSet).sort();
            const center = (sorted.length - 1) / 2;

            const dx = target.x - source.x;
            const dy = target.y - source.y;
            const angle = Math.atan2(dy, dx);
            const perpX = Math.cos(angle + Math.PI / 2);
            const perpY = Math.sin(angle + Math.PI / 2);

            for (let i = 0; i < sorted.length; i++) {
                const agent = sorted[i];
                const fwd = forwardRels.find(r => r.agent === agent);
                const bwd = backwardRels.find(r => r.agent === agent);
                const rel = fwd || bwd;

                const offset = (i - center) * spacing;
                const offX = perpX * offset;
                const offY = perpY * offset;

                // Match drawArrow start/end points exactly
                const startX = source.x + offX + 35 * Math.cos(angle);
                const startY = source.y + offY + 35 * Math.sin(angle);
                const endX = target.x + offX - 35 * Math.cos(angle);
                const endY = target.y + offY - 35 * Math.sin(angle);

                const dist = this.pointToSegmentDist(x, y, startX, startY, endX, endY);
                if (dist < threshold) return rel;
            }
        }
        return null;
    }

    pointToSegmentDist(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;
        if (lenSq !== 0) param = dot / lenSq;

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startLoop() {
        const loop = () => {
            this.draw();
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    draw() {
        this.updatePhysics();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);

        // Agent Colors for multi-modal logic
        this.agentColors = {
            'a': '#4a90e2', // Blue
            'b': '#e24a90', // Pink
            'c': '#4ae290', // Emerald
            'd': '#f5a623'  // Orange
        };

        // Draw Relations
        // Draw Relations (Grouped by Source-Target pair for multi-edge)
        const edgeGroups = new Map(); // "s-t" -> [rel, rel]
        for (const rel of this.model.relations) {
            const key = `${rel.sourceId}-${rel.targetId}`;
            if (!edgeGroups.has(key)) edgeGroups.set(key, []);
            edgeGroups.get(key).push(rel);
        }

        for (const [key, rels] of edgeGroups.entries()) {
            const source = this.model.getWorld(rels[0].sourceId);
            const target = this.model.getWorld(rels[0].targetId);
            if (!source || !target) continue;

            if (source === target) {
                this.drawGroupedLoops(source, rels);
            } else {
                this.drawGroupedEdges(source, target, rels);
            }
        }
        this.ctx.lineWidth = 1;

        // Draw temporary relation creation line
        if (this.creationDragStart) {
            this.ctx.strokeStyle = '#aaa';
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(this.creationDragStart.x, this.creationDragStart.y);
            this.ctx.lineTo(this.currentMouseX, this.currentMouseY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        }

        // Draw Worlds
        for (const world of this.model.worlds.values()) {
            this.ctx.beginPath();
            // 1. Draw Circle
            this.ctx.arc(world.x, world.y, 35, 0, Math.PI * 2);
            // Selection should NOT change background color, only border
            this.ctx.fillStyle = world.color || '#333';
            this.ctx.fill();

            // 2. Border (Animated if selected)
            if (world === this.selectedWorld) {
                const pulse = (Math.sin(Date.now() / 150) + 1) / 2; // Fast pulse
                this.ctx.strokeStyle = '#4a90e2'; // Blue border
                this.ctx.lineWidth = 6 + (pulse * 4); // Thicker, animating between 6 and 10
            } else {
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
            }
            this.ctx.stroke();

            // 3. Truth Highlighting (Pulsing Glow Ring)
            const result = this.truthResults.get(world.id);
            if (result && result.error === undefined && this.currentFormula) {
                const pulse = (Math.sin(Date.now() / 200) + 1) / 2; // 0 to 1
                const ringRadius = 40 + (pulse * 5);

                this.ctx.beginPath();
                this.ctx.arc(world.x, world.y, ringRadius, 0, Math.PI * 2);
                this.ctx.strokeStyle = result.val ? '#4cd964' : '#ff3b30';
                this.ctx.lineWidth = 3 + (pulse * 2);
                this.ctx.globalAlpha = 0.6 + (pulse * 0.4);
                this.ctx.stroke();

                // Subtle glow fill
                this.ctx.globalAlpha = 0.1 + (pulse * 0.1);
                this.ctx.fillStyle = result.val ? '#4cd964' : '#ff3b30';
                this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
            }

            this.ctx.lineWidth = 1;

            // Draw ID/Name at top (outside or small inside?)
            // User wants internal structure displayed.
            // Let's put Name above, and Valuations INSIDE.

            // Name Label (Above)
            this.ctx.fillStyle = world.textColor || '#ffffff'; // Default to White
            this.ctx.font = 'bold 13px "Inter", sans-serif'; // Bold and slightly larger
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(world.name || world.id, world.x, world.y - 40);

            // Internal Structure (Valuation)
            this.ctx.fillStyle = world.textColor || '#ffffff';
            this.ctx.font = '14px "Fira Code", monospace';
            this.ctx.textBaseline = 'middle';

            // Get atoms p,q,r,s
            // We want to show ALL of them, with negation if false?
            // "dónde indicas en el programa que estas proposiciones sean falsas de estas dos formas?"
            // "visualice en los nodos de los mundos información de su estructura interna"

            // We will show p, q, r, s in a grid or list inside the node.
            // If true: p. If false: ¬p.
            // Only show relevant atoms? Or all 4?
            // Let's show the ones that are "active" (in the map) or just p,q if they are there.
            // But we typically only store TRUE values in the map.
            // We need to know which atoms exist in the "language". 
            // For this tool, the "language" is usually p,q,r,s implicitly.

            const atoms = ['p', 'q', 'r', 's'];
            // Check if any atom is set in this world (true or false explicitly)
            // Actually, we usually only store true. But the user implies we want to see false too.
            // Let's assume we show all 4 if they fit, or just p,q.
            // Let's try to fit p,q,r,s in a 2x2 grid if needed, or just a line.

            // Collect atoms to display.
            // Display: p if true, ¬p if false (but only if we want to be explicit).
            // Usually in Kripke models we only list true atoms.
            // BUT the user explicitly asked: "where do you indicate... that these are false... visualize structure".
            // So we MUST show the FALSE ones too.
            // Let's show p and q by default? Or all 4 if they have been touched?

            // Better approach: Show ALL 4 atoms p,q,r,s.
            // p vs ¬p

            const renderAtom = (atom, x, y) => {
                const isTrue = world.valuation.get(atom);
                const text = isTrue ? atom : `¬${atom}`;
                this.ctx.fillStyle = isTrue ? '#fff' : '#888'; // Dim false ones
                this.ctx.fillText(text, x, y);
            };

            // 2x2 Grid for p,q,r,s
            renderAtom('p', world.x - 15, world.y - 12);
            renderAtom('q', world.x + 15, world.y - 12);
            renderAtom('r', world.x - 15, world.y + 12);
            renderAtom('s', world.x + 15, world.y + 12);
        }

        this.ctx.restore();
    }
    drawGroupedEdges(source, target, rels) {
        // Multi-agent edge handling:
        // We draw BOTH directions in one pass to ensure spacing is consistent.
        // To avoid double drawing, we only proceed if source.id < target.id 
        // OR if NO counterpart exists (strict unidirectional t->s).
        const hasReverse = this.model.relations.some(r => r.sourceId === target.id && r.targetId === source.id);
        if (hasReverse && source.id > target.id) return;

        // FETCH all relations for this pair
        const forwardRels = rels; // s->t
        const backwardRels = this.model.relations.filter(r => r.sourceId === target.id && r.targetId === source.id);

        const agentSet = new Set();
        forwardRels.forEach(r => agentSet.add(r.agent));
        backwardRels.forEach(r => agentSet.add(r.agent));

        const sorted = Array.from(agentSet).sort();

        const spacing = 16;
        const center = (sorted.length - 1) / 2;

        const headLength = 10;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const angle = Math.atan2(dy, dx);
        const perpX = Math.cos(angle + Math.PI / 2);
        const perpY = Math.sin(angle + Math.PI / 2);

        sorted.forEach((agent, i) => {
            const fwd = forwardRels.find(r => r.agent === agent);
            const bwd = backwardRels.find(r => r.agent === agent);

            if (!fwd && !bwd) return; // Should not happen if agent is in agentSet

            const offset = (i - center) * spacing;
            const offX = perpX * offset;
            const offY = perpY * offset;

            const startX = source.x + offX + 35 * Math.cos(angle);
            const startY = source.y + offY + 35 * Math.sin(angle);
            const endX = target.x + offX - 35 * Math.cos(angle);
            const endY = target.y + offY - 35 * Math.sin(angle);

            // Determine Render Mode
            // 1. Bidirectional (s<->t)
            if (fwd && bwd) {
                // Use either fwd or bwd for selection, as they represent the same conceptual link
                this.drawArrow(startX, startY, endX, endY, agent, true, fwd || bwd);
            }
            // 2. Fwd Only (s->t)
            else if (fwd) {
                this.drawArrow(startX, startY, endX, endY, agent, false, fwd);
            }
            // 3. Bwd Only (t->s)
            else if (bwd) {
                // Draw line from S to T, but arrow head at S (visually T->S)
                this.drawArrow(endX, endY, startX, startY, agent, false, bwd);
            }
        });
    }

    drawArrow(x1, y1, x2, y2, agent, doubleHead, relObj) {
        const isSelected = this.selectedRelation === relObj;
        const agentColor = agent ? (this.agentColors[agent] || '#888') : '#888';
        const headLength = 18; // Increased from 10
        const angle = Math.atan2(y2 - y1, x2 - x1);

        this.ctx.strokeStyle = isSelected ? '#ffcc00' : agentColor;
        this.ctx.fillStyle = isSelected ? '#ffcc00' : agentColor;
        this.ctx.lineWidth = isSelected ? 3 : 2;
        this.ctx.setLineDash([]);

        // Line
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Head at P2
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2);
        this.ctx.lineTo(x2 - headLength * Math.cos(angle - Math.PI / 6), y2 - headLength * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(x2 - headLength * Math.cos(angle + Math.PI / 6), y2 - headLength * Math.sin(angle + Math.PI / 6));
        this.ctx.lineTo(x2, y2);
        this.ctx.fill();

        // Head at P1 if double
        if (doubleHead) {
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x1 + headLength * Math.cos(angle - Math.PI / 6), y1 + headLength * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(x1 + headLength * Math.cos(angle + Math.PI / 6), y1 + headLength * Math.sin(angle + Math.PI / 6));
            this.ctx.lineTo(x1, y1);
            this.ctx.fill();
        }

        // Label
        if (agent) {
            this.ctx.font = 'bold 12px "Fira Code", monospace';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            const textWidth = this.ctx.measureText(agent).width;
            this.ctx.save();
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(midX - textWidth / 2 - 2, midY - 6, textWidth + 4, 12);
            this.ctx.restore();

            this.ctx.fillStyle = isSelected ? '#ffcc00' : agentColor;
            this.ctx.fillText(agent, midX, midY);
        }
    }

    drawGroupedLoops(source, rels) {
        // Filter and Deduplicate
        const uniqueAgents = new Set();
        const cleanRels = [];
        rels.forEach(r => {
            if (r.agent && !uniqueAgents.has(r.agent)) {
                uniqueAgents.add(r.agent);
                cleanRels.push(r);
            }
        });

        // Sort
        cleanRels.sort((a, b) => a.agent.localeCompare(b.agent));

        const count = cleanRels.length;
        const spacing = 0.5; // Radians separation
        const baseAngle = -Math.PI / 2;
        const center = (count - 1) / 2;

        cleanRels.forEach((rel, i) => {
            const angleOffset = (i - center) * spacing;
            const angle = baseAngle + angleOffset;

            // Draw Loop at specific angle
            const r = 35; // Match World Radius
            const loopR = 30; // Slightly larger for multi-agent loops

            // Calculate start/end on circle
            const startX = source.x + r * Math.cos(angle - 0.25);
            const startY = source.y + r * Math.sin(angle - 0.25);
            const endX = source.x + r * Math.cos(angle + 0.25);
            const endY = source.y + r * Math.sin(angle + 0.25);

            // Control points outward
            const cpDist = r + loopR * 2.5;
            const cp1x = source.x + cpDist * Math.cos(angle - 0.3);
            const cp1y = source.y + cpDist * Math.sin(angle - 0.3);
            const cp2x = source.x + cpDist * Math.cos(angle + 0.3);
            const cp2y = source.y + cpDist * Math.sin(angle + 0.3);

            // Styling
            const isSelected = this.selectedRelation === rel;
            const agentColor = rel.agent ? (this.agentColors[rel.agent] || '#888') : '#888';
            this.ctx.strokeStyle = isSelected ? '#ffcc00' : agentColor;
            this.ctx.fillStyle = isSelected ? '#ffcc00' : agentColor;
            this.ctx.lineWidth = isSelected ? 3 : 2;

            // Solid lines
            this.ctx.setLineDash([]);

            this.ctx.beginPath();
            this.ctx.moveTo(startX, startY);
            this.ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
            this.ctx.stroke();
            this.ctx.setLineDash([]);

            // Arrow
            const headLength = 18;
            const tipAngle = Math.atan2(endY - cp2y, endX - cp2x);

            this.ctx.beginPath();
            this.ctx.moveTo(endX, endY);
            this.ctx.lineTo(endX - headLength * Math.cos(tipAngle - Math.PI / 6), endY - headLength * Math.sin(tipAngle - Math.PI / 6));
            this.ctx.lineTo(endX - headLength * Math.cos(tipAngle + Math.PI / 6), endY - headLength * Math.sin(tipAngle + Math.PI / 6));
            this.ctx.lineTo(endX, endY);
            this.ctx.fill();

            // Label
            if (rel.agent) {
                this.ctx.font = 'bold 12px "Fira Code", monospace';
                this.ctx.textAlign = 'center';
                const labelDist = r + loopR * 3;
                const lx = source.x + labelDist * Math.cos(angle);
                const ly = source.y + labelDist * Math.sin(angle);

                // Text Background
                const textWidth = this.ctx.measureText(rel.agent).width;
                this.ctx.save();
                this.ctx.fillStyle = '#222';
                this.ctx.fillRect(lx - textWidth / 2 - 2, ly - 6, textWidth + 4, 12);
                this.ctx.restore();

                this.ctx.fillStyle = isSelected ? '#ffcc00' : agentColor;
                this.ctx.fillText(rel.agent, lx, ly);
            }
        });
    }
}
