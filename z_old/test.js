

        const SIZE = 64;

        const CANVAS_SIZE = 512;

        const SCALE = CANVAS_SIZE / SIZE;

        const canvas =
            document.getElementById("editorCanvas");

        const ctx =
            canvas.getContext("2d");

        ctx.imageSmoothingEnabled = false;


        /* =========================================================
           PALETA
        ========================================================= */

        const PALETTE = {

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

            "X": "#7d4c9e"

        };


        /* =========================================================
           METADATA
        ========================================================= */

        const CHARACTERS = {

            SCOUT: {

                name: "Scout",

                description:
                    "Explorador ligero.",

                silhouette:
                    "Silueta ágil + equipo de explorador."

            },

            FIGHTER: {

                name: "Fighter",

                description:
                    "Guerrero convencional.",

                silhouette:
                    "Espada + capa lateral."

            },

            WIZARD: {

                name: "Wizard",

                description:
                    "Mago arcano.",

                silhouette:
                    "Capucha puntiaguda + bastón vertical."

            },

            NECROMANCER: {

                name: "Necromancer",

                description:
                    "Hechicero oscuro.",

                silhouette:
                    "Capucha oscura + arma arcana."

            },

            RANGER: {

                name: "Ranger",

                description:
                    "Arquero del bosque.",

                silhouette:
                    "Coleta alta + arco diagonal."

            },

            ROGUE: {

                name: "Rogue",

                description:
                    "Pícaro.",

                silhouette:
                    "Pañuelo facial + dos dagas."

            },

            PALADIN: {

                name: "Paladin",

                description:
                    "Campeón sagrado.",

                silhouette:
                    "Yelmo con cresta + lanza extralarga."

            },

            CLERIC: {

                name: "Cleric",

                description:
                    "Sanador.",

                silhouette:
                    "Túnica al suelo + libro abierto."

            },

            BARBARIAN: {

                name: "Barbarian",

                description:
                    "Berserker.",

                silhouette:
                    "Hombros enormes + pelo salvaje + hacha."

            },

            DRUID: {

                name: "Druid",

                description:
                    "Guardián del bosque.",

                silhouette:
                    "Cornamenta ramificada + manto orgánico."

            },

            MONK: {

                name: "Monk",

                description:
                    "Asceta marcial.",

                silhouette:
                    "Brazos en guardia + manos vacías."

            },

            BARD: {

                name: "Bard",

                description:
                    "Juglar.",

                silhouette:
                    "Sombrero de ala ancha + laúd."

            },

            WARLOCK: {

                name: "Warlock",

                description:
                    "Pactante.",

                silhouette:
                    "Cuernos compactos + abrigo largo."

            },

            ALCHEMIST: {

                name: "Alchemist",

                description:
                    "Artificiero alquímico.",

                silhouette:
                    "Cabeza inclinada + frasco elevado."

            }

        };


        /* =========================================================
           UTILIDADES PIXEL
        ========================================================= */

        function blankGrid() {

            return Array.from(
                { length: SIZE },
                () => Array(SIZE).fill(" ")
            );

        }


        function cloneGrid(grid) {

            return grid.map(
                row => row.slice()
            );

        }


        function cloneLayers(layers) {

            return {

                base_body:
                    cloneGrid(layers.base_body),

                armor:
                    cloneGrid(layers.armor),

                headgear:
                    cloneGrid(layers.headgear),

                weapon:
                    cloneGrid(layers.weapon)

            };

        }


        function pixel(grid, x, y, color) {

            if (
                x < 0 ||
                x >= SIZE ||
                y < 0 ||
                y >= SIZE
            ) return;

            grid[y][x] = color;

        }


        function rect(
            grid,
            x,
            y,
            width,
            height,
            color
        ) {

            for (
                let yy = y;
                yy < y + height;
                yy++
            ) {

                for (
                    let xx = x;
                    xx < x + width;
                    xx++
                ) {

                    pixel(
                        grid,
                        xx,
                        yy,
                        color
                    );

                }

            }

        }


        function line(
            grid,
            x1,
            y1,
            x2,
            y2,
            color,
            thickness = 1
        ) {

            let dx =
                Math.abs(x2 - x1);

            let sx =
                x1 < x2 ? 1 : -1;

            let dy =
                -Math.abs(y2 - y1);

            let sy =
                y1 < y2 ? 1 : -1;

            let error =
                dx + dy;

            while (true) {

                for (
                    let yy = -Math.floor(thickness / 2);
                    yy <= Math.floor(thickness / 2);
                    yy++
                ) {

                    for (
                        let xx = -Math.floor(thickness / 2);
                        xx <= Math.floor(thickness / 2);
                        xx++
                    ) {

                        pixel(
                            grid,
                            x1 + xx,
                            y1 + yy,
                            color
                        );

                    }

                }

                if (
                    x1 === x2 &&
                    y1 === y2
                ) break;

                const e2 = 2 * error;

                if (e2 >= dy) {

                    error += dy;
                    x1 += sx;

                }

                if (e2 <= dx) {

                    error += dx;
                    y1 += sy;

                }

            }

        }


        function ellipse(
            grid,
            cx,
            cy,
            rx,
            ry,
            color
        ) {

            for (
                let y = cy - ry;
                y <= cy + ry;
                y++
            ) {

                for (
                    let x = cx - rx;
                    x <= cx + rx;
                    x++
                ) {

                    const value =
                        ((x - cx) ** 2) / (rx ** 2) +
                        ((y - cy) ** 2) / (ry ** 2);

                    if (value <= 1) {

                        pixel(
                            grid,
                            x,
                            y,
                            color
                        );

                    }

                }

            }

        }


        /* =========================================================
           CUERPO BASE
        ========================================================= */

        function createBaseBody() {

            const g = blankGrid();


            /* cabeza */

            ellipse(
                g,
                32,
                19,
                5,
                5,
                "D"
            );


            /* cuello */

            rect(
                g,
                29,
                24,
                6,
                6,
                "D"
            );


            /* torso */

            rect(
                g,
                26,
                29,
                12,
                14,
                "D"
            );


            /* piernas */

            rect(
                g,
                27,
                42,
                4,
                10,
                "D"
            );

            rect(
                g,
                33,
                42,
                4,
                10,
                "D"
            );


            /* pies */

            rect(
                g,
                26,
                51,
                6,
                3,
                "A"
            );

            rect(
                g,
                32,
                51,
                6,
                3,
                "A"
            );


            /* cara */

            pixel(g, 29, 19, "A");
            pixel(g, 34, 19, "A");

            pixel(g, 32, 22, "E");


            return g;

        }


        /* =========================================================
           CONSTRUCTOR DE PERSONAJES
        ========================================================= */

        function createCharacter(id) {

            const layers = {

                base_body:
                    createBaseBody(),

                armor:
                    blankGrid(),

                headgear:
                    blankGrid(),

                weapon:
                    blankGrid()

            };


            const body =
                layers.base_body;

            const armor =
                layers.armor;

            const head =
                layers.headgear;

            const weapon =
                layers.weapon;


            /* =====================================================
               SCOUT
            ===================================================== */

            if (id === "SCOUT") {

                rect(
                    armor,
                    26, 29,
                    12, 13,
                    "I"
                );

                line(
                    armor,
                    26, 30,
                    38, 40,
                    "R",
                    2
                );

                line(
                    armor,
                    38, 30,
                    27, 40,
                    "R",
                    2
                );

                /* gorra */

                rect(
                    head,
                    27, 14,
                    10, 3,
                    "I"
                );

                /* mochila */

                rect(
                    armor,
                    23, 31,
                    3, 10,
                    "R"
                );

                /* espada */

                line(
                    weapon,
                    40, 29,
                    48, 48,
                    "A",
                    2
                );

                line(
                    weapon,
                    37, 31,
                    43, 31,
                    "K",
                    2
                );

            }


            /* =====================================================
               FIGHTER
            ===================================================== */

            if (id === "FIGHTER") {

                rect(
                    armor,
                    24, 29,
                    16, 14,
                    "G"
                );

                rect(
                    armor,
                    27, 43,
                    4, 9,
                    "H"
                );

                rect(
                    armor,
                    33, 43,
                    4, 9,
                    "H"
                );

                /* capa lateral */

                line(
                    armor,
                    38, 30,
                    46, 48,
                    "O",
                    3
                );

                /* espada */

                line(
                    weapon,
                    42, 31,
                    51, 20,
                    "A",
                    2
                );

                rect(
                    head,
                    27, 14,
                    10, 3,
                    "H"
                );

            }


            /* =====================================================
               WIZARD
            ===================================================== */

            if (id === "WIZARD") {

                rect(
                    armor,
                    26, 29,
                    12, 15,
                    "N"
                );

                /* capucha */

                rect(
                    head,
                    26, 15,
                    12, 5,
                    "M"
                );

                line(
                    head,
                    26, 15,
                    32, 7,
                    "M",
                    3
                );

                line(
                    head,
                    38, 15,
                    32, 7,
                    "M",
                    3
                );

                /* bastón vertical */

                line(
                    weapon,
                    41, 25,
                    41, 53,
                    "A",
                    2
                );

                line(
                    weapon,
                    39, 27,
                    44, 27,
                    "K",
                    2
                );

            }


            /* =====================================================
               NECROMANCER
            ===================================================== */

            if (id === "NECROMANCER") {

                rect(
                    armor,
                    25, 29,
                    14, 17,
                    "H"
                );

                rect(
                    armor,
                    27, 45,
                    10, 6,
                    "N"
                );

                rect(
                    head,
                    25, 14,
                    14, 6,
                    "N"
                );

                line(
                    head,
                    25, 17,
                    32, 10,
                    "N",
                    3
                );

                line(
                    head,
                    39, 17,
                    32, 10,
                    "N",
                    3
                );

                line(
                    weapon,
                    41, 24,
                    48, 47,
                    "A",
                    2
                );

                line(
                    weapon,
                    45, 27,
                    50, 27,
                    "K",
                    2
                );

            }


            /* =====================================================
               RANGER
            ===================================================== */

            if (id === "RANGER") {

                /* correas */

                line(
                    armor,
                    26, 29,
                    38, 40,
                    "R",
                    2
                );

                line(
                    armor,
                    38, 29,
                    26, 40,
                    "R",
                    2
                );

                /* cuero torso */

                rect(
                    armor,
                    27, 34,
                    10, 9,
                    "I"
                );

                /* carcaj */

                rect(
                    armor,
                    37, 29,
                    3, 11,
                    "R"
                );

                /* coleta */

                rect(
                    head,
                    36, 16,
                    5, 3,
                    "E"
                );

                rect(
                    head,
                    39, 17,
                    4, 4,
                    "E"
                );

                rect(
                    head,
                    42, 18,
                    4, 3,
                    "E"
                );

                /* arco diagonal */

                line(
                    weapon,
                    21, 24,
                    46, 50,
                    "A",
                    2
                );

                line(
                    weapon,
                    23, 24,
                    24, 32,
                    "I",
                    2
                );

                line(
                    weapon,
                    45, 43,
                    46, 50,
                    "I",
                    2
                );

                line(
                    weapon,
                    22, 25,
                    46, 49,
                    "I",
                    1
                );

            }


            /* =====================================================
               ROGUE
            ===================================================== */

            if (id === "ROGUE") {

                rect(
                    armor,
                    26, 30,
                    12, 13,
                    "H"
                );

                rect(
                    armor,
                    28, 43,
                    4, 9,
                    "N"
                );

                rect(
                    armor,
                    32, 43,
                    4, 9,
                    "N"
                );

                /* pañuelo */

                rect(
                    head,
                    27, 20,
                    10, 3,
                    "M"
                );

                /* tela ondeando */

                line(
                    head,
                    36, 21,
                    44, 27,
                    "M",
                    2
                );

                line(
                    head,
                    44, 27,
                    39, 33,
                    "M",
                    2
                );

                /* daga izquierda */

                line(
                    weapon,
                    25, 33,
                    17, 26,
                    "A",
                    2
                );

                line(
                    weapon,
                    17, 26,
                    14, 23,
                    "F",
                    1
                );

                /* daga derecha */

                line(
                    weapon,
                    39, 33,
                    47, 26,
                    "A",
                    2
                );

                line(
                    weapon,
                    47, 26,
                    50, 23,
                    "F",
                    1
                );

            }


            /* =====================================================
               PALADIN
            ===================================================== */

            if (id === "PALADIN") {

                /* placas */

                rect(
                    armor,
                    24, 29,
                    16, 14,
                    "F"
                );

                rect(
                    armor,
                    25, 31,
                    14, 3,
                    "K"
                );

                rect(
                    armor,
                    27, 43,
                    4, 10,
                    "L"
                );

                rect(
                    armor,
                    33, 43,
                    4, 10,
                    "L"
                );

                /* manto simétrico */

                line(
                    armor,
                    25, 28,
                    20, 36,
                    "L",
                    3
                );

                line(
                    armor,
                    39, 28,
                    44, 36,
                    "L",
                    3
                );

                /* yelmo */

                rect(
                    head,
                    27, 13,
                    10, 7,
                    "L"
                );

                rect(
                    head,
                    29, 10,
                    6, 3,
                    "K"
                );

                /* cresta */

                rect(
                    head,
                    31, 7,
                    2, 4,
                    "K"
                );

                /* lanza */

                line(
                    weapon,
                    40, 0,
                    40, 55,
                    "A",
                    2
                );

                line(
                    weapon,
                    38, 3,
                    42, 3,
                    "K",
                    2
                );

                line(
                    weapon,
                    40, 0,
                    40, 5,
                    "L",
                    2
                );

            }


            /* =====================================================
               CLERIC
            ===================================================== */

            if (id === "CLERIC") {

                /* túnica */

                rect(
                    armor,
                    23, 30,
                    18, 22,
                    "Q"
                );

                rect(
                    armor,
                    21, 49,
                    22, 5,
                    "Q"
                );

                rect(
                    armor,
                    25, 29,
                    14, 4,
                    "F"
                );

                /* ocultar pies */

                rect(
                    armor,
                    21, 51,
                    22, 4,
                    "Q"
                );

                /* tonsura */

                ellipse(
                    head,
                    32, 15,
                    5, 5,
                    "D"
                );

                rect(
                    head,
                    28, 13,
                    2, 3,
                    "A"
                );

                rect(
                    head,
                    34, 13,
                    2, 3,
                    "A"
                );

                /* libro */

                line(
                    weapon,
                    27, 34,
                    32, 38,
                    "F",
                    2
                );

                line(
                    weapon,
                    37, 34,
                    32, 38,
                    "F",
                    2
                );

                line(
                    weapon,
                    32, 38,
                    32, 34,
                    "K",
                    1
                );

            }


            /* =====================================================
               BARBARIAN
            ===================================================== */

            if (id === "BARBARIAN") {

                /* torso enorme */

                rect(
                    armor,
                    23, 29,
                    18, 14,
                    "D"
                );

                /* pieles */

                rect(
                    armor,
                    25, 42,
                    14, 7,
                    "R"
                );

                line(
                    armor,
                    25, 45,
                    39, 45,
                    "S",
                    2
                );

                /* borde irregular */

                line(
                    armor,
                    25, 48,
                    24, 51,
                    "S",
                    2
                );

                line(
                    armor,
                    29, 48,
                    30, 51,
                    "S",
                    2
                );

                line(
                    armor,
                    34, 48,
                    33, 51,
                    "S",
                    2
                );

                line(
                    armor,
                    39, 48,
                    40, 51,
                    "S",
                    2
                );

                /* pelo salvaje */

                rect(head, 27, 15, 3, 4, "S");
                rect(head, 30, 12, 3, 5, "S");
                rect(head, 33, 11, 4, 5, "S");
                rect(head, 36, 13, 4, 4, "S");
                rect(head, 26, 18, 4, 3, "S");
                rect(head, 38, 17, 4, 3, "S");

                /* hacha diagonal */

                line(
                    weapon,
                    40, 27,
                    22, 49,
                    "A",
                    3
                );

                line(
                    weapon,
                    20, 47,
                    27, 41,
                    "P",
                    3
                );

                line(
                    weapon,
                    20, 47,
                    25, 51,
                    "P",
                    3
                );

            }


            /* =====================================================
               DRUID
            ===================================================== */

            if (id === "DRUID") {

                /* túnica orgánica */

                rect(
                    armor,
                    24, 30,
                    16, 18,
                    "T"
                );

                /* manto de hojas */

                line(
                    armor,
                    24, 32,
                    21, 44,
                    "J",
                    3
                );

                line(
                    armor,
                    27, 32,
                    25, 47,
                    "J",
                    3
                );

                line(
                    armor,
                    31, 32,
                    30, 48,
                    "J",
                    3
                );

                line(
                    armor,
                    35, 32,
                    37, 47,
                    "J",
                    3
                );

                line(
                    armor,
                    39, 32,
                    43, 44,
                    "J",
                    3
                );

                /* cornamenta izquierda */

                line(
                    head,
                    28, 18,
                    23, 10,
                    "R",
                    2
                );

                line(
                    head,
                    23, 11,
                    19, 7,
                    "R",
                    2
                );

                line(
                    head,
                    24, 13,
                    27, 7,
                    "R",
                    2
                );

                /* cornamenta derecha */

                line(
                    head,
                    36, 18,
                    41, 10,
                    "R",
                    2
                );

                line(
                    head,
                    41, 11,
                    45, 7,
                    "R",
                    2
                );

                line(
                    head,
                    40, 13,
                    37, 7,
                    "R",
                    2
                );

                /* hoz */

                line(
                    weapon,
                    40, 31,
                    46, 39,
                    "A",
                    2
                );

                line(
                    weapon,
                    46, 39,
                    41, 44,
                    "J",
                    2
                );

                /* pequeño animal */

                ellipse(
                    weapon,
                    27, 51,
                    3, 2,
                    "R"
                );

                rect(
                    weapon,
                    25, 49,
                    2, 2,
                    "R"
                );

                rect(
                    weapon,
                    29, 49,
                    2, 2,
                    "R"
                );

            }


            /* =====================================================
               MONK
            ===================================================== */

            if (id === "MONK") {

                /* túnica */

                rect(
                    armor,
                    27, 30,
                    10, 16,
                    "P"
                );

                /* hombro descubierto */

                rect(
                    armor,
                    27, 31,
                    4, 3,
                    "Q"
                );

                /* fajín */

                line(
                    armor,
                    27, 40,
                    38, 43,
                    "Q",
                    2
                );

                /* cinta */

                rect(
                    head,
                    27, 14,
                    10, 2,
                    "O"
                );

                line(
                    head,
                    28, 17,
                    36, 17,
                    "R",
                    2
                );

                /* brazo izquierdo */

                line(
                    weapon,
                    29, 33,
                    22, 28,
                    "D",
                    3
                );

                /* brazo derecho */

                line(
                    weapon,
                    35, 34,
                    42, 28,
                    "D",
                    3
                );

                /* puños */

                rect(
                    weapon,
                    18, 28,
                    4, 3,
                    "A"
                );

                rect(
                    weapon,
                    42, 28,
                    4, 3,
                    "A"
                );

            }


            /* =====================================================
               BARD
            ===================================================== */

            if (id === "BARD") {

                /* ropa */

                rect(
                    armor,
                    26, 30,
                    12, 14,
                    "Q"
                );

                rect(
                    armor,
                    28, 44,
                    4, 9,
                    "O"
                );

                rect(
                    armor,
                    32, 44,
                    4, 9,
                    "O"
                );

                /* capa un hombro */

                line(
                    armor,
                    27, 28,
                    20, 39,
                    "O",
                    3
                );

                line(
                    armor,
                    20, 39,
                    26, 43,
                    "O",
                    2
                );

                /* sombrero ancho */

                rect(
                    head,
                    22, 15,
                    20, 3,
                    "O"
                );

                rect(
                    head,
                    27, 11,
                    10, 5,
                    "O"
                );

                /* pluma */

                line(
                    head,
                    36, 13,
                    42, 8,
                    "K",
                    2
                );

                /* laúd */

                ellipse(
                    weapon,
                    35, 37,
                    4, 5,
                    "K"
                );

                line(
                    weapon,
                    35, 33,
                    27, 28,
                    "R",
                    2
                );

                line(
                    weapon,
                    27, 28,
                    24, 25,
                    "A",
                    1
                );

            }


            /* =====================================================
               WARLOCK
            ===================================================== */

            if (id === "WARLOCK") {

                /* abrigo */

                rect(
                    armor,
                    25, 29,
                    14, 19,
                    "N"
                );

                /* faldones separados */

                line(
                    armor,
                    25, 42,
                    21, 52,
                    "N",
                    4
                );

                line(
                    armor,
                    39, 42,
                    43, 52,
                    "N",
                    4
                );

                /* cuernos compactos */

                line(
                    head,
                    28, 17,
                    24, 12,
                    "X",
                    3
                );

                line(
                    head,
                    24, 12,
                    25, 9,
                    "X",
                    2
                );

                line(
                    head,
                    36, 17,
                    40, 12,
                    "X",
                    3
                );

                line(
                    head,
                    40, 12,
                    39, 9,
                    "X",
                    2
                );

                /* brazo extendido */

                line(
                    weapon,
                    36, 32,
                    47, 27,
                    "D",
                    3
                );

                line(
                    weapon,
                    47, 27,
                    52, 27,
                    "D",
                    2
                );

                /* cadena */

                line(
                    weapon,
                    40, 30,
                    44, 35,
                    "K",
                    1
                );

                line(
                    weapon,
                    44, 35,
                    41, 41,
                    "K",
                    1
                );

                line(
                    weapon,
                    41, 41,
                    47, 47,
                    "K",
                    1
                );

            }


            /* =====================================================
               ALCHEMIST
            ===================================================== */

            if (id === "ALCHEMIST") {

                /* ropa */

                rect(
                    armor,
                    25, 30,
                    14, 16,
                    "G"
                );

                /* delantal */

                rect(
                    armor,
                    27, 34,
                    10, 12,
                    "Q"
                );

                /* bolsillos */

                rect(
                    armor,
                    29, 42,
                    3, 3,
                    "V"
                );

                rect(
                    armor,
                    33, 42,
                    3, 3,
                    "V"
                );

                /* pelo despeinado */

                rect(head, 27, 14, 3, 4, "R");
                rect(head, 30, 12, 3, 5, "R");
                rect(head, 34, 12, 3, 4, "R");
                rect(head, 37, 15, 3, 4, "R");

                /* gafas */

                ellipse(
                    head,
                    29,
                    17,
                    2,
                    1,
                    "U"
                );

                ellipse(
                    head,
                    35,
                    17,
                    2,
                    1,
                    "U"
                );

                line(
                    head,
                    31, 17,
                    33, 17,
                    "U",
                    1
                );

                /* brazo hacia arriba */

                line(
                    weapon,
                    38, 33,
                    44, 21,
                    "D",
                    2
                );

                /* frasco */

                ellipse(
                    weapon,
                    45,
                    17,
                    3,
                    4,
                    "U"
                );

                rect(
                    weapon,
                    44, 12,
                    2, 3,
                    "Q"
                );

                pixel(
                    weapon,
                    45,
                    17,
                    "W"
                );

                /* bandolera */

                line(
                    weapon,
                    27, 31,
                    37, 42,
                    "R",
                    2
                );

                rect(
                    weapon,
                    30, 35,
                    2, 3,
                    "U"
                );

                rect(
                    weapon,
                    33, 37,
                    2, 3,
                    "V"
                );

                rect(
                    weapon,
                    36, 39,
                    2, 3,
                    "U"
                );

            }


            return layers;

        }


        /* =========================================================
           LIBRERÍA
        ========================================================= */

        


        /* =========================================================
           ESTADO
        ========================================================= */

        let currentCharacter =
            "RANGER";

        let currentLayer =
            "base_body";

        let currentColor =
            "A";

        let currentTool =
            "brush";

        let layers =
            cloneLayers(
                library[currentCharacter].layers
            );


        /* =========================================================
           UI
        ========================================================= */

        const characterSelect =
            document.getElementById(
                "characterSelect"
            );

        const layerSelect =
            document.getElementById(
                "layerSelect"
            );

        const palette =
            document.getElementById(
                "palette"
            );

        const output =
            document.getElementById(
                "output"
            );


        


        /* =========================================================
           INFORMACIÓN
        ========================================================= */

        function updateInfo() {

            const info =
                document.getElementById(
                    "characterInfo"
                );

            const character =
                CHARACTERS[
                currentCharacter
                ];

            info.innerHTML = `

        <strong>
            ${character.name}
        </strong>

        <br>

        ${character.description}

        <br>

        <span class="tag">
            ${character.silhouette}
        </span>

    `;

        }


        /* =========================================================
           RENDER
        ========================================================= */

        function render() {

            ctx.clearRect(
                0,
                0,
                CANVAS_SIZE,
                CANVAS_SIZE
            );


            /* fondo */

            ctx.fillStyle =
                "#20282d";

            ctx.fillRect(
                0,
                0,
                CANVAS_SIZE,
                CANVAS_SIZE
            );


            const renderOrder = [

                "base_body",
                "armor",
                "headgear",
                "weapon"

            ];


            renderOrder.forEach(
                layerName => {

                    const grid =
                        layers[layerName];

                    for (
                        let y = 0;
                        y < SIZE;
                        y++
                    ) {

                        for (
                            let x = 0;
                            x < SIZE;
                            x++
                        ) {

                            const colorKey =
                                grid[y][x];

                            if (
                                colorKey === " "
                            ) continue;

                            const color =
                                PALETTE[
                                colorKey
                                ];

                            if (!color) continue;

                            ctx.fillStyle =
                                color;

                            ctx.fillRect(
                                x * SCALE,
                                y * SCALE,
                                SCALE,
                                SCALE
                            );

                        }

                    }

                }
            );

        }


        /* =========================================================
           PINTADO
        ========================================================= */

        function getPixelPosition(event) {

            const rect =
                canvas.getBoundingClientRect();

            return [

                Math.floor(
                    (
                        event.clientX -
                        rect.left
                    )
                    /
                    rect.width
                    *
                    SIZE
                ),

                Math.floor(
                    (
                        event.clientY -
                        rect.top
                    )
                    /
                    rect.height
                    *
                    SIZE
                )

            ];

        }


        function paint(event) {

            const [
                x,
                y
            ] =
                getPixelPosition(event);


            if (
                x < 0 ||
                y < 0 ||
                x >= SIZE ||
                y >= SIZE
            ) return;


            const grid =
                layers[currentLayer];


            if (
                currentTool ===
                "brush"
            ) {

                grid[y][x] =
                    currentColor;

                render();

            }


            if (
                currentTool ===
                "fill"
            ) {

                floodFill(
                    x,
                    y,
                    grid[y][x],
                    currentColor,
                    grid
                );

                render();

            }

        }


        function floodFill(
            startX,
            startY,
            target,
            replacement,
            grid
        ) {

            if (
                target === replacement
            ) return;


            const queue = [

                [startX, startY]

            ];


            let index = 0;


            while (
                index < queue.length
            ) {

                const [
                    x,
                    y
                ] =
                    queue[index++];


                if (
                    x < 0 ||
                    y < 0 ||
                    x >= SIZE ||
                    y >= SIZE
                ) continue;


                if (
                    grid[y][x] !== target
                ) continue;


                grid[y][x] =
                    replacement;


                queue.push(
                    [x + 1, y],
                    [x - 1, y],
                    [x, y + 1],
                    [x, y - 1]
                );

            }

        }


        /* =========================================================
           INPUT
        ========================================================= */

        let drawing = false;


        canvas.addEventListener(
            "mousedown",
            event => {

                drawing = true;

                paint(event);

            }
        );


        canvas.addEventListener(
            "mousemove",
            event => {

                if (
                    drawing &&
                    currentTool === "brush"
                ) {

                    paint(event);

                }

            }
        );


        window.addEventListener(
            "mouseup",
            () => {

                drawing = false;

            }
        );


        /* =========================================================
           CAMBIO DE PERSONAJE
        ========================================================= */

        
        const genderSelect = document.getElementById("genderSelect");
        
        characterSelect.addEventListener("change", event => {
            currentCharacter = event.target.value;
            buildAvatar();
            updateInfo();
            render();
        });

        genderSelect.addEventListener("change", event => {
            currentGender = event.target.value;
            buildAvatar();
            render();
        });



        /* =========================================================
           CAMBIO DE CAPA
        ========================================================= */

        layerSelect.addEventListener(
            "change",
            event => {

                currentLayer =
                    event.target.value;

            }
        );


        /* =========================================================
           HERRAMIENTAS
        ========================================================= */

        document
            .getElementById("brushButton")
            .onclick = () => {

                currentTool =
                    "brush";

                document
                    .getElementById(
                        "brushButton"
                    )
                    .classList.add(
                        "primary"
                    );

                document
                    .getElementById(
                        "fillButton"
                    )
                    .classList.remove(
                        "primary"
                    );

            };


        document
            .getElementById("fillButton")
            .onclick = () => {

                currentTool =
                    "fill";

                document
                    .getElementById(
                        "fillButton"
                    )
                    .classList.add(
                        "primary"
                    );

                document
                    .getElementById(
                        "brushButton"
                    )
                    .classList.remove(
                        "primary"
                    );

            };


        /* =========================================================
           RESTAURAR
        ========================================================= */

        function restoreCharacter() {

            layers =
                cloneLayers(
                    library[
                        currentCharacter
                    ].layers
                );

            render();

        }


        /* =========================================================
           VALIDACIÓN
        ========================================================= */

        function validateGrid(
            grid,
            layerName
        ) {

            if (
                !Array.isArray(grid)
            ) {

                throw new Error(
                    layerName +
                    ": no es una matriz."
                );

            }


            if (
                grid.length !== 64
            ) {

                throw new Error(
                    layerName +
                    ": debe tener 64 filas."
                );

            }


            grid.forEach(
                (row, index) => {

                    if (
                        row.length !== 64
                    ) {

                        throw new Error(
                            layerName +
                            ": fila " +
                            index +
                            " no tiene 64 píxeles."
                        );

                    }

                }
            );

        }


        /* =========================================================
           EXPORT JSON
        ========================================================= */

        function exportJSON() {

            const payload = {

                palette:
                    PALETTE,

                layers: {}

            };


            Object.entries(layers)
                .forEach(
                    ([layerName, grid]) => {

                        validateGrid(
                            grid,
                            layerName
                        );

                        payload.layers[
                            layerName
                        ] =
                            grid.map(
                                row =>
                                    row.join("")
                            );

                    }
                );


            const json = {

                name:
                    currentCharacter,

                category:
                    "characters",

                payload:

                    payload

            };


            output.value =
                JSON.stringify(
                    json,
                    null,
                    2
                );

        }


        /* =========================================================
           COPIAR
        ========================================================= */


        function exportLayerJSON() {
            const payload = {
                palette: PALETTE,
                layer: currentLayer,
                grid: layers[currentLayer].map(row => row.join(""))
            };

            const json = {
                name: currentCharacter + "_" + currentLayer,
                category: "equipment",
                payload: payload
            };

            output.value = JSON.stringify(json, null, 2);
        }

        function copyLayerJSON() {
            exportLayerJSON();
            if (navigator.clipboard) {
                navigator.clipboard.writeText(output.value);
            }
        }

        function copyJSON() {

            exportJSON();

            if (
                navigator.clipboard
            ) {

                navigator.clipboard
                    .writeText(
                        output.value
                    );

            }

        }


        /* =========================================================
           INIT
        ========================================================= */

        buildPalette();

        updateInfo();

        render();

    