import { Grid } from "./grid.js";
import { Cell } from "./cell.js";


function randInt(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


export function aldousBroder(width: number, height: number) {
    let grid = new Grid(width, height);
    let cell = grid.grid[randInt(0, height)][randInt(0, width)];
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
        let next = Array.from(cell.neighbours)[randInt(0, cell.neighbours.size)];
        if (!next.visited) {
            cell.addConnection(next);
            next.visited = true;
        }
        cell = next;
    }
}


export function backtracker(width: number, height: number) {
    let grid = new Grid(width, height);
    let stack = [grid.grid[randInt(0, height)][randInt(0, width)]];

    stack[0].visited = true;
    let vCount = 1;

    while (stack.length && vCount < width * height) {
        let cell = stack.pop()!;
        let options = [...cell.neighbours].filter(n => !n.visited);

        if (options.length) {
            let next = options[randInt(0, options.length)];

            cell.addConnection(next);
            stack.push(cell);
            stack.push(next);

            next.visited = true;
            vCount += 1;
        }
    }
    return grid;
}


export function binaryTree(width: number, height: number) {
    let grid = new Grid(width, height);
    grid.grid.forEach(function(row, y) {
        row.forEach(function(cell, x) {
            let possibleConnections = [];
            if (y > 0) {
                possibleConnections.push(grid.grid[y - 1][x]);
            } 
            if (x > 0) {
                possibleConnections.push(grid.grid[y][x - 1]);
            }
            if (possibleConnections.length > 0) {
                let neighbour = possibleConnections[randInt(0, possibleConnections.length)];
                cell.addConnection(neighbour);
            }
        });
    });
    return grid;
}


export function growingTree(width: number, height: number, freqNewest: number, freqOldest: number, freqRandom: number) {
    let grid = new Grid(width, height);
    let stack = [grid.grid[randInt(0, height)][randInt(0, width)]];
    stack[0].visited = true;

    while (stack.length > 0) {
        let index = chooseCell(stack, freqNewest, freqOldest, freqRandom);
        let cell = stack[index];
        let unvisitedNeighbours: Cell[] = [];
        cell.neighbours.forEach(neighbour => {
            if (!neighbour.visited) {
                unvisitedNeighbours.push(neighbour);
            }
        });

        if (unvisitedNeighbours.length > 0) {
            let neighbour = unvisitedNeighbours[randInt(0, unvisitedNeighbours.length)];
            cell.addConnection(neighbour);
            neighbour.visited = true;
            stack.push(neighbour);
            index = -1;
        }

        if (index !== -1) {
            stack.splice(index, 1);
        }
    }

    function chooseCell(cells: Cell[], freqNewest: number, freqOldest: number, freqRandom: number) {
        let oldest = 0;
        let newest = cells.length - 1;
        let rndm = randInt(0, cells.length);

        let total = freqNewest + freqOldest + freqRandom;
        freqOldest += freqNewest;
        freqRandom += freqOldest;
        let number = randInt(0, total);

        return number < freqNewest ? newest : number < freqOldest ? oldest : rndm;
    }
    return grid;
}


export function huntAndKill(width: number, height: number) {
    let grid = new Grid(width, height);
    let cell = grid.grid[randInt(0, height)][randInt(0, width)];
    cell.visited = true;

    while (true) {
        let unvisitedNeighbours = new Array<Cell>();
        cell.neighbours.forEach(neighbour => {
            if (!neighbour.visited) {
                unvisitedNeighbours.push(neighbour);
            }
        });
        if (unvisitedNeighbours.length > 0) {
            let neighbour = unvisitedNeighbours[randInt(0, unvisitedNeighbours.length)];
            cell.addConnection(neighbour);
            neighbour.visited = true;
            cell = neighbour;
        } else {  // Scan to find a new starting point
            let cellFound = false;
            for (let y = 0; y < height && !cellFound; y++) {
                for (let x = 0; x < width; x++) {
                    cell = grid.grid[y][x];
                    if (!cell.visited) {
                        let visitedNeighbours: Cell[] = [];
                        cell.neighbours.forEach(neighbour => {
                            if (neighbour.visited) {
                                visitedNeighbours.push(neighbour);
                            }
                        });

                        if (visitedNeighbours.length > 0) {
                            cellFound = true;
                            let neighbour = visitedNeighbours[randInt(0, visitedNeighbours.length)];
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


export function prims(width: number, height: number) {
    let grid = new Grid(width, height);
    let walls: Cell[][] = [];
    let cell = grid.grid[randInt(0, height)][randInt(0, width)];
    cell.visited = true;
    cell.neighbours.forEach(neighbour => {
        walls.push([cell, neighbour]);
    });

    while (walls.length > 0) {
        let n: number = randInt(0, walls.length);
        let wall = walls.splice(n, 1)[0];
        n = 0;
        wall.forEach(c => {
            if (c.visited) {
                n += 1;
            }
        });
        if (n == 1) {
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


export function recursiveDivision(width: number, height: number) {
    height = parseInt(height.toString());
    width = parseInt(width.toString());
    let grid = new Grid(width, height);

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

        let wx = horizontal ? x + randInt(0, height - 1) : x;  // Position for the wall to start from
        let wy = horizontal ? y : y + randInt(0, width - 1);

        let px = horizontal ? wx : wx + randInt(0, height);  // Position of the hole in the wall
        let py = horizontal ? wy + randInt(0, width) : wy;

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
            return randInt(0, 2) == 0 ? "horizontal" : "vertical";
        }
    }
    return grid;
}


export function sidewinder(width: number, height: number) {
    let grid = new Grid(width, height);
    let weight = 2;  // TODO: customization
    for (let y = 0; y < height; y++) {
        let run_start = 0;
        for (let x = 0; x < width; x++) {
            if (y > 0 && (x == width - 1 || randInt(0, weight) == 0)) {
                let cx = run_start + randInt(0, x - run_start);
                grid.grid[y][cx].addConnection(grid.grid[y - 1][cx]);
                run_start = x + 1;
            } else if (x < width - 1) {
                grid.grid[y][x].addConnection(grid.grid[y][x + 1]);
            }
        }
    }
    return grid;
}
