// Counter-Drone Tactical Command Interface
class CounterDroneSystem {
    constructor() {
        // System state
        this.threats = new Map();
        this.threatIdCounter = 1;
        this.selectedThreat = null;
        this.systemActive = true;
        this.autoScan = true;
        this.jammingActive = false;
        this.spoofingActive = false;
        
        // Threat types configuration
        this.threatTypes = {
            micro: { name: "Micro Drone", size: "Small", range: 5, speed: 20, color: "#ff6b6b" },
            small: { name: "Small Drone", size: "Medium", range: 5, speed: 35, color: "#ffa500" },
            medium: { name: "Medium Drone", size: "Large", range: 10, speed: 60, color: "#ff4444" },
            swarm: { name: "Swarm Unit", size: "Multiple", range: 7, speed: 25, color: "#ff0066" }
        };
        
        // Defense layers (in pixels from center)
        this.defenseLayers = {
            detection: 300,
            disruption: 200,
            spoofing: 120,
            emp: 80
        };
        
        // Environmental data
        this.environmentalData = {
            altitude: 14200,
            temperature: -28,
            windSpeed: 45,
            pressure: 0.58
        };
        
        // Statistics
        this.stats = {
            detected: 0,
            jammed: 0,
            spoofed: 0,
            destroyed: 0
        };
        
        // Initialize system
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateTimestamp();
        this.updateEnvironmentalData();
        this.updateSystemStatus();
        this.startAutoThreatGeneration();
        this.startPerformanceMonitoring();
        
        // Start real-time updates
        setInterval(() => this.updateTimestamp(), 1000);
        setInterval(() => this.updateThreats(), 100);
        setInterval(() => this.checkThreatEngagement(), 500);
        setInterval(() => this.updateThreatLevel(), 2000);
    }
    
    setupEventListeners() {
        // Header controls
        document.getElementById('resetSystem').addEventListener('click', () => this.resetSystem());
        document.getElementById('autoScanToggle').addEventListener('click', () => this.toggleAutoScan());
        
        // Jamming controls
        document.getElementById('jammingPower').addEventListener('input', (e) => {
            document.getElementById('jammingPowerValue').textContent = e.target.value + '%';
        });
        document.getElementById('activateJamming').addEventListener('click', () => this.toggleJamming());
        
        // Spoofing controls
        document.getElementById('activateSpoofing').addEventListener('click', () => this.toggleSpoofing());
        
        // Target engagement
        document.getElementById('jamTarget').addEventListener('click', () => this.jamSelectedTarget());
        document.getElementById('spoofTarget').addEventListener('click', () => this.spoofSelectedTarget());
        document.getElementById('empStrike').addEventListener('click', () => this.empStrike());
        
        // Manual controls
        document.getElementById('generateThreat').addEventListener('click', () => this.generateRandomThreat());
        document.getElementById('generateSwarm').addEventListener('click', () => this.generateSwarm());
        document.getElementById('clearThreats').addEventListener('click', () => this.clearAllThreats());
        
        // System controls
        document.getElementById('calibrateRadar').addEventListener('click', () => this.calibrateRadar());
        document.getElementById('testSystems').addEventListener('click', () => this.testSystems());
        document.getElementById('emergencyShutdown').addEventListener('click', () => this.emergencyShutdown());
        
        // Radar click handling
        document.getElementById('radarScope').addEventListener('click', (e) => this.handleRadarClick(e));
    }
    
