import { Cell } from './cell.js';
export class Grid {
    height;
    width;
    grid;
    solution;
    wallsGened;
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = [];
        this.solution = [];
        this.wallsGened = false;
        for (let y = 0; y < height; y++) {
            this.grid[y] = [];
            for (let x = 0; x < width; x++) {
                this.grid[y][x] = new Cell(x, y);
                if (y > 0) {
                    this.grid[y][x].addNeighbour(this.grid[y - 1][x]);
                }
                if (x > 0) {
                    this.grid[y][x].addNeighbour(this.grid[y][x - 1]);
                }
            }
        }
    }
    genWalls() {
        if (!this.wallsGened) {
            for (let y = 0; y < this.height; y++) {
                for (let x = 0; x < this.width; x++) {
                    let cell = this.grid[y][x];
                    if (y < this.height - 1 && cell.connections.has(this.grid[y + 1][x])) {
                        cell.walls.bottom = false;
                        (this.grid[y + 1][x]).walls.top = false;
                    }
                    if (x < this.width - 1 && cell.connections.has(this.grid[y][x + 1])) {
                        cell.walls.right = false;
                        (this.grid[y][x + 1]).walls.left = false;
                    }
                }
            }
            this.wallsGened = true;
        }
    }
    clearVisted() {
        this.grid.forEach(row => row.forEach(cell => cell.visited = false));
    }
    genSolution() {
        class Point {
            cell;
            parent;
            constructor(cell, parent) {
                this.cell = cell;
                this.parent = parent;
            }
        }
        this.clearVisted();
        const start = this.grid[0][0];
        const end = this.grid[this.height - 1][this.width - 1];
        var stack = [new Point(start, null)];
        while (stack.length > 0) {
            var point = stack.pop();
            if (point.cell === end) {
                while (point.parent) {
                    this.solution.push(point.cell);
                    point = point.parent;
                }
                this.solution.push(point.cell);
            }
            point.cell.visited = true;
            point.cell.connections.forEach(connection => {
                if (!connection.visited) {
                    stack.push(new Point(connection, point));
                }
            });
        }
    }
}
