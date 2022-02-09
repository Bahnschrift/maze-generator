import { Grid } from "./grid";
import { Cell } from "./cell";


const canvas = <HTMLCanvasElement>document.getElementById("outcanvas");
const img = <HTMLImageElement>document.getElementById("outimage");


export function drawMaze(grid: Grid, scale: number, wallHex: string, blankHex: string) {
    canvas.height = (2 * grid.height + 1) * scale;
    canvas.width = (2 * grid.width + 1) * scale;
    img.height = (2 * grid.height + 1) * scale;
    img.width = (2 * grid.width + 1) * scale;

    let ctx = canvas.getContext("2d")!;

    ctx.fillStyle = blankHex;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = wallHex;

    grid.genWalls();

    for (let x = scale * 2; x < (2 * grid.width + 1) * scale; x += scale) {
        ctx.fillRect(x, 0, scale, scale);
    }

    for (let y = 0; y < (2 * grid.height + 1) * scale; y += scale) {
        ctx.fillRect(0, y, scale, scale);
    }

    for (let gy = 0; gy < grid.height; gy++) {
        for (let gx = 0; gx < grid.width; gx++) {
            let cell = grid.grid[gy][gx];

            let x = (2 * gx + 1) * scale;
            let y = (2 * gy + 1) * scale;

            if (cell.walls.right) {
                ctx.fillRect(x + scale, y, scale, scale);
            }
            if (cell.walls.bottom && !(gx == grid.width - 1 && gy == grid.height - 1)) {
                ctx.fillRect(x, y + scale, scale, scale);
            }
            ctx.fillRect(x + scale, y + scale, scale, scale);
        }
    }

    img.src = canvas.toDataURL();
    document.getElementById("outsection")!.hidden = false;
}


export function drawSolution(grid: Grid, scale: number, solutionColour: string, rainbowSolution: boolean) {
    if (grid.solution.length == 0) {
        grid.genSolution();
    }

    let ctx = canvas.getContext("2d")!;

    let h = 0;
    let s = "100%";
    let v = "50%";
    let inc = 360 / grid.solution.length;

    ctx.fillStyle = rainbowSolution ? `hsl(${h}, ${s}, ${v})` : solutionColour;

    function incHue() {
        h += inc;
        h %= 360.0;
        ctx.fillStyle = `hsl(${h}, ${s}, ${v})`;
    }

    ctx.fillRect((grid.width * 2 - 1) * scale, grid.height * 2 * scale, scale, scale);
    for (let i = 0; i < grid.solution.length - 1; i++) {
        if (rainbowSolution)
            incHue();
        
        let cell = grid.solution[i];
        let next = grid.solution[i + 1];
        ctx.fillRect((cell.x * 2 + 1) * scale, (cell.y * 2 + 1) * scale, scale, scale);


        if (cell.x == next.x) {
            ctx.fillRect((cell.x * 2 + 1) * scale, (cell.y + next.y + 1) * scale, scale, scale);
        } else if (cell.y == next.y) {
            ctx.fillRect((cell.x + next.x + 1) * scale, (cell.y * 2 + 1) * scale, scale, scale);
        }
    }

    if (rainbowSolution)
        incHue();

    ctx.fillRect(scale, 0, scale, scale * 2);
    img.src = canvas.toDataURL();
}
