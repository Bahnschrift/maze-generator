export class Cell {
    x;
    y;
    visited;
    neighbours;
    connections;
    walls;
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.visited = false;
        this.neighbours = new Set();
        this.connections = new Set();
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true
        };
    }
    getPost() {
        return [this.x, this.y];
    }
    addNeighbour(cell) {
        this.neighbours.add(cell);
        cell.neighbours.add(this);
    }
    addNeighbours(cells) {
        cells.forEach(cell => this.addNeighbour(cell));
    }
    addConnection(cell) {
        this.connections.add(cell);
        cell.connections.add(this);
    }
    addConnections(cells) {
        cells.forEach(cell => this.addConnection(cell));
    }
    removeConnection(cell) {
        this.connections.delete(cell);
        cell.connections.delete(this);
    }
    hasConnection(cell) {
        return this.connections.has(cell);
    }
}
