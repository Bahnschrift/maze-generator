from .cell import Cell


class Grid:
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.grid = [
            [Cell(x, y) for x in range(width)] for y in range(height)
        ]  # 2D array: List of lists of Cell objects

        for x, row in enumerate(self.grid):
            for y, cell in enumerate(row):
                if x != 0:
                    cell.add_neighbour(self.grid[x - 1][y])
                if x != len(self.grid) - 1:
                    cell.add_neighbour(self.grid[x + 1][y])
                if y != 0:
                    cell.add_neighbour(self.grid[x][y - 1])
                if y != len(row) - 1:
                    cell.add_neighbour(self.grid[x][y + 1])
