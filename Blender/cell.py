class Cell:
    def __init__(self, x: int, y: int):
        self.x = x
        self.y = y
        self.neighbours = set()
        self.connections = set()
        self.visited = False

    # Allows cells to be contained within sets
    def __hash__(self) -> int:
        return id(self)

    # Adds the given cell to this cell's neighbours set, and vice-versa
    def add_neighbour(self, cell: "Cell"):
        self.neighbours.add(cell)
        cell.neighbours.add(self)

    # Adds all of the given cells to this cell's neighbours set, and vice-versa
    def add_neighbours(self, cells: list):
        for cell in cells:
            self.add_neighbour(cell)

    # Adds the given cell to this cell's connections set, and vice-versa
    def add_connection(self, cell: "Cell"):
        self.connections.add(cell)
        cell.connections.add(self)

    # Adds all of the given cells to this cell's connections set, and vice-versa
    def add_connections(self, cells: list):
        for cell in cells:
            self.add_connection(cell)

    # Removes the given cell from this cell's neighbours set, and vice-versa
    def remove_connection(self, cell: "Cell"):
        if cell in self.connections:
            self.connections.remove(cell)
            cell.connections.remove(self)
