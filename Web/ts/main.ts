window.onload = main;


function main() {
    let showSolution: boolean = false;
    let settings: {
        sizeX : number;
        sizeY: number;
        generator: string;
        scale: number;
        wallColour: string;
        airColour: string;
        solColour: string;
        rainbowSol: boolean;
        freqNewest: number;
        freqOldest: number;
        freqRandom: number;
    };
    let grid: Grid | null = null;

    function updateSettings() {
        const formData = new FormData(<HTMLFormElement> document.getElementById('mazesettings'));
        settings = {
            sizeX: parseInt(formData.get("sizex")!.toString()),
            sizeY: parseInt(formData.get("sizey")!.toString()),
            generator: formData.get("generator")!.toString(),
            scale: parseInt(formData.get("scale")!.toString()),
            wallColour: formData.get("wallcolour")!.toString(),
            airColour: formData.get("aircolour")!.toString(),
            solColour: formData.get("solcolour")!.toString(),
            rainbowSol: formData.get("rainbowsol") !== null,
            freqNewest: parseInt(formData.get("freqnewest")!.toString()),
            freqOldest: parseInt(formData.get("freqoldest")!.toString()),
            freqRandom: parseInt(formData.get("freqrandom")!.toString())
        };
    }

    $(".generator").change(function(e) {
        if ($("#growingtree").is(":checked")) {
            $(".growingtreeoptions").show();
        } else {
            $(".growingtreeoptions").hide();
        }
    });

    $("#mazesettings").submit(function(e) {
        e.preventDefault();
        showSolution = false;
        updateSettings();
        switch (settings.generator) {
            case "aldousbroder":
                grid = aldousBroder(settings.sizeX, settings.sizeY);
                break;
            case "backtracker":
                grid = backtracker(settings.sizeX, settings.sizeY);
                break;
            case "binarytree":
                grid = binaryTree(settings.sizeX, settings.sizeY);
                break;
            case "growingtree":
                grid = growingtree(settings.sizeX, settings.sizeY, settings.freqNewest, settings.freqOldest, settings.freqRandom);
                break;
            case "huntandkill":
                grid = huntAndKill(settings.sizeX, settings.sizeY);
                break;
            case "prims":
                grid = prims(settings.sizeX, settings.sizeY);
                break;
            case "random":
                grid = random(settings.sizeX, settings.sizeY);
                break;
            case "recursivedivision":
                grid = recursiveDivision(settings.sizeX, settings.sizeY);
                break;
            case "sidewinder":
                grid = sidewinder(settings.sizeX, settings.sizeY);
                break;
            default:
                grid = backtracker(settings.sizeX, settings.sizeY);
                break;
        }
        
        $("#outcanvas").attr("width", (settings.sizeY * 2 + 1) * settings.scale);
        $("#outimage").attr("width", (settings.sizeY * 2 + 1) * settings.scale);
        $("#outcanvas").attr("height", (settings.sizeX * 2 + 1) * settings.scale);
        $("#outimage").attr("height", (settings.sizeX * 2 + 1) * settings.scale);

        const outCanvas = <HTMLCanvasElement> document.getElementById("outcanvas");
        const outImage = <HTMLImageElement> document.getElementById("outimage");
        const imgURL = drawMaze(grid, settings.scale, outCanvas, settings.wallColour, settings.airColour);
        outImage.src = imgURL;

        $(".outsection").show();
        $("#togglesol").show();
    });

    $("#togglesol").click(function(e) {
        updateSettings();
        showSolution = !showSolution;
        const outCanvas: HTMLCanvasElement = <HTMLCanvasElement> document.getElementById("outcanvas");
        const outImage: HTMLImageElement = <HTMLImageElement> document.getElementById("outimage");
        if (grid!.solution.length === 0) {
            grid!.genPath();
        }
        const imgURL: string = toggleSolution(grid!, settings.scale, outCanvas, showSolution, settings.airColour, settings.solColour, settings.rainbowSol);
        outImage.src = imgURL;
    });
}


class Grid {
    height: number;
    width: number;
    grid: Array<Array<Cell>>;
    solution: Array<Cell>;
    constructor(height: number, width: number) {
        this.height = height;
        this.width = width;
        this.grid = new Array<Array<Cell>>();
        this.solution = new Array<Cell>();
        
        for (let x = 0; x < height; x++) {
            let row = new Array<Cell>();
            for (let y = 0; y < width; y++) {
                row.push(new Cell(x, y));
            }
            this.grid.push(row);
        }

        for (let x = 0; x < height; x++) {
            for (let y = 0; y < width; y++) {
                let neighbours = new Set<Cell>();
                if (x != 0) {
                    neighbours.add(this.grid[x - 1][y]);
                }
                if (x != this.height - 1) {
                    neighbours.add(this.grid[x + 1][y]);
                }
                if (y != 0) {
                    neighbours.add(this.grid[x][y - 1]);
                }
                if (y != this.width - 1) {
                    neighbours.add(this.grid[x][y + 1]);
                }
                this.grid[x][y].addNeighbours(neighbours);
            }
        }
    }

    genPath() {
        let p = bfs(this);
        while (p !== null) {
            this.solution.push(p.cell);
            p = p.parent;
        }
    }

    toStr(wall: string, air: string) {
        let s: string = wall + air + wall.repeat(this.width * 2 - 1);

        let cellRow: boolean = true
        for (let x: number = 0; x < this.height * 2 - 1; x++) {
            let cellCol: boolean = true;
            let r: string = "\n" + wall;
            for (let y: number = 0; y < this.width * 2 - 1; y++) {
                let isAir: boolean = false;
                if (cellRow && cellCol) {
                    let cell: Cell = this.grid[Math.floor(x / 2)][Math.floor(y / 2)];  // Don't code like this
                    cell.getWalls().forEach(w => {
                        if (!w) {
                            isAir = true;
                        }
                    });

                } else if (cellRow) {
                    let cell = this.grid[Math.floor(x / 2)][Math.floor((y + 1) / 2)];  // TBH, I don't actually know how this works anymore
                    cell.connections.forEach(connection => {
                        let other = this.grid[Math.floor(x / 2)][Math.floor((y - 1) / 2)];
                        if (connection === other) {
                            isAir = true;
                        }
                    });

                } else if (cellCol) {
                    let cell = this.grid[Math.floor((x + 1) / 2)][Math.floor(y / 2)];
                    cell.connections.forEach(connection => {
                        let other = this.grid[Math.floor((x - 1) / 2)][Math.floor(y / 2)];
                        if (connection === other) {
                            isAir = true;
                        }
                    });
                }                
                r += isAir ? air : wall;
                cellCol = !cellCol;
            }
            s += r + wall
            cellRow = !cellRow;
        }
        s += "\n" + wall.repeat(this.width * 2 - 1) + air + wall;
        return s;
    }
}


class Cell {
    x: number;
    y: number;
    pos: [number, number];
    posStr: string;
    visited: boolean;
    neighbours: Set<Cell>;
    connections: Set<Cell>;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.pos = [x, y];
        this.posStr = this.pos.join(' ');
        this.visited = false;
        this.neighbours = new Set();
        this.connections = new Set();
    }

    addNeighbour(cell: Cell) {
        this.neighbours.add(cell);
        cell.neighbours.add(this);
    }

    addNeighbours(cells: Set<Cell>) {
        cells.forEach(cell => {
            this.addNeighbour(cell);
        });
    }

    addConnection(cell: Cell) {
        this.connections.add(cell);
        cell.connections.add(this);
    }

    addConnections(cells: Set<Cell>) {
        cells.forEach(cell => {
            this.addConnection(cell);
        });
    }

    removeConnection(cell: Cell) {
        if (this.connections.has(cell)) {
            this.connections.delete(cell);
            cell.connections.delete(this);
        }
    }

    toggleConnection(cell: Cell) {
        if (this.connections.has(cell)) {
            this.removeConnection(cell);
        } else {
            this.addConnection(cell);
        }
    }

    getWalls() {
        let sides: boolean[] = [true, true, true, true];  // Up right bottom left
        this.connections.forEach(cell => {
            if (cell.pos[0] === this.pos[0]) {
                if (cell.pos[1] < this.pos[1]) {
                    sides[3] = false;           // Left
                } else {
                    sides[1] = false;           // Right
                }
            } else {
                if (cell.pos[0] < this.pos[0]) {
                    sides[0] = false;           // Above
                } else {
                    sides[2] = false;           // Below
                }
            }
        });
        return sides;
    }
}


function getRndInteger(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) ) + min;
}


