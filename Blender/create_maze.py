import bpy
import bmesh
from . import maze
from .grid import Grid


class CreateMaze(bpy.types.Operator):
    bl_idname = "mesh.maze"
    bl_label = "Maze"
    bl_options = {"REGISTER", "UNDO"}

    generator: bpy.props.EnumProperty(
        name="Algorithm",
        default="backtracker",
        description="Maze Generation Algorithm",
        items=[
            # Identifier, name, description, [icon], number
            ("backtracker", "Backtracker", "", 0),
            ("prims", "Prims", "", 1),
            ("recursive_division", "Recursive Division", "", 2),
        ],
    )
    cell_x: bpy.props.IntProperty(
        name="Cell count X", default=10, min=1, max=250
    )
    cell_y: bpy.props.IntProperty(name="Y", default=10, min=1, max=250)
    width_wall: bpy.props.FloatProperty(
        name="Width Wall", subtype="DISTANCE", default=0.5, min=0, max=20
    )
    width_cell: bpy.props.FloatProperty(
        name="Cell", subtype="DISTANCE", default=1, min=0, max=20
    )
    height_vert: bpy.props.FloatProperty(
        name="Vertical Height", subtype="DISTANCE", default=1
    )
    scale: bpy.props.FloatProperty(name="Scale", default=1, min=0)
    pos_x: bpy.props.FloatProperty(
        name="Location X", subtype="DISTANCE", default=0
    )
    pos_y: bpy.props.FloatProperty(name="Y", subtype="DISTANCE", default=0)
    pos_z: bpy.props.FloatProperty(name="Z", subtype="DISTANCE", default=0)
    do_update: bpy.props.BoolProperty(name="Update Automatically", default=1)

    def execute(self, context):
        if self.do_update:
            self.make_maze(context)
        return {"FINISHED"}

    def make_maze(self, context):
        generator = {
            "backtracker": maze.iterative_backtracker,
            "prims": maze.prims,
            "recursive_division": maze.recursive_division,
        }[self.generator]

        mesh = bpy.data.meshes.new("maze")  # Add a new mesh
        obj = bpy.data.objects.new(
            mesh.name, mesh
        )  # Add new object using the mesh

        collection = context.collection
        collection.objects.link(obj)
        context.view_layer.objects.active = obj

        obj.location.x += self.pos_x
        obj.location.y += self.pos_y
        obj.location.z += self.pos_z

        verts = []
        faces = []

        m: Grid = generator(self.cell_x, self.cell_y)

        bm = bmesh.new()

        # Vertices
        y_pos = 0
        cell_row = False
        for y in range(2 * (self.cell_y + 1)):
            x_pos = 0
            cell_col = False
            for x in range(2 * (self.cell_x + 1)):
                verts.append(
                    bm.verts.new((x_pos * self.scale, y_pos * self.scale, 0))
                )
                x_pos += self.width_cell if cell_col else self.width_wall
                cell_col = not cell_col
            y_pos += self.width_cell if cell_row else self.width_wall
            cell_row = not cell_row

        # Faces
        def draw_face(x: int, y: int):
            f = (
                verts[y * (2 * (self.cell_x + 1)) + x],
                verts[y * (2 * (self.cell_x + 1)) + x + 1],
                verts[(y + 1) * (2 * (self.cell_x + 1)) + x + 1],
                verts[(y + 1) * (2 * (self.cell_x + 1)) + x],
            )
            faces.append(bm.faces.new(f))

        # Top row
        for x in range(self.cell_x * 2 + 1):
            draw_face(x, 0)

        # Interior
        cell_row = True
        for y in range(1, self.cell_y * 2):
            draw_face(0, y)
            cell_col = True
            for x in range(1, self.cell_x * 2):
                wall = False
                if cell_row and cell_col:
                    pass
                elif cell_row:
                    if (
                        m.grid[y // 2][(x - 1) // 2]
                        not in m.grid[y // 2][(x + 1) // 2].connections
                    ):
                        wall = True
                elif cell_col:
                    if (
                        m.grid[(y - 1) // 2][x // 2]
                        not in m.grid[(y + 1) // 2][x // 2].connections
                    ):
                        wall = True
                else:
                    wall = True
                if wall:
                    draw_face(x, y)
                cell_col = not cell_col
            draw_face(self.cell_x * 2, y)
            cell_row = not cell_row

        # Bottom row
        for x in range(self.cell_x * 2 + 1):
            draw_face(x, self.cell_y * 2)

        bm.to_mesh(mesh)
        bm.free()

        # 3D-ify
        bpy.ops.object.mode_set(mode="EDIT")
        bpy.ops.mesh.select_mode(type="FACE")
        bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.extrude_region_move(
            TRANSFORM_OT_translate={"value": (0, 0, self.height_vert)}
        )
        bpy.ops.object.mode_set(mode="OBJECT")