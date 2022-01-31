"use strict";
window.onload = main;
function main() {
    let showSolution = false;
    let settings;
    let grid = null;
    function updateSettings() {
        const formData = new FormData(document.getElementById('mazesettings'));
        settings = {
            sizeX: parseInt(formData.get("sizex").toString()),
            sizeY: parseInt(formData.get("sizey").toString()),
            generator: formData.get("generator").toString(),
            scale: parseInt(formData.get("scale").toString()),
            wallColour: formData.get("wallcolour").toString(),
            airColour: formData.get("aircolour").toString(),
            solColour: formData.get("solcolour").toString(),
            rainbowSol: formData.get("rainbowsol") !== null,
            freqNewest: parseInt(formData.get("freqnewest").toString()),
            freqOldest: parseInt(formData.get("freqoldest").toString()),
            freqRandom: parseInt(formData.get("freqrandom").toString())
        };
    }
    $(".generator").change(function (e) {
        if ($("#growingtree").is(":checked")) {
            $(".growingtreeoptions").show();
        }
        else {
            $(".growingtreeoptions").hide();
        }
    });
    $("#mazesettings").submit(function (e) {
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
        const outCanvas = document.getElementById("outcanvas");
        const outImage = document.getElementById("outimage");
        const imgURL = drawMaze(grid, settings.scale, outCanvas, settings.wallColour, settings.airColour);
        outImage.src = imgURL;
        $(".outsection").show();
        $("#togglesol").show();
    });
    $("#togglesol").click(function (e) {
        updateSettings();
        showSolution = !showSolution;
        const outCanvas = document.getElementById("outcanvas");
        const outImage = document.getElementById("outimage");
        if (grid.solution.length === 0) {
            grid.genPath();
        }
        const imgURL = toggleSolution(grid, settings.scale, outCanvas, showSolution, settings.airColour, settings.solColour, settings.rainbowSol);
        outImage.src = imgURL;
    });
}
class Grid {
    constructor(height, width) {
        this.height = height;
        this.width = width;
        this.grid = new Array();
        this.solution = new Array();
        for (let x = 0; x < height; x++) {
            let row = new Array();
            for (let y = 0; y < width; y++) {
                row.push(new Cell(x, y));
            }
            this.grid.push(row);
        }
        for (let x = 0; x < height; x++) {
            for (let y = 0; y < width; y++) {
                let neighbours = new Set();
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
    toStr(wall, air) {
        let s = wall + air + wall.repeat(this.width * 2 - 1);
        let cellRow = true;
        for (let x = 0; x < this.height * 2 - 1; x++) {
            let cellCol = true;
            let r = "\n" + wall;
            for (let y = 0; y < this.width * 2 - 1; y++) {
                let isAir = false;
                if (cellRow && cellCol) {
                    let cell = this.grid[Math.floor(x / 2)][Math.floor(y / 2)];
                    cell.getWalls().forEach(w => {
                        if (!w) {
                            isAir = true;
                        }
                    });
                }
                else if (cellRow) {
                    let cell = this.grid[Math.floor(x / 2)][Math.floor((y + 1) / 2)];
                    cell.connections.forEach(connection => {
                        let other = this.grid[Math.floor(x / 2)][Math.floor((y - 1) / 2)];
                        if (connection === other) {
                            isAir = true;
                        }
                    });
                }
                else if (cellCol) {
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
            s += r + wall;
            cellRow = !cellRow;
        }
        s += "\n" + wall.repeat(this.width * 2 - 1) + air + wall;
        return s;
    }
}
class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.pos = [x, y];
        this.posStr = this.pos.join(' ');
        this.visited = false;
        this.neighbours = new Set();
        this.connections = new Set();
    }
    addNeighbour(cell) {
        this.neighbours.add(cell);
        cell.neighbours.add(this);
    }
    addNeighbours(cells) {
        cells.forEach(cell => {
            this.addNeighbour(cell);
        });
    }
    addConnection(cell) {
        this.connections.add(cell);
        cell.connections.add(this);
    }
    addConnections(cells) {
        cells.forEach(cell => {
            this.addConnection(cell);
        });
    }
    removeConnection(cell) {
        if (this.connections.has(cell)) {
            this.connections.delete(cell);
            cell.connections.delete(this);
        }
    }
    toggleConnection(cell) {
        if (this.connections.has(cell)) {
            this.removeConnection(cell);
        }
        else {
            this.addConnection(cell);
        }
    }
    getWalls() {
        let sides = [true, true, true, true];
        this.connections.forEach(cell => {
            if (cell.pos[0] === this.pos[0]) {
                if (cell.pos[1] < this.pos[1]) {
                    sides[3] = false;
                }
                else {
                    sides[1] = false;
                }
            }
            else {
                if (cell.pos[0] < this.pos[0]) {
                    sides[0] = false;
                }
                else {
                    sides[2] = false;
                }
            }
        });
        return sides;
    }
}
function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}
function bfs(grid) {
    class Point {
        constructor(cell, parent) {
            this.cell = cell;
            this.parent = parent;
        }
    }
    let stack = new Array(new Point(grid.grid[0][0], null));
    let visited = new Set();
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
function aldousBroder(height, width) {
    let grid = new Grid(height, width);
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
            }
            if (a) {
                break;
            }
        }
        if (!a) {
            return grid;
        }
        let next = Array.from(cell.neighbours)[getRndInteger(0, cell.neighbours.size)];
        if (!next.visited) {
            cell.addConnection(next);
            next.visited = true;
        }
        cell = next;
    }
}
function backtracker(height, width) {
    let grid = new Grid(height, width);
    let stack = new Array(grid.grid[getRndInteger(0, height)][getRndInteger(0, width)]);
    stack[0].visited = true;
    let visitedCount = 1;
    while (stack.length > 0 && visitedCount < height * width) {
        let cell = stack.pop();
        let options = new Array();
        cell.neighbours.forEach(neighbour => {
            if (!neighbour.visited) {
                options.push(neighbour);
            }
        });
        if (options.length > 0) {
            stack.push(cell);
            let next = options[getRndInteger(0, options.length)];
            next.visited = true;
            cell.addConnection(next);
            stack.push(next);
            visitedCount += 1;
        }
    }
    return grid;
}
function binaryTree(height, width) {
    let grid = new Grid(height, width);
    grid.grid.forEach(function (row, x) {
        row.forEach(function (cell, y) {
            let possibleConnections = new Array();
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
function growingtree(height, width, freqNewest, freqOldest, freqRandom) {
    let grid = new Grid(height, width);
    let stack = new Array(grid.grid[getRndInteger(0, height)][getRndInteger(0, width)]);
    stack[0].visited = true;
    while (stack.length > 0) {
        let index = chooseCell(stack, freqNewest, freqOldest, freqRandom);
        let cell = stack[index];
        let unvisitedNeighbours = new Array();
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
    function chooseCell(cells, freqNewest, freqOldest, freqRandom) {
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
function huntAndKill(height, width) {
    let grid = new Grid(height, width);
    let cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
    cell.visited = true;
    while (true) {
        let unvisitedNeighbours = new Array();
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
        }
        else {
            let cellFound = false;
            for (let x = 0; x < height && !cellFound; x++) {
                for (let y = 0; y < width; y++) {
                    cell = grid.grid[x][y];
                    if (!cell.visited) {
                        let visitedNeighbours = new Array();
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
function prims(height, width) {
    let grid = new Grid(height, width);
    let walls = new Array();
    let cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
    cell.visited = true;
    cell.neighbours.forEach(neighbour => {
        walls.push([cell, neighbour]);
    });
    while (walls.length > 0) {
        let n = getRndInteger(0, walls.length);
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
            }
            else {
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
function random(height, width) {
    let grid = new Grid(height, width);
    let cell = new Cell(-1, -1);
    let other = new Cell(-1, -1);
    while (bfs(grid) === null) {
        cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
        other = Array.from(cell.neighbours)[getRndInteger(0, cell.neighbours.size)];
        cell.addConnection(other);
    }
    while (bfs(grid) !== null) {
        cell = grid.grid[getRndInteger(0, height)][getRndInteger(0, width)];
        other = Array.from(cell.neighbours)[getRndInteger(0, cell.neighbours.size)];
        cell.removeConnection(other);
    }
    cell.addConnection(other);
    return grid;
}
function recursiveDivision(height, width) {
    height = parseInt(height.toString());
    width = parseInt(width.toString());
    let grid = new Grid(height, width);
    grid.grid.forEach(row => {
        row.forEach(cell => {
            cell.addConnections(cell.neighbours);
        });
    });
    divide(grid, 0, 0, width, height, chooseOrientation(width, height));
    function divide(grid, x, y, width, height, orientation) {
        if (width < 2 || height < 2) {
            return;
        }
        let horizontal = orientation === "horizontal";
        let wx = horizontal ? x + getRndInteger(0, height - 1) : x;
        let wy = horizontal ? y : y + getRndInteger(0, width - 1);
        let px = horizontal ? wx : wx + getRndInteger(0, height);
        let py = horizontal ? wy + getRndInteger(0, width) : wy;
        let dx = horizontal ? 1 : 0;
        let dy = horizontal ? 0 : 1;
        let mx = horizontal ? 0 : 1;
        let my = horizontal ? 1 : 0;
        let wallLen = horizontal ? width : height;
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
    function chooseOrientation(width, height) {
        if (width < height) {
            return "horizontal";
        }
        else if (width > height) {
            return "vertical";
        }
        else {
            return getRndInteger(0, 2) == 0 ? "horizontal" : "vertical";
        }
    }
    return grid;
}
function sidewinder(height, width) {
    let grid = new Grid(height, width);
    let weight = 2;
    for (let x = 0; x < height; x++) {
        let run_start = 0;
        for (let y = 0; y < width; y++) {
            if (x > 0 && (y === width - 1 || getRndInteger(0, weight) === 0)) {
                let cy = run_start + getRndInteger(0, y - run_start);
                grid.grid[x][cy].addConnection(grid.grid[x - 1][cy]);
                run_start = y + 1;
            }
            else if (y < width - 1) {
                grid.grid[x][y].addConnection(grid.grid[x][y + 1]);
            }
        }
    }
    return grid;
}
function drawMaze(grid, scale, canvas, wallHex, airHex) {
    let ctx = canvas.getContext("2d");
    let gridStr = grid.toStr("*", " ").split("\n");
    ctx.fillStyle = airHex;
    ctx.fillRect(0, 0, gridStr.length * scale, gridStr[0].length * scale);
    ctx.fillStyle = wallHex;
    for (let x = 0; x < gridStr.length; x++) {
        for (let y = 0; y < gridStr[x].length; y++) {
            if (gridStr[x][y] == "*") {
                ctx.fillRect(y * scale, x * scale, scale, scale);
            }
        }
    }
    return canvas.toDataURL();
}
function toggleSolution(grid, scale, canvas, showSolution, airHex, solHex, rainbow) {
    let ctx = canvas.getContext("2d");
    let solution = grid.solution;
    let hue = 0.0;
    let sat = "100%";
    let val = "50%";
    let inc = 360.0 / solution.length;
    if (showSolution && rainbow) {
        ctx.fillStyle = `hsl(${hue}, ${sat}, ${val})`;
    }
    else if (showSolution) {
        ctx.fillStyle = solHex;
    }
    else {
        ctx.fillStyle = airHex;
    }
    function incHue(n) {
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
        if (cell.pos[0] === next.pos[0]) {
            ctx.fillRect((cell.pos[1] + next.pos[1] + 1) * scale, (cell.pos[0] * 2 + 1) * scale, scale, scale);
        }
        else if (cell.pos[1] === next.pos[1]) {
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
