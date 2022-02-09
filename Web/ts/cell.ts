export class Cell {
    x: number;
    y: number;
    visited: boolean;
    neighbours: Set<Cell>;
    connections: Set<Cell>;
    walls: {
        top: boolean;
        right: boolean;
        bottom: boolean;
        left: boolean;
    }

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.neighbours = new Set<Cell>();
        this.connections = new Set<Cell>();
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        }
    }

    getPost() {
        return [this.x, this.y];
    }

    addNeighbour(cell: Cell) {
        this.neighbours.add(cell);
        cell.neighbours.add(this);
    }

    addNeighbours(cells: Cell[] | Set<Cell>) {
        cells.forEach(cell => this.addNeighbour(cell));
    }

    addConnection(cell: Cell) {
        this.connections.add(cell);
        cell.connections.add(this);
    }

    addConnections(cells: Cell[] | Set<Cell>) {
        cells.forEach(cell => this.addConnection(cell));
    }

    removeConnection(cell: Cell) {
        this.connections.delete(cell);
        cell.connections.delete(this);
    }

    hasConnection(cell: Cell) {
        return this.connections.has(cell);
    }
}