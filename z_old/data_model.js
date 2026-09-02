/**
 * Taskoria Art Lab - Data Model
 * 
 * Este archivo implementa la arquitectura conceptual de la Fase 1.
 * Separa estrictamente Character (Base inmutable), Cosmetic (Assets modulares) y Outfit (Combinación).
 */

class Character {
    constructor(id, name, baseBodyGrid) {
        this.id = id;
        this.name = name;
        this.baseBodyGrid = baseBodyGrid;
    }
}

class Cosmetic {
    constructor(id, name, category, slot, compatibleClasses, grid) {
        this.id = id;
        this.name = name;
        this.category = category; // ej. "head", "torso", "back"
        this.slot = slot; // ej. "head", "torso", "cape"
        this.compatibleClasses = compatibleClasses; // Array de IDs de clase ["FIGHTER", "WIZARD", "ALL"]
        this.grid = grid; 
    }
}

class Outfit {
    constructor(id, characterId, cosmeticIds) {
        this.id = id;
        this.characterId = characterId;
        this.cosmeticIds = cosmeticIds; // Array de IDs de cosméticos
    }
}

class TaskoriaDataStore {
    constructor() {
        this.characters = new Map();
        this.cosmetics = new Map();
        this.outfits = new Map();
    }

    // ==========================================
    // CARGAR
    // ==========================================
    
    loadCharacter(charData) {
        const char = new Character(charData.id, charData.name, charData.baseBodyGrid);
        this.characters.set(char.id, char);
    }

    loadCosmetic(cosData) {
        const cos = new Cosmetic(cosData.id, cosData.name, cosData.category, cosData.slot, cosData.compatibleClasses, cosData.grid);
        this.cosmetics.set(cos.id, cos);
    }

    loadOutfit(outfitData) {
        const outfit = new Outfit(outfitData.id, outfitData.characterId, outfitData.cosmeticIds);
        this.outfits.set(outfit.id, outfit);
    }

    // ==========================================
    // GUARDAR / ELIMINAR / CLONAR
    // ==========================================

    saveOutfit(id, characterId, cosmeticIds) {
        const outfit = new Outfit(id, characterId, cosmeticIds);
        this.outfits.set(id, outfit);
        return outfit;
    }

    deleteOutfit(outfitId) {
        return this.outfits.delete(outfitId);
    }
    
    cloneOutfit(outfitId, newOutfitId) {
        const original = this.outfits.get(outfitId);
        if (original) {
            const clone = new Outfit(newOutfitId, original.characterId, [...original.cosmeticIds]);
            this.outfits.set(newOutfitId, clone);
            return clone;
        }
        return null;
    }

    // ==========================================
    // COMBINAR (BUILDER)
    // ==========================================

    /**
     * Devuelve las capas compiladas resolviendo el personaje base y sus cosméticos.
     */
    combine(characterId, cosmeticIds) {
        const char = this.characters.get(characterId);
        if (!char) throw new Error(`Character ${characterId} no encontrado en la base de datos.`);

        const layers = {
            base_body: char.baseBodyGrid,
            arms: null,
            legs: null,
            torso: null,
            cape: null,
            hair: null,
            head: null,
            weapon: null
        };

        const warnings = [];

        for (const cosId of cosmeticIds) {
            const cosmetic = this.cosmetics.get(cosId);
            if (cosmetic) {
                // Verificar compatibilidad
                if (cosmetic.compatibleClasses.includes(characterId) || cosmetic.compatibleClasses.includes("ALL")) {
                    layers[cosmetic.slot] = cosmetic.grid;
                } else {
                    warnings.push(`Warning: El cosmético ${cosmetic.id} no está marcado como compatible con ${characterId}`);
                    // A pesar del warning, en el "Lab" permitimos probarlo para experimentación visual.
                    layers[cosmetic.slot] = cosmetic.grid;
                }
            } else {
                warnings.push(`Error: Cosmético ${cosId} no encontrado.`);
            }
        }
        
        return { layers, warnings };
    }

    // ==========================================
    // EXPORTAR
    // ==========================================

    exportOutfitJSON(outfitId) {
        const outfit = this.outfits.get(outfitId);
        if (!outfit) return null;
        
        return JSON.stringify({
            character: outfit.characterId,
            cosmetics: outfit.cosmeticIds
        }, null, 2);
    }
}

// Instancia global para ser usada por la aplicación
const taskoriaData = new TaskoriaDataStore();

// Inicialización automática si existen los datos generados por build_data.js
if (typeof TASKORIA_CHARACTERS !== 'undefined') {
    TASKORIA_CHARACTERS.forEach(c => taskoriaData.loadCharacter(c));
}
if (typeof TASKORIA_COSMETICS !== 'undefined') {
    TASKORIA_COSMETICS.forEach(c => taskoriaData.loadCosmetic(c));
}
