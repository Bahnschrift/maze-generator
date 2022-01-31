bl_info = {
    "name": "Maze Generator",
    "blender": (2, 90, 0),
    "category": "Add Mesh",
}


import bpy
import bpy.utils.previews
import os
from .create_maze import CreateMaze


def register():
    global icons
    icons = bpy.utils.previews.new()
    icons_dir = os.path.join(os.path.dirname(__file__), "icons")
    icons.load("maze_icon", os.path.join(icons_dir, "icon.png"), "IMAGE")

    bpy.utils.register_class(CreateMaze)
    bpy.types.VIEW3D_MT_mesh_add.prepend(button_add_maze)


def unregister():
    global icons
    bpy.utils.previews.remove(icons)
    bpy.utils.unregister_class(CreateMaze)
    bpy.types.VIEW3D_MT_add.remove(button_add_maze)


def button_add_maze(self, context):
    global icons
    self.layout.operator("mesh.maze", icon_value=icons["maze_icon"].icon_id)
