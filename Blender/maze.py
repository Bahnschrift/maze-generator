from .grid import Grid
from random import randint, randrange


def iterative_backtracker(width: int, height: int):
    grid = Grid(width, height)
    stack = [grid.grid[randrange(height)][randrange(width)]]
    stack[0].visited = True

    while len(stack) > 0:
        cell = stack.pop()
        options = [x for x in cell.neighbours if not x.visited]
        if options:
            stack.append(cell)
            new = options[randrange(len(options))]
            new.visited = True
            cell.add_connection(new)
            stack.append(new)
    return grid


def prims(width: int, height: int):  # Prim's algorithm
    grid = Grid(width, height)
    walls = []
    cell = grid.grid[randrange(height)][randrange(width)]
    cell.visited = True
    for neighbour in cell.neighbours:
        walls.append((cell, neighbour))

    while walls:
        wall = walls.pop(
            randrange(len(walls))
        )  # Choose and remove a random wall from the walls list
        if (
            len([x for x in wall if x.visited]) == 1
        ):  # If only one cell has been visited
            wall[0].add_connection(
                wall[1]
            )  # Connect the cells (remove the wall)
            if wall[0].visited:  # Choose the unvisited cell
                cell = wall[1]
            else:
                cell = wall[0]

            cell.visited = True  # Mark it as visited
            for (
                neighbour
            ) in cell.neighbours:  # Add walls of that cell to the wall list
                if neighbour not in cell.connections:
                    walls.append((cell, neighbour))
    return grid


def recursive_division(width: int, height: int):
    grid = Grid(width, height)
    for y, row in enumerate(grid.grid):
        for x, cell in enumerate(row):
            cell.add_connections(cell.neighbours)

    def is_horizontal(width: int, height: int) -> bool:
        if width == height:
            return bool(randint(0, 1))
        else:
            return width < height

    def divide(
        grid: Grid, x: int, y: int, width: int, height: int, horizontal: bool
    ):
        if width < 2 or height < 2:
            return

        wx = x if horizontal else x + randint(0, width - 2)
        wy = y + randint(0, height - 2) if horizontal else y

        px = wx + randint(0, width - 1) if horizontal else wx
        py = wy if horizontal else wy + randint(0, height - 1)

        dx = int(not horizontal)
        dy = int(horizontal)

        wall_len = width if horizontal else height

        for _ in range(wall_len):
            if wy != py or wx != px:
                grid.grid[wy][wx].remove_connection(grid.grid[wy + dy][wx + dx])
            wx += dy
            wy += dx

        nx = x
        ny = y
        w = width if horizontal else wx - x + 1
        h = wy - y + 1 if horizontal else height
        divide(grid, nx, ny, w, h, is_horizontal(w, h))

        nx = x if horizontal else wx + 1
        ny = wy + 1 if horizontal else y
        w = width if horizontal else x + width - wx - 1
        h = y + height - wy - 1 if horizontal else height
        divide(grid, nx, ny, w, h, is_horizontal(w, h))

    divide(grid, 0, 0, width, height, is_horizontal(width, height))

    return grid
