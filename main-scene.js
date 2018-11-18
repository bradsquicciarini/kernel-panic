window.Main_Scene = window.classes.Main_Scene =
class Main_Scene extends Scene_Component
  { constructor( context, control_box )
      { super(   context, control_box );
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,1,7 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { 
                         stage:   new simple_stage()
                       }
                           
        this.submit_shapes( context, shapes );

        this.materials =
          { 
            basic: context.get_instance( Phong_Shader ).material( Color.of( 1,1,1,1 ) )
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];
      }
    make_control_panel()
      { 
        // Add buttons to control panel
      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        var model_transform =  Mat4.identity();

        // Draw stage
        model_transform = model_transform.times(Mat4.translation([0,-1,0]))
        this.shapes.stage.draw(graphics_state, model_transform, this.materials.basic);
      }
  }