function bfs(grid: Grid) {
    class Point {
        cell: Cell;
        parent: Point | null;
        constructor(cell: Cell, parent: Point | null) {
            this.cell = cell;
            this.parent = parent;
        }
    }
    let stack = new Array<Point>(new Point(grid.grid[0][0], null));
    let visited = new Set<Cell>();
    visited.add(grid.grid[0][0]);
    while (stack.length > 0) {
        let point = stack.splice(0, 1)[0];
        if (point.cell.pos.toString() == [grid.height - 1, grid.width - 1].toString()) {
            return point;
        }
        point.cell.connections.forEach(connection => {
            if (!visited.has(connection)) {
                visited.add(connection);
                stack.push(new Point(connection, point));
            }
        });
    }
    return null; 
}


function aldousBroder(height: number, width: number) {
    let grid: Grid = new Grid(height, width);
    let cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
    cell.visited = true;

    while (true) {
        let a = false;

        for (let row of grid.grid) {
            for (let cell of row) {
                if (!cell.visited) {
                    a = true;
                    break;
                }
            } if (a) {
                break;
            }
        }
        if (!a) {
            return grid;
        }
        let next: Cell = Array.from(cell.neighbours)[getRndInteger(0, cell.neighbours.size)];
        if (!next.visited) {
            cell.addConnection(next);
            next.visited = true;
        }
        cell = next;
    }
}


function backtracker(height: number, width: number) {  // Iterative backtracker bc of size limits with recursive
    let grid = new Grid(height, width);
    let stack = new Array<Cell>(grid.grid[getRndInteger(0, height)][getRndInteger(0, width)]);
    stack[0].visited = true;
    let visitedCount = 1;

    while (stack.length > 0 && visitedCount < height * width) {
        let cell = stack.pop()!;
        let options = new Array<Cell>();
        cell.neighbours.forEach(neighbour => {
            if (!neighbour.visited) {
                options.push(neighbour);
            }
        });

        if (options.length > 0) {
            stack.push(cell);
            let next: Cell = options[getRndInteger(0, options.length)];
            next.visited = true;
            cell.addConnection(next);
            stack.push(next);
            visitedCount += 1;
        }
    }
    return grid;
}


function binaryTree(height: number, width: number) {
    let grid = new Grid(height, width);
    grid.grid.forEach(function(row, x) {
        row.forEach(function(cell, y) {
            let possibleConnections = new Array<Cell>();
            if (x > 0) {
                possibleConnections.push(grid.grid[x - 1][y]);
            } 
            if (y > 0) {
                possibleConnections.push(grid.grid[x][y - 1]);
            }
            if (possibleConnections.length > 0) {
                let neighbour = possibleConnections[getRndInteger(0, possibleConnections.length)];
                cell.addConnection(neighbour);
            }
        });
    });
    return grid;
}


function growingtree(height: number, width: number, freqNewest: number, freqOldest: number, freqRandom: number) {
    let grid = new Grid(height, width);
    let stack = new Array<Cell>(grid.grid[getRndInteger(0, height)][getRndInteger(0, width)]);
    stack[0].visited = true;

    while (stack.length > 0) {
        let index = chooseCell(stack, freqNewest, freqOldest, freqRandom);
        let cell = stack[index];
        let unvisitedNeighbours = new Array<Cell>();
        cell.neighbours.forEach(neighbour => {
            if (!neighbour.visited) {
                unvisitedNeighbours.push(neighbour);
            }
        });

        if (unvisitedNeighbours.length > 0) {
            let neighbour = unvisitedNeighbours[getRndInteger(0, unvisitedNeighbours.length)];
            cell.addConnection(neighbour);
            neighbour.visited = true;
            stack.push(neighbour);
            index = -1;
        }

        if (index !== -1) {
            stack.splice(index, 1);
        }
    }

    function chooseCell(cells: Array<Cell>, freqNewest: number, freqOldest: number, freqRandom: number) {
        let oldest = 0;
        let newest = cells.length - 1;
        let rndm = getRndInteger(0, cells.length);

        let total = freqNewest + freqOldest + freqRandom;
        freqOldest += freqNewest;
        freqRandom += freqOldest;
        let number = getRndInteger(0, total);

        return number < freqNewest ? newest : number < freqOldest ? oldest : rndm;
    }
    return grid;
}