    updateTimestamp() {
        const now = new Date();
        const timestamp = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit' 
        });
        document.getElementById('timestamp').textContent = timestamp;
    }
    
    updateEnvironmentalData() {
        document.getElementById('altitude').textContent = `${this.environmentalData.altitude.toLocaleString()} ft`;
        document.getElementById('temperature').textContent = `${this.environmentalData.temperature}°C`;
        document.getElementById('windSpeed').textContent = `${this.environmentalData.windSpeed} mph`;
        document.getElementById('pressure').textContent = `${this.environmentalData.pressure} atm`;
    }
    
    updateSystemStatus() {
        document.getElementById('systemStatus').textContent = this.systemActive ? 'OPERATIONAL' : 'OFFLINE';
        document.getElementById('radarStatus').textContent = this.systemActive ? 'OPERATIONAL' : 'OFFLINE';
        document.getElementById('jammingStatus').textContent = this.jammingActive ? 'ACTIVE' : 'READY';
        document.getElementById('spoofingStatus').textContent = this.spoofingActive ? 'ACTIVE' : 'STANDBY';
        document.getElementById('empStatus').textContent = 'ARMED';
    }
    
    generateRandomThreat() {
        const types = Object.keys(this.threatTypes);
        const type = types[Math.floor(Math.random() * types.length)];
        this.createThreat(type);
    }
    
    generateSwarm() {
        // Generate 3-5 swarm units
        const count = 3 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            setTimeout(() => this.createThreat('swarm'), i * 200);
        }
    }
    
    createThreat(type) {
        const threat = {
            id: this.threatIdCounter++,
            type: type,
            status: 'active',
            x: this.getRandomEdgePosition().x,
            y: this.getRandomEdgePosition().y,
            targetX: 300, // Center of radar
            targetY: 300,
            speed: this.threatTypes[type].speed / 10, // Adjust for animation
            distance: 0,
            detected: Date.now()
        };
        
        this.threats.set(threat.id, threat);
        this.stats.detected++;
        this.createThreatMarker(threat);
        this.updateStats();
        this.updateThreatList();
    }
    
    getRandomEdgePosition() {
        const side = Math.floor(Math.random() * 4);
        const radarSize = 600;
        const margin = 50;
        
        switch (side) {
            case 0: // Top
                return { x: Math.random() * radarSize, y: -margin };
            case 1: // Right
                return { x: radarSize + margin, y: Math.random() * radarSize };
            case 2: // Bottom
                return { x: Math.random() * radarSize, y: radarSize + margin };
            case 3: // Left
                return { x: -margin, y: Math.random() * radarSize };
            default:
                return { x: 0, y: 0 };
        }
    }
    
    createThreatMarker(threat) {
        const marker = document.createElement('div');
        marker.className = `threat-marker ${threat.type}`;
        marker.id = `threat-${threat.id}`;
        marker.style.left = `${threat.x}px`;
        marker.style.top = `${threat.y}px`;
        
        marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectThreat(threat.id);
        });
        
        document.getElementById('radarScope').appendChild(marker);
    }
    
    updateThreats() {
        this.threats.forEach(threat => {
            if (threat.status === 'active') {
                this.moveThreat(threat);
                this.updateThreatDistance(threat);
            }
        });
    }
    
    moveThreat(threat) {
        const dx = threat.targetX - threat.x;
        const dy = threat.targetY - threat.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            threat.x += (dx / distance) * threat.speed;
            threat.y += (dy / distance) * threat.speed;
            
            const marker = document.getElementById(`threat-${threat.id}`);
            if (marker) {
                marker.style.left = `${threat.x}px`;
                marker.style.top = `${threat.y}px`;
            }
        }
    }
    
    updateThreatDistance(threat) {
        const dx = threat.x - 300; // Center of radar
        const dy = threat.y - 300;
        threat.distance = Math.sqrt(dx * dx + dy * dy);
    }
    
    checkThreatEngagement() {
        this.threats.forEach(threat => {
            if (threat.status === 'active') {
                const distance = threat.distance;
                
                // Auto-engage based on defense layers
                if (distance <= this.defenseLayers.emp && threat.status === 'active') {
                    this.destroyThreat(threat.id);
                } else if (distance <= this.defenseLayers.spoofing && this.spoofingActive) {
                    this.spoofThreat(threat.id);
                } else if (distance <= this.defenseLayers.disruption && this.jammingActive) {
                    this.jamThreat(threat.id);
                }
            }
        });
    }
    
    selectThreat(threatId) {
        // Deselect previous threat
        if (this.selectedThreat) {
            const prevMarker = document.getElementById(`threat-${this.selectedThreat}`);
            if (prevMarker) {
                prevMarker.classList.remove('selected');
            }
        }
        
        // Select new threat
        this.selectedThreat = threatId;
        const marker = document.getElementById(`threat-${threatId}`);
        if (marker) {
            marker.classList.add('selected');
        }
        
        // Update target display
        const threat = this.threats.get(threatId);
        if (threat) {
            const targetDisplay = document.getElementById('selectedTarget');
            targetDisplay.textContent = `${threat.type.toUpperCase()}-${threat.id.toString().padStart(3, '0')}`;
            targetDisplay.classList.add('active');
        }
        
        this.updateThreatList();
    }
    
    jamSelectedTarget() {
        if (this.selectedThreat) {
            this.jamThreat(this.selectedThreat);
        }
    }
    
    spoofSelectedTarget() {
        if (this.selectedThreat) {
            this.spoofThreat(this.selectedThreat);
        }
    }
    
    empStrike() {
        if (this.selectedThreat) {
            this.destroyThreat(this.selectedThreat);
        }
    }
    
    jamThreat(threatId) {
        const threat = this.threats.get(threatId);
        if (threat && threat.status === 'active') {
            threat.status = 'jammed';
            threat.speed = 0;
            this.stats.jammed++;
            
            const marker = document.getElementById(`threat-${threatId}`);
            if (marker) {
                marker.classList.add('jammed');
            }
            
            this.updateStats();
            this.updateThreatList();
        }
    }
    
    spoofThreat(threatId) {
        const threat = this.threats.get(threatId);
        if (threat && threat.status === 'active') {
            threat.status = 'spoofed';
            threat.targetX = Math.random() * 600;
            threat.targetY = Math.random() * 600;
            this.stats.spoofed++;
            
            const marker = document.getElementById(`threat-${threatId}`);
            if (marker) {
                marker.classList.add('spoofed');
            }
            
            this.updateStats();
            this.updateThreatList();
        }
    }
    
    destroyThreat(threatId) {
        const threat = this.threats.get(threatId);
        if (threat && threat.status !== 'destroyed') {
            threat.status = 'destroyed';
            threat.speed = 0;
            this.stats.destroyed++;
            
            const marker = document.getElementById(`threat-${threatId}`);
            if (marker) {
                marker.classList.add('destroyed');
                setTimeout(() => {
                    marker.remove();
                    this.threats.delete(threatId);
                    this.updateThreatList();
                }, 2000);
            }
            
            if (this.selectedThreat === threatId) {
                this.selectedThreat = null;
                document.getElementById('selectedTarget').textContent = 'None Selected';
                document.getElementById('selectedTarget').classList.remove('active');
            }
            
            this.updateStats();
            this.updateThreatList();
        }
    }
    
    toggleJamming() {
        this.jammingActive = !this.jammingActive;
        const button = document.getElementById('activateJamming');
        button.textContent = this.jammingActive ? 'DEACTIVATE JAMMING' : 'ACTIVATE JAMMING';
        button.className = this.jammingActive ? 'btn btn--error control-btn' : 'btn btn--primary control-btn';
        
        this.updateSystemStatus();
    }
    
    toggleSpoofing() {
        this.spoofingActive = !this.spoofingActive;
        const button = document.getElementById('activateSpoofing');
        button.textContent = this.spoofingActive ? 'DEACTIVATE SPOOFING' : 'ACTIVATE SPOOFING';
        button.className = this.spoofingActive ? 'btn btn--error control-btn' : 'btn btn--warning control-btn';
        
        this.updateSystemStatus();
    }
    
    toggleAutoScan() {
        this.autoScan = !this.autoScan;
        const button = document.getElementById('autoScanToggle');
        button.textContent = `AUTO-SCAN: ${this.autoScan ? 'ON' : 'OFF'}`;
    }
    
    clearAllThreats() {
        this.threats.forEach((threat, id) => {
            const marker = document.getElementById(`threat-${id}`);
            if (marker) {
                marker.remove();
            }
        });
        
        this.threats.clear();
        this.selectedThreat = null;
        document.getElementById('selectedTarget').textContent = 'None Selected';
        document.getElementById('selectedTarget').classList.remove('active');
        
        this.updateThreatList();
    }
    
    resetSystem() {
        this.clearAllThreats();
        this.stats = { detected: 0, jammed: 0, spoofed: 0, destroyed: 0 };
        this.jammingActive = false;
        this.spoofingActive = false;
        this.threatIdCounter = 1;
        
        document.getElementById('activateJamming').textContent = 'ACTIVATE JAMMING';
        document.getElementById('activateJamming').className = 'btn btn--primary control-btn';
        document.getElementById('activateSpoofing').textContent = 'ACTIVATE SPOOFING';
        document.getElementById('activateSpoofing').className = 'btn btn--warning control-btn';
        
        this.updateStats();
        this.updateSystemStatus();
    }
    
    updateStats() {
        document.getElementById('detectedCount').textContent = this.stats.detected;
        document.getElementById('jammedCount').textContent = this.stats.jammed;
        document.getElementById('spoofedCount').textContent = this.stats.spoofed;
        document.getElementById('destroyedCount').textContent = this.stats.destroyed;
    }
    
    updateThreatList() {
        const threatList = document.getElementById('threatList');
        
        if (this.threats.size === 0) {
            threatList.innerHTML = '<div class="no-threats">No active threats detected</div>';
            return;
        }
        
        let html = '';
        this.threats.forEach(threat => {
            const selected = this.selectedThreat === threat.id ? 'selected' : '';
            const statusClass = this.getStatusClass(threat.status);
            
            html += `
                <div class="threat-item ${selected}" onclick="system.selectThreat(${threat.id})">
                    <div class="threat-header">
                        <span class="threat-id">${threat.type.toUpperCase()}-${threat.id.toString().padStart(3, '0')}</span>
                        <span class="threat-type ${statusClass}">${threat.status.toUpperCase()}</span>
                    </div>
                    <div class="threat-details">
                        <span>Distance: ${Math.round(threat.distance)}m</span>
                        <span>Type: ${this.threatTypes[threat.type].name}</span>
                    </div>
                </div>
            `;
        });
        
        threatList.innerHTML = html;
    }
    
    getStatusClass(status) {
        switch (status) {
            case 'active': return 'status-error';
            case 'jammed': return 'status-warning';
            case 'spoofed': return 'status-warning';
            case 'destroyed': return 'status-good';
            default: return '';
        }
    }
    
    updateThreatLevel() {
        const activeThreatCount = Array.from(this.threats.values()).filter(t => t.status === 'active').length;
        let level, className;
        
        if (activeThreatCount === 0) {
            level = 'LOW';
            className = 'status-good';
        } else if (activeThreatCount <= 3) {
            level = 'MEDIUM';
            className = 'status-warning';
        } else {
            level = 'HIGH';
            className = 'status-error';
        }
        
        const threatLevelElement = document.getElementById('threatLevel');
        threatLevelElement.textContent = level;
        threatLevelElement.className = className;
        
        // Update perimeter status
        const perimeterStatus = document.getElementById('perimeterStatus');
        if (activeThreatCount === 0) {
            perimeterStatus.textContent = 'SECURE';
            perimeterStatus.className = 'status-good';
        } else {
            perimeterStatus.textContent = 'COMPROMISED';
            perimeterStatus.className = 'status-error';
        }
    }
    
    startAutoThreatGeneration() {
        setInterval(() => {
            if (this.autoScan && this.systemActive && Math.random() < 0.3) {
                this.generateRandomThreat();
            }
        }, 5000);
    }
    
    startPerformanceMonitoring() {
        setInterval(() => {
            // Simulate performance metrics
            const cpuUsage = 20 + Math.random() * 30 + (this.threats.size * 2);
            const memoryUsage = 60 + Math.random() * 20 + (this.threats.size * 1.5);
            const networkUsage = 30 + Math.random() * 40 + (this.jammingActive ? 20 : 0) + (this.spoofingActive ? 15 : 0);
            
            document.getElementById('cpuUsage').style.width = `${Math.min(cpuUsage, 100)}%`;
            document.getElementById('memoryUsage').style.width = `${Math.min(memoryUsage, 100)}%`;
            document.getElementById('networkUsage').style.width = `${Math.min(networkUsage, 100)}%`;
        }, 2000);
    }
    
    handleRadarClick(event) {
        // Deselect current threat if clicking on empty space
        if (event.target.id === 'radarScope') {
            if (this.selectedThreat) {
                const marker = document.getElementById(`threat-${this.selectedThreat}`);
                if (marker) {
                    marker.classList.remove('selected');
                }
                this.selectedThreat = null;
                document.getElementById('selectedTarget').textContent = 'None Selected';
                document.getElementById('selectedTarget').classList.remove('active');
                this.updateThreatList();
            }
        }
    }
    
    calibrateRadar() {
        const button = document.getElementById('calibrateRadar');
        button.textContent = 'CALIBRATING...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'CALIBRATE RADAR';
            button.disabled = false;
        }, 3000);
    }
    
    testSystems() {
        const button = document.getElementById('testSystems');
        button.textContent = 'TESTING...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'TEST SYSTEMS';
            button.disabled = false;
        }, 2000);
    }
    
    emergencyShutdown() {
        if (confirm('EMERGENCY SHUTDOWN INITIATED. CONFIRM SYSTEM SHUTDOWN?')) {
            this.systemActive = false;
            this.jammingActive = false;
            this.spoofingActive = false;
            this.clearAllThreats();
            
            document.getElementById('systemStatus').textContent = 'SHUTDOWN';
            document.getElementById('systemStatus').className = 'status-error';
            
            // Disable all controls
            const buttons = document.querySelectorAll('button');
            buttons.forEach(btn => {
                if (btn.id !== 'resetSystem') {
                    btn.disabled = true;
                }
            });
        }
    }
}

// Initialize the system when page loads
let system;
window.addEventListener('DOMContentLoaded', () => {
    system = new CounterDroneSystem();
});