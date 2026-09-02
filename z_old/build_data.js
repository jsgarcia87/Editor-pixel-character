const fs = require('fs');
const path = require('path');

const PALETTE = {
    " ": "transparent",
    "A": "#17191b",
    "D": "#d8a06a",
    "E": "#9a6038",
    "F": "#eee8d5",
    "G": "#5c6b70",
    "H": "#39434a",
    "I": "#385c3c",
    "J": "#6f7d3c",
    "K": "#b68a42",
    "L": "#c5d9e8",
    "M": "#6b3c76",
    "N": "#3d2850",
    "O": "#7f3035",
    "P": "#c96a3d",
    "Q": "#d8c4a0",
    "R": "#6a472e",
    "S": "#5b3425",
    "T": "#2f5940",
    "U": "#267c78",
    "V": "#b96d32",
    "W": "#d5b83f",
    "X": "#7d4c9e",
    "#000000": "A",
    "#301b03": "S",
    "#8d6e63": "E",
    "#b3babd": "F",
    "#c5cccf": "L",
    "#efb677": "D",
    "#f0b374": "D",
    "#f7d5b3": "Q",
    "#ffdbac": "Q",
    "#567194": "G",
    "#3a4e69": "H",
    "#253347": "A",
    "#bdc3c7": "F",
    "#e4e7ec": "F",
    "#7f8c8d": "G",
    "#ffffff": "F",
    "#5d4037": "R",
    "#33691e": "I",
    "#558b2f": "J",
    "#7cb342": "J"
};

const HEX_TO_KEY = {};
Object.entries(PALETTE).forEach(([key, val]) => {
    if (key.startsWith('#')) return; // skip custom mappings
    HEX_TO_KEY[val] = key;
    HEX_TO_KEY[val.toLowerCase()] = key;
});
Object.entries(PALETTE).forEach(([key, val]) => {
    if (key.startsWith('#')) {
        HEX_TO_KEY[key] = val;
    }
});
HEX_TO_KEY['transparent'] = ' ';

function inferLayerType(filename) {
    const lower = filename.toLowerCase();
    if (lower.includes('head') || lower.includes('casco') || lower.includes('helmet') || lower.includes('capucha') || lower.includes('gorra')) return 'head';
    if (lower.includes('cape') || lower.includes('capa')) return 'cape';
    if (lower.includes('torso') || lower.includes('brazaletes') || lower.includes('pecho') || lower.includes('tunica')) return 'torso';
    if (lower.includes('leg') || lower.includes('piernas') || lower.includes('pantalones') || lower.includes('botas')) return 'legs';
    if (lower.includes('weapon') || lower.includes('arma') || lower.includes('espada') || lower.includes('baston')) return 'weapon';
    return 'torso'; // default
}

function parseFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const json = JSON.parse(content);
    
    let root = json;
    let keys = Object.keys(root);
    if (keys.length === 1 && typeof root[keys[0]] === 'object' && root[keys[0]] !== null && !Array.isArray(root[keys[0]])) {
        if (root[keys[0]].blueprint) {
            root = root[keys[0]];
        }
    } else if (root.payload && root.payload.blueprint) {
        root = root.payload;
    }
    
    if (root && root.blueprint && Array.isArray(root.blueprint)) {
        return root.blueprint;
    }
    
    let array = null;
    if (Array.isArray(json)) {
        array = json;
    } else {
        const firstKey = Object.keys(json)[0];
        if (Array.isArray(json[firstKey])) {
            array = json[firstKey];
        }
    }
    
    if (array && array.length === 4096) {
        const rows = [];
        for (let i = 0; i < 64; i++) {
            let row = [];
            for (let j = 0; j < 64; j++) {
                let hex = array[i * 64 + j];
                if (hex === "transparent") hex = " ";
                row.push(hex);
            }
            rows.push(row);
        }
        return rows;
    }
    
    console.warn("Could not parse file:", filePath);
    return null;
}

const charactersDir = path.join(__dirname, 'characters', 'Characters');
const vestimentaDir = path.join(charactersDir, 'Vestimenta');
const brazosDir = path.join(charactersDir, 'Brazos');
const hairDir = path.join(charactersDir, 'Hair');

const BASE_BODIES = {};
const AVAILABLE_EQUIPMENT = {}; 
const AVAILABLE_ARMS = [];
const AVAILABLE_HAIR = [];

// Nuevas estructuras Taskoria Art Lab (Fase 1)
const TASKORIA_CHARACTERS = [];
const TASKORIA_COSMETICS = [];