function huntAndKill(height: number, width: number) {
    let grid = new Grid(height, width);
    let cell: Cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
    cell.visited = true;

    while (true) {
        // Merge with a nearby unvisited cell
        let unvisitedNeighbours = new Array<Cell>();
        cell.neighbours.forEach(neighbour => {
            if (!neighbour.visited) {
                unvisitedNeighbours.push(neighbour);
            }
        });
        if (unvisitedNeighbours.length > 0) {
            let neighbour = unvisitedNeighbours[getRndInteger(0, unvisitedNeighbours.length)];
            cell.addConnection(neighbour);
            neighbour.visited = true;
            cell = neighbour;
        } else {  // Scan to find a new starting point
            let cellFound = false;
            for (let x = 0; x < height && !cellFound; x++) {
                for (let y = 0; y < width; y++) {
                    cell = grid.grid[x][y];
                    if (!cell.visited) {
                        let visitedNeighbours = new Array<Cell>();
                        cell.neighbours.forEach(neighbour => {
                            if (neighbour.visited) {
                                visitedNeighbours.push(neighbour);
                            }
                        });

                        if (visitedNeighbours.length > 0) {
                            cellFound = true;
                            let neighbour = visitedNeighbours[getRndInteger(0, visitedNeighbours.length)];
                            cell.addConnection(neighbour);
                            cell.visited = true;
                            break;
                        }
                    }
                }
            }
            if (!cellFound) {
                return grid;
            }
        }
    }
}


function prims(height: number, width: number) {
    let grid: Grid = new Grid(height, width);
    let walls = new Array<Array<Cell>>();
    let cell: Cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
    cell.visited = true;
    cell.neighbours.forEach(neighbour => {
        walls.push([cell, neighbour]);
    });

    while (walls.length > 0) {
        let n: number = getRndInteger(0, walls.length);
        let wall = walls.splice(n, 1)[0];
        n = 0;
        wall.forEach(c => {
            if (c.visited) {
                n += 1;
            }
        });
        if (n === 1) {
            wall[0].addConnection(wall[1]);
            if (wall[0].visited) {
                cell = wall[1];
            } else {
                cell = wall[0];
            }

            cell.visited = true;
            cell.neighbours.forEach(neighbour => {
                if (!cell.connections.has(neighbour)) {
                    walls.push([cell, neighbour]);
                }
            });
        }
    }
    return grid;
}


function random(height: number, width: number) {
    let grid: Grid = new Grid(height, width);
    let cell: Cell = new Cell(-1, -1);
    let other: Cell = new Cell(-1, -1);

    while (bfs(grid) === null) {
        cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
        other = Array.from(cell.neighbours)[getRndInteger(0, cell.neighbours.size)];
        cell.addConnection(other);
    }

    while(bfs(grid) !== null) {
        cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
        other = Array.from(cell.neighbours)[getRndInteger(0, cell.neighbours.size)];
        cell.removeConnection(other);
    }

    cell.addConnection(other);
    return grid;
}


function recursiveDivision(height: number, width: number) {
    height = parseInt(height.toString());
    width = parseInt(width.toString());
    let grid = new Grid(height, width);
    grid.grid.forEach(row => {  // Start with a full grid
        row.forEach(cell => {
            cell.addConnections(cell.neighbours);
        });
    });

    divide(grid, 0, 0, width, height, chooseOrientation(width, height));

    function divide(grid: Grid, x: number, y: number, width: number, height: number, orientation: string) {  // FIX THIS
        if (width < 2 || height < 2) {
            return;
        }
        let horizontal = orientation === "horizontal";

        let wx = horizontal ? x + getRndInteger(0, height - 1) : x;  // Position for the wall to start from
        let wy = horizontal ? y : y + getRndInteger(0, width - 1);

        let px = horizontal ? wx : wx + getRndInteger(0, height);  // Position of the hole in the wall
        let py = horizontal ? wy + getRndInteger(0, width) : wy;

        let dx = horizontal ? 1 : 0;  // Direction of cells to join
        let dy = horizontal ? 0 : 1;

        let mx = horizontal ? 0 : 1;  // Direction of the wall
        let my = horizontal ? 1 : 0;

        let wallLen = horizontal ? width : height;  // Length of the wall
        
        for (let i = 0; i < wallLen; i++) {
            if (wx !== px || wy !== py) {
                grid.grid[wx][wy].removeConnection(grid.grid[wx + dx][wy + dy]);
            }
            wx += mx;
            wy += my;
        }

        let nx = x;
        let ny = y;
        let w = horizontal ? width : wy - y + 1;
        let h = horizontal ? wx - x + 1 : height;
        divide(grid, nx, ny, w, h, chooseOrientation(w, h));

        nx = horizontal ? wx + 1 : x;
        ny = horizontal ? y : wy + 1;
        w = horizontal ? width : y + width - wy - 1;
        h = horizontal ? x + height - wx - 1 : height;
        divide(grid, nx, ny, w, h, chooseOrientation(w, h));
    }

    function chooseOrientation(width: number, height: number) {
        if (width < height) {
            return "horizontal";
        } else if (width > height) {
            return "vertical";
        } else {
            return getRndInteger(0, 2) == 0 ? "horizontal" : "vertical";
        }
    }
    return grid;
}


