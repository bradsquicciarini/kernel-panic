 /*======================================Game Paramaters =======================================================*/
 const NUM_OF_PLAYERS = 2;
 const PLAYER_MASS = 0.1;
 const g = -9.8;
/*==============================================================================================================*/



window.Main_Scene = window.classes.Main_Scene =
class Main_Scene extends Scene_Component
  { constructor( context, control_box )
      { super(   context, control_box );
        if( !context.globals.has_controls   ) 
          context.register_scene_component( new Movement_Controls( context, control_box.parentElement.insertCell() ) ); 

         // This camera looks good
        context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,2,7 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        //This camera is good for debugging collisions
        //context.globals.graphics_state.camera_transform = Mat4.look_at( Vec.of( 0,0,7 ), Vec.of( 0,0,0 ), Vec.of( 0,1,0 ) );

        const r = context.width/context.height;
        context.globals.graphics_state.projection_transform = Mat4.perspective( Math.PI/4, r, .1, 1000 );

        const shapes = { 
                         stage:  new simple_stage(),
                         test_box: new Cube()
                       }
                           
        this.submit_shapes( context, shapes );

        this.materials =
          { 
            white: context.get_instance( Phong_Shader ).material( Color.of( 1,1,1,1 ) ),
            pink: context.get_instance( Phong_Shader ).material( Color.of( 255/255, 175/255, 175/255, 1 ) )
          }

        this.lights = [ new Light( Vec.of( -5,5,5,1 ), Color.of( 0,1,1,1 ), 100000 ) ];

        // Enable physics. Useful for testing
        this.physics = false;

        // Create two players
        this.players = [new player(-2,1,PLAYER_MASS),
                        new player(2,1,PLAYER_MASS)];

      }
    make_control_panel()
      { 
        // Add buttons to control panel
        this.key_triggered_button( "Toggle Physics", [ "p" ], () => {this.physics ^= 1;});

      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        var model_transform =  Mat4.identity();

        // Draw stage
        this.shapes.stage.draw(graphics_state, model_transform, this.materials.white);

        for(var i=0; i < NUM_OF_PLAYERS; i++)
        {
          // Do physics
          if (this.physics)
          {
            var ax = 0;
            var ay = g;

            // If we collide with stage, don't update kinematics in y direction 
            if(!this.shapes.stage.check_for_collisions(this.players[i])) 
            {
              this.players[i].velocity.y += ay*dt;
              this.players[i].position.y += this.players[i].velocity.y*dt;
            }
    
            // Update kinematics in x directions
            this.players[i].velocity.x += ax*dt;
            this.players[i].position.x += this.players[i].velocity.x*dt;
          }

          // Draw player
          var update_player = Mat4.translation([this.players[i].position.x,this.players[i].position.y, 0]);
          var undo_update_player = Mat4.translation([-this.players[i].position.x, -this.players[i].position.y, 0]);
          var scale = 3/10; // I thought this was a good size for testing purposes
      
          model_transform = model_transform.times(update_player)                            // Move to player to translated position
                                           .times(Mat4.scale([scale,scale,scale]));         // Scale down
          this.shapes.test_box.draw(graphics_state, model_transform, this.materials.pink);
          model_transform = model_transform.times(Mat4.scale([1/scale,1/scale,1/scale]))    // Undo scale
                                           .times(undo_update_player);                      // Undo translation
        }
      }
  }