if (fs.existsSync(charactersDir)) {
    const files = fs.readdirSync(charactersDir);
    for (const file of files) {
        if (file === 'Men bold sin brazos.json' || file === 'Woman bold sin brazos.json') {
            const filePath = path.join(charactersDir, file);
            const grid = parseFile(filePath);
            if (grid) {
                const id = file.includes('Woman') ? 'WIZARD' : 'FIGHTER';
                const legacyId = file.includes('Woman') ? 'WOMAN' : 'MAN';
                BASE_BODIES[legacyId] = grid; // Legacy support
                
                TASKORIA_CHARACTERS.push({
                    id: id,
                    name: id.toLowerCase().replace(/^\w/, c => c.toUpperCase()),
                    baseBodyGrid: grid
                });
                
                // Generar ROGUE usando el cuerpo MAN
                if (id === 'FIGHTER') {
                    TASKORIA_CHARACTERS.push({
                        id: 'ROGUE',
                        name: 'Rogue',
                        baseBodyGrid: grid
                    });
                }
            }
        }
    }
}

if (fs.existsSync(brazosDir)) {
    const files = fs.readdirSync(brazosDir);
    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(brazosDir, file);
            const grid = parseFile(filePath);
            if (grid) {
                const itemName = file.replace('.json', '');
                AVAILABLE_ARMS.push({ name: itemName, grid }); // Legacy
                
                TASKORIA_COSMETICS.push({
                    id: `global_arm_${itemName.replace(/\s+/g, '_')}`.toLowerCase(),
                    name: itemName,
                    category: 'arms',
                    slot: 'arms',
                    compatibleClasses: ["ALL"],
                    grid: grid
                });
            }
        }
    }
}

if (fs.existsSync(hairDir)) {
    const files = fs.readdirSync(hairDir);
    for (const file of files) {
        if (file.endsWith('.json')) {
            const filePath = path.join(hairDir, file);
            const grid = parseFile(filePath);
            if (grid) {
                const itemName = file.replace('.json', '');
                AVAILABLE_HAIR.push({ name: itemName, grid }); // Legacy
                
                TASKORIA_COSMETICS.push({
                    id: `global_hair_${itemName.replace(/\s+/g, '_')}`.toLowerCase(),
                    name: itemName,
                    category: 'hair',
                    slot: 'hair',
                    compatibleClasses: ["ALL"],
                    grid: grid
                });
            }
        }
    }
}

if (fs.existsSync(vestimentaDir)) {
    const classes = fs.readdirSync(vestimentaDir);
    for (const className of classes) {
        const classPath = path.join(vestimentaDir, className);
        if (fs.statSync(classPath).isDirectory()) {
            
            const normalizedClass = className.toUpperCase().replace('É', 'E').replace('É', 'E'); 
            if (!AVAILABLE_EQUIPMENT[normalizedClass]) {
                AVAILABLE_EQUIPMENT[normalizedClass] = {
                    head: [],
                    cape: [],
                    torso: [],
                    legs: [],
                    weapon: []
                };
            }
            
            const eqFiles = fs.readdirSync(classPath);
            for (const eqFile of eqFiles) {
                if (eqFile.endsWith('.json')) {
                    const eqPath = path.join(classPath, eqFile);
                    const grid = parseFile(eqPath);
                    if (grid) {
                        const layerType = inferLayerType(eqFile);
                        const itemName = eqFile.replace('.json', '');
                        
                        // Legacy support
                        AVAILABLE_EQUIPMENT[normalizedClass][layerType].push({
                            name: itemName,
                            grid: grid
                        });

                        // Taskoria Lab support
                        TASKORIA_COSMETICS.push({
                            id: `${normalizedClass}_${itemName.replace(/\s+/g, '_')}`.toLowerCase(),
                            name: itemName,
                            category: layerType,
                            slot: layerType,
                            compatibleClasses: [normalizedClass],
                            grid: grid
                        });
                    }
                }
            }
        }
    }
}

const dataContent = `// Auto-generated from JSON blueprints
const BASE_BODIES = ${JSON.stringify(BASE_BODIES, null, 2)};

const AVAILABLE_ARMS = ${JSON.stringify(AVAILABLE_ARMS, null, 2)};
const AVAILABLE_HAIR = ${JSON.stringify(AVAILABLE_HAIR, null, 2)};

const AVAILABLE_EQUIPMENT = ${JSON.stringify(AVAILABLE_EQUIPMENT, null, 2)};

const EQUIPMENT_SETS = {};
for (const [className, layers] of Object.entries(AVAILABLE_EQUIPMENT)) {
    EQUIPMENT_SETS[className] = {
        head: layers.head.length > 0 ? layers.head[0].grid : [],
        cape: layers.cape.length > 0 ? layers.cape[0].grid : [],
        torso: layers.torso.length > 0 ? layers.torso[0].grid : [],
        legs: layers.legs.length > 0 ? layers.legs[0].grid : [],
        weapon: layers.weapon.length > 0 ? layers.weapon[0].grid : []
    };
}

const TASKORIA_CHARACTERS = ${JSON.stringify(TASKORIA_CHARACTERS, null, 2)};
const TASKORIA_COSMETICS = ${JSON.stringify(TASKORIA_COSMETICS, null, 2)};
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), dataContent);
console.log('Successfully generated data.js!');