function sidewinder(height: number, width: number) {
    let grid = new Grid(height, width);
    let weight = 2;  // TODO: customization
    for (let x = 0; x < height; x++) {
        let run_start = 0;
        for (let y = 0; y < width; y++) {
            if (x > 0 && (y === width - 1 || getRndInteger(0, weight) === 0)) {
                let cy = run_start + getRndInteger(0, y - run_start);
                grid.grid[x][cy].addConnection(grid.grid[x - 1][cy]);
                run_start = y + 1;
            } else if (y < width - 1) {
                grid.grid[x][y].addConnection(grid.grid[x][y + 1]);
            }
        }
    }
    return grid;
}


function drawMaze(grid: Grid, scale: number, canvas: HTMLCanvasElement, wallHex: string, airHex: string) {
    let ctx = canvas.getContext("2d")!;
    let gridStr: Array<String> = grid.toStr("*", " ").split("\n");

    ctx.fillStyle = airHex;
    ctx.fillRect(0, 0, gridStr.length * scale, gridStr[0].length * scale);

    ctx.fillStyle = wallHex;
    for (let x: number = 0; x < gridStr.length; x++) {
        for (let y: number = 0; y < gridStr[x].length; y++) {
            if (gridStr[x][y] == "*") {
                ctx.fillRect(y * scale, x * scale, scale, scale);
            }
        }
    }
    return canvas.toDataURL();
}


function toggleSolution(grid: Grid, scale: number, canvas: HTMLCanvasElement, showSolution: boolean, airHex: string, solHex: string, rainbow: boolean) {
    let ctx = canvas.getContext("2d")!;
    let solution = grid.solution;
    let hue = 0.0;
    let sat = "100%";
    let val = "50%";
    let inc = 360.0 / solution.length;

    if (showSolution && rainbow) {
        ctx.fillStyle = `hsl(${hue}, ${sat}, ${val})`;
    } else if (showSolution) {
        ctx.fillStyle = solHex;
    } else {
        ctx.fillStyle = airHex;
    }

    function incHue(n: number) {
        hue += n;
        hue %= 360.0;
    }
    
    ctx.fillRect((grid.width * 2 - 1) * scale, (grid.height * 2) * scale, scale, scale);
    for (let solIndex = 0; solIndex < solution.length - 1; solIndex++) {
        if (showSolution && rainbow) {
            incHue(inc);
            ctx.fillStyle = `hsl(${hue}, ${sat}, ${val})`;
        }

        let cell = solution[solIndex];
        let next = solution[solIndex + 1];
        ctx.fillRect((cell.pos[1] * 2 + 1) * scale, (cell.pos[0] * 2 + 1) * scale, scale, scale);

        if (cell.pos[0] === next.pos[0]) {  // Same col
            ctx.fillRect((cell.pos[1] + next.pos[1] + 1) * scale, (cell.pos[0] * 2 + 1) * scale, scale, scale);
        } else if (cell.pos[1] === next.pos[1]) {  // Same row
            ctx.fillRect((cell.pos[1] * 2 + 1) * scale, (cell.pos[0] + next.pos[0] + 1) * scale, scale, scale);
        }
    }
    if (showSolution && rainbow) {
        incHue(inc);
        ctx.fillStyle = `hsl(${hue}, ${sat}, ${val})`;
    }
    ctx.fillRect(scale, 0, scale, scale * 2);
    return canvas.toDataURL();
}