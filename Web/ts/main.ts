import { aldousBroder, backtracker, binaryTree, growingTree, huntAndKill, prims, recursiveDivision, sidewinder } from "./maze.js";
import { drawMaze, drawSolution } from "./draw.js";
import { Grid } from "./grid";


const mazeForm = <HTMLFormElement> document.getElementById("mazesettings");
const solutionButton = <HTMLButtonElement> document.getElementById("togglesol");
const generators = new Map<string, (width: number, height: number) => Grid>()
    .set("aldousbroder", aldousBroder)
    .set("backtracker", backtracker)
    .set("binarytree", binaryTree)
    .set("huntandkill", huntAndKill)
    .set("prims", prims)
    .set("recursivedivision", recursiveDivision)
    .set("sidewinder", sidewinder);
let solutionEnabled = false;

let grid: Grid;
let settings: {
    sizeX: number,
    sizeY: number,
    generator: string,
    scale: number,
    wallColour: string,
    blankColour: string,
    solutionColour: string,
    rainbowSol: boolean,
    freqNewest: number,
    freqOldest: number,
    freqRandom: number
}


function getSettings() {
    const formData = new FormData(mazeForm);
    return {
        sizeX: parseInt(formData.get("sizex")!.toString()),
        sizeY: parseInt(formData.get("sizey")!.toString()),
        generator: formData.get("generator")!.toString(),
        scale: parseInt(formData.get("scale")!.toString()),
        wallColour: formData.get("wallcolour")!.toString(),
        blankColour: formData.get("blankcolour")!.toString(),
        solutionColour: formData.get("solutioncolour")!.toString(),
        rainbowSol: formData.get("rainbowsol")! !== null,
        freqNewest: parseInt(formData.get("freqnewest")!.toString()),
        freqOldest: parseInt(formData.get("freqoldest")!.toString()),
        freqRandom: parseInt(formData.get("freqrandom")!.toString())
    }
}


mazeForm.addEventListener("submit", (e) => {
    e.preventDefault();
    settings = getSettings();

    if (settings.generator == "growingtree")
        grid = growingTree(settings.sizeX, settings.sizeY, settings.freqNewest, settings.freqOldest, settings.freqRandom);
    else
        grid = generators.get(settings.generator)!(settings.sizeX, settings.sizeY);
        
    drawMaze(grid, settings.scale, settings.wallColour, settings.blankColour);
    solutionEnabled = false;
    solutionButton.hidden = false;
});


solutionButton.addEventListener("click", () => {
    console.log("me")
    solutionEnabled = !solutionEnabled;

    if (solutionEnabled) {
        const formData = new FormData(mazeForm);
        settings.solutionColour = formData.get("solutioncolour")!.toString();
        settings.rainbowSol = formData.get("rainbowsol")! !== null;
        drawSolution(grid, settings.scale, settings.solutionColour, settings.rainbowSol);
    } else {
        drawSolution(grid, settings.scale, settings.blankColour, false);
    }
});


for (let rad of mazeForm.generator) {
    rad.addEventListener("change", () => {
        if (rad.id == "growingtree")
            document.getElementById("growingtreeoptions")!.hidden = false;
        else
            document.getElementById("growingtreeoptions")!.hidden = true;
    });
}
