 /*======================================Game Paramaters =======================================================*/
 const NUM_OF_PLAYERS = 2;
 const PLAYER_MASS = 0.1;
 const g = -9.8;
 const MAX_X_VELOCITY = 0.2; // m/s
/*==============================================================================================================*/


window.Main_Scene = window.classes.Main_Scene =
class Main_Scene extends Scene_Component
  { constructor( context, control_box )
      { super(   context, control_box );

         // This camera looks good
        context.globals.graphics_state.camera_transform = Mat4.translation([0,-1.5,0]).times(Mat4.look_at( Vec.of( 0,0,7 ), Vec.of( 0,-2,0 ), Vec.of( 0,1,0 ) ));

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

        // Create two players
        this.players = [new player(-2,1),
                        new player(2,1)];

      document.addEventListener( "keydown",   e => 
      {
        // Do nothing if the event was already processed
        if (event.defaultPrevented) return;

        if (e.key == 'a')
        {
            // Limit x velocity from keyboard input
            if(this.players[0].velocity.x < MAX_X_VELOCITY) 
                  return;

            this.players[0].Fx -= 20;
        }
        if (e.key == 'd')
        {
            // Limit x velocity from keyboard input
            if(this.players[0].velocity.x > MAX_X_VELOCITY) 
                  return;

            this.players[0].Fx += 20;
        }
        if (e.key == 's'){}
        if (e.key == 'w')
        {
          // Only allow a single jump
          if(!this.players[0].jumped)
          {
            this.players[0].Fy += 40;
            this.players[0].jumped = true;
          }
        }
        if (e.key == 'ArrowDown'){}
        if (e.key == 'ArrowLeft')
        {
            // Limit x velocity from keyboard input
            if(this.players[1].velocity.x < -MAX_X_VELOCITY) 
                  return;
            this.players[1].Fx -= 20;
        }
        if (e.key == 'ArrowRight')
        {
            // Limit x velocity from keyboard input
            if(this.players[1].velocity.x > MAX_X_VELOCITY) 
                  return;

            this.players[1].Fx += 20;
        }
        if (e.key == 'ArrowUp')
        {
          // Only allow a single jump
          if(!this.players[1].jumped)
          {
            this.players[1].Fy += 40;
            this.players[1].jumped = true;
          }
        }
        event.preventDefault();
      }, true);

      }
    make_control_panel()
      { 
        // Add buttons to control panel
        this.key_triggered_button( "Reset Game", [ "r" ], () => 
        {
             for(var i=0; i < NUM_OF_PLAYERS; i++)
             {
                  this.players[i].position.x = (i == 0) ? -2 : 2; 
                  this.players[i].position.y = 1
                  this.players[i].velocity.x = 0;
                  this.players[i].velocity.y = 0
             }
        });


      }
    display( graphics_state )
      { graphics_state.lights = this.lights;        // Use the lights stored in this.lights.
        const t = graphics_state.animation_time / 1000, dt = graphics_state.animation_delta_time / 1000;

        var model_transform =  Mat4.identity();

        // Draw stage
        model_transform = model_transform.times(Mat4.translation([0,-2,0]));
        this.shapes.stage.draw(graphics_state, model_transform, this.materials.white);
        model_transform = model_transform.times(Mat4.translation([0,2,0]));



        for(var i=0; i < NUM_OF_PLAYERS; i++)
        {
          // Begin Physics
            var ax =  this.players[i].Fx /PLAYER_MASS;
            var ay = g + this.players[i].Fy / PLAYER_MASS;

            // Create a buffer to calculate next state. Currently only for y, but will extend for x
            var dy_buffer = this.players[i].velocity.y + ay*dt;
            var y_buffer = this.players[i].position.y + dy_buffer*dt;
            var player_buffer = new player(this.players[i].position.x, y_buffer)

            // If there is no collision, update position
            if(!this.shapes.stage.check_for_collisions(player_buffer))
            {
              this.players[i].velocity.y = dy_buffer;
              this.players[i].position.y = y_buffer;
            }
            // Handle collision
            else
            {
              // Handle collision with stage
               this.players[i].velocity.y = 0;  // Velocity in y direction is now 0
               this.players[i].jumped = false;  // Reset jump flag
            }

            // Update kinematics in x directions
            this.players[i].velocity.x = this.players[i].velocity.x + ax*dt;
            this.players[i].position.x += this.players[i].velocity.x*dt;

            this.players[i].Fy = 0;
            this.players[i].Fx = 0;
          // End Physics

          

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

