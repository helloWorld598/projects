#include "stdio.h"
#include "stdlib.h"
#include <SDL2/SDL.h>
#include "SDL2/SDL2_gfxPrimitives.h"
#include "time.h"
#include "formulas.h"
#include "wall.h"
#include "robot.h"

int done = 0;

int main(int argc, char *argv[]) {
    SDL_Window *window;
    SDL_Renderer *renderer;

    if(SDL_Init(SDL_INIT_VIDEO) < 0){
        return 1;
    }

    window = SDL_CreateWindow("Robot Maze", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, OVERALL_WINDOW_WIDTH, OVERALL_WINDOW_HEIGHT, SDL_WINDOW_OPENGL);
    window = SDL_CreateWindow("Robot Maze", SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED, OVERALL_WINDOW_WIDTH, OVERALL_WINDOW_HEIGHT, SDL_WINDOW_OPENGL);
    renderer = SDL_CreateRenderer(window, -1, 0);

    struct Robot robot;
    struct Wall_collection *head = NULL;
    int front_centre_sensor, left_sensor, right_sensor=0;
    clock_t start_time, end_time;
    int msec;
    int crashed = 0;

    // SETUP MAZE
    // Below are a several mazes. To use one maze comment uncomment out the code below
    // below the heading "Maze <num>" and make sure all other mazes have been commented.
    // Next, edit the code in robot.c to initialise the correct starting positions for
    // the maze that was just uncommented.
    
    /* Maze 1
    insertAndSetFirstWall(&head, 1,  OVERALL_WINDOW_WIDTH/2, OVERALL_WINDOW_HEIGHT/2, 10, OVERALL_WINDOW_HEIGHT/2);
    insertAndSetFirstWall(&head, 2,  OVERALL_WINDOW_WIDTH/2-100, OVERALL_WINDOW_HEIGHT/2+100, 10, OVERALL_WINDOW_HEIGHT/2-100);
    insertAndSetFirstWall(&head, 3,  OVERALL_WINDOW_WIDTH/2-250, OVERALL_WINDOW_HEIGHT/2+100, 150, 10);
    insertAndSetFirstWall(&head, 4,  OVERALL_WINDOW_WIDTH/2-150, OVERALL_WINDOW_HEIGHT/2, 150, 10);
    insertAndSetFirstWall(&head, 5,  OVERALL_WINDOW_WIDTH/2-250, OVERALL_WINDOW_HEIGHT/2-200, 10, 300);
    insertAndSetFirstWall(&head, 6,  OVERALL_WINDOW_WIDTH/2-150, OVERALL_WINDOW_HEIGHT/2-100, 10, 100);
    insertAndSetFirstWall(&head, 7,  OVERALL_WINDOW_WIDTH/2-250, OVERALL_WINDOW_HEIGHT/2-200, 450, 10);
    insertAndSetFirstWall(&head, 8,  OVERALL_WINDOW_WIDTH/2-150, OVERALL_WINDOW_HEIGHT/2-100, 250, 10);
    insertAndSetFirstWall(&head, 9,  OVERALL_WINDOW_WIDTH/2+200, OVERALL_WINDOW_HEIGHT/2-200, 10, 300);
    insertAndSetFirstWall(&head, 10,  OVERALL_WINDOW_WIDTH/2+100, OVERALL_WINDOW_HEIGHT/2-100, 10, 300);
    insertAndSetFirstWall(&head, 11,  OVERALL_WINDOW_WIDTH/2+100, OVERALL_WINDOW_HEIGHT/2+200, OVERALL_WINDOW_WIDTH/2-100, 10);
    insertAndSetFirstWall(&head, 12,  OVERALL_WINDOW_WIDTH/2+200, OVERALL_WINDOW_HEIGHT/2+100, OVERALL_WINDOW_WIDTH/2-100, 10);
    */

    /* For Maze 2
    insertAndSetFirstWall(&head, 1,  OVERALL_WINDOW_WIDTH/2, OVERALL_WINDOW_HEIGHT/2+120, 10, OVERALL_WINDOW_HEIGHT/4);
    insertAndSetFirstWall(&head, 2,  OVERALL_WINDOW_WIDTH/2-100, OVERALL_WINDOW_HEIGHT/2+120, 10, OVERALL_WINDOW_HEIGHT/4);
    for (float i = 0; i<8; i+=0.1){
        insertAndSetFirstWall(&head, i,  OVERALL_WINDOW_WIDTH/2+5*i*cos(i*PI/180), OVERALL_WINDOW_HEIGHT/2+120-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  OVERALL_WINDOW_WIDTH/2-100+5*i*cos(i*PI/180), OVERALL_WINDOW_HEIGHT/2+120-50*i*sin(i*PI/180), 10, 10);
    }
    float y = OVERALL_WINDOW_HEIGHT/2+120-50*7.9*sin(7.9*PI/180);
    float x = OVERALL_WINDOW_WIDTH/2+5*7.9*cos(7.9*PI/180);
    for (float i = 0; i<8; i+=0.1){
        insertAndSetFirstWall(&head, i,  x-5*i*cos(i*PI/180), y-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  x-5*i*cos(i*PI/180)-100, y-50*i*sin(i*PI/180), 10, 10);
    }
    float y2 = y-50*7.9*sin(7.9*PI/180);
    float x2 = x-5*7.9*cos(7.9*PI/180);
    for (float i = 0; i<8; i+=0.1){
        insertAndSetFirstWall(&head, i,  x2+5*i*cos(i*PI/180), y2-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  x2+5*i*cos(i*PI/180)-100, y2-50*i*sin(i*PI/180), 10, 10);
    }
    float y3 = y2-50*7.9*sin(7.9*PI/180);
    float x3 = x2+5*7.9*cos(7.9*PI/180);
    for (float i = 0; i < 8; i+=.1){
        insertAndSetFirstWall(&head, i,  x3-5*i*cos(i*PI/180), y3-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  x3-5*i*cos(i*PI/180)-100, y3-50*i*sin(i*PI/180), 10, 10);
    }
    float y4 = y3-50*7.9*sin(7.9*PI/180);
    float x4 = x3-5*7.9*cos(7.9*PI/180);
    for (float i = 0; i<8; i+=0.1){
        insertAndSetFirstWall(&head, i,  x4+5*i*cos(i*PI/180), y4-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  x4+5*i*cos(i*PI/180)-100, y4-50*i*sin(i*PI/180), 10, 10);
    }
    float y5 = y4-50*7.9*sin(7.9*PI/180);
    float x5 = x4+5*7.9*cos(7.9*PI/180);
    for (float i = 0; i < 8; i+=.1){
        insertAndSetFirstWall(&head, i,  x5-5*i*cos(i*PI/180), y5-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  x5-5*i*cos(i*PI/180)-100, y5-50*i*sin(i*PI/180), 10, 10);
    }
    float y6 = y5-50*7.9*sin(7.9*PI/180);
    float x6 = x5-5*7.9*cos(7.9*PI/180);
    for (float i = 0; i<6; i+=0.1){
        insertAndSetFirstWall(&head, i,  x6+5*i*cos(i*PI/180), y6-50*i*sin(i*PI/180), 10, 10);
        insertAndSetFirstWall(&head, i,  x6+5*i*cos(i*PI/180)-100, y6-50*i*sin(i*PI/180), 10, 10);
    }
    */

    /* For Maze 3
    insertAndSetFirstWall(&head, 1, 15, 25, 10, 430);
    insertAndSetFirstWall(&head, 1, 75, 145, 10, 60);
    insertAndSetFirstWall(&head, 1, 75, 325, 10, 120);
    insertAndSetFirstWall(&head, 1, 135, 85, 10, 60);
    insertAndSetFirstWall(&head, 1, 135, 325, 10, 60);
    insertAndSetFirstWall(&head, 1, 195, 145, 10, 300);
    insertAndSetFirstWall(&head, 1, 255, 145, 10, 120);
    insertAndSetFirstWall(&head, 1, 315, 25, 10, 60);
    insertAndSetFirstWall(&head, 1, 315, 265, 10, 130);
    insertAndSetFirstWall(&head, 1, 375, 85, 10, 70);
    insertAndSetFirstWall(&head, 1, 375, 265, 10, 120);
    insertAndSetFirstWall(&head, 1, 435, 85, 10, 60);
    insertAndSetFirstWall(&head, 1, 435, 325, 10, 130);
    insertAndSetFirstWall(&head, 1, 495, 145, 10, 180);
    insertAndSetFirstWall(&head, 1, 555, 25, 10, 130);
    insertAndSetFirstWall(&head, 1, 555, 205, 10, 190);
    insertAndSetFirstWall(&head, 1, 615, 25, 10, 430);
    insertAndSetFirstWall(&head, 1, 15, 25, 540, 10);
    insertAndSetFirstWall(&head, 1, 75, 85, 190, 10);
    insertAndSetFirstWall(&head, 1, 435, 85, 60, 10);
    insertAndSetFirstWall(&head, 1, 315, 145, 60, 10);
    insertAndSetFirstWall(&head, 1, 495, 145, 60, 10);
    insertAndSetFirstWall(&head, 1, 75, 205, 60, 10);
    insertAndSetFirstWall(&head, 1, 315, 205, 180, 10);
    insertAndSetFirstWall(&head, 1, 15, 265, 120, 10);
    insertAndSetFirstWall(&head, 1, 255, 265, 60, 10);
    insertAndSetFirstWall(&head, 1, 375, 265, 60, 10);
    insertAndSetFirstWall(&head, 1, 195, 325, 60, 10);
    insertAndSetFirstWall(&head, 1, 255, 385, 60, 10);
    insertAndSetFirstWall(&head, 1, 495, 385, 60, 10);
    insertAndSetFirstWall(&head, 1, 75, 445, 540, 10);
    */

    /* For maze 4 */
    for (int i = 0; i < 120; i++) {
        insertAndSetFirstWall(&head,0, 10 + 2 * i, 350 + i, 10, 10);
    }
    for (int i = 0; i < 96; i++) {
        insertAndSetFirstWall(&head,0, 100 + 2 * i, 300 + i, 10, 10);
    }
    for (int i = 0; i < 38; i++) {
        insertAndSetFirstWall(&head,0, 250 + i, 470 - 2 * i, 10, 10);
    }
    insertAndSetFirstWall(&head, 0, 10, 100, 10, 250);
    insertAndSetFirstWall(&head, 0, 100, 180, 10, 120);
    for (float i = 0.1; i < 3; i += 0.01){
        insertAndSetFirstWall(&head, 0, 129 + 120 * cos(i), 116 - 110 * sin(i), 10, 10);
        insertAndSetFirstWall(&head, 0, 130 + 30 * cos(i), 185 - 50 * sin(i), 10, 10);
    }
    insertAndSetFirstWall(&head, 0, 159, 180, 10, 120);
    insertAndSetFirstWall(&head, 0, 248, 110, 10, 20);
    insertAndSetFirstWall(&head, 0, 159, 300, 241, 10);
    insertAndSetFirstWall(&head, 0, 248, 130, 110, 10);
    insertAndSetFirstWall(&head, 0, 248, 225, 100, 10);
    insertAndSetFirstWall(&head, 0, 248, 205, 100, 10);
    insertAndSetFirstWall(&head, 0, 248, 205, 10, 30);
    insertAndSetFirstWall(&head, 0, 348, 205, 10, 30);
    insertAndSetFirstWall(&head, 0, 348, 5, 10, 125);
    insertAndSetFirstWall(&head, 0, 400, 70, 10, 240);
    insertAndSetFirstWall(&head, 0, 348, 5, 200, 10);
    insertAndSetFirstWall(&head, 0, 400, 70, 80, 10);
    insertAndSetFirstWall(&head, 0, 548, 5, 10, 125);
    insertAndSetFirstWall(&head, 0, 479, 70, 10, 60);
    insertAndSetFirstWall(&head, 0, 548, 130, 70, 10);
    insertAndSetFirstWall(&head, 0, 409, 130, 80, 10);
    insertAndSetFirstWall(&head, 0, 618, 130, 10, 260);
    insertAndSetFirstWall(&head, 0, 409, 130, 10, 260);
    insertAndSetFirstWall(&head, 0, 409, 380, 70, 10);
    insertAndSetFirstWall(&head, 0, 548, 380, 80, 10);
    insertAndSetFirstWall(&head, 0, 548, 205, 10, 110);
    insertAndSetFirstWall(&head, 0, 479, 205, 10, 110);
    insertAndSetFirstWall(&head, 0, 479, 205, 69, 10);
    insertAndSetFirstWall(&head, 0, 479, 315, 79, 10);
    insertAndSetFirstWall(&head, 0, 479, 380, 10, 70);
    insertAndSetFirstWall(&head, 0, 548, 380, 10, 70);
    insertAndSetFirstWall(&head, 0, 479, 450, 79, 10);

    setup_robot(&robot);
    updateAllWalls(head, renderer);

    SDL_Event event;
    while(!done){
        SDL_SetRenderDrawColor(renderer, 200, 200, 200, 255);
        SDL_RenderClear(renderer);

        //Move robot based on user input commands/auto commands
        if (robot.auto_mode == 1)
            robotAutoMotorMove(&robot, front_centre_sensor, left_sensor, right_sensor);
        robotMotorMove(&robot, crashed);

        //Check if robot reaches endpoint. and check sensor values
        if (checkRobotReachedEnd(&robot, OVERALL_WINDOW_WIDTH, OVERALL_WINDOW_HEIGHT/2+100, 10, 100)){
            end_time = clock();
            msec = (end_time-start_time) * 1000 / CLOCKS_PER_SEC;
            robotSuccess(&robot, msec);
        }
        else if(crashed == 1 || checkRobotHitWalls(&robot, head)){
            robotCrash(&robot);
            crashed = 1;
        }
        //Otherwise compute sensor information
        else {
            front_centre_sensor = checkRobotSensorFrontCentreAllWalls(&robot, head);
            if (front_centre_sensor>0)
                printf("Getting close on the centre. Score = %d\n", front_centre_sensor);

            left_sensor = checkRobotSensorLeftAllWalls(&robot, head);
            if (left_sensor>0)
                printf("Getting close on the left. Score = %d\n", left_sensor);

            right_sensor = checkRobotSensorRightAllWalls(&robot, head);
            if (right_sensor>0)
                printf("Getting close on the right. Score = %d\n", right_sensor);
        }
        robotUpdate(renderer, &robot);
        updateAllWalls(head, renderer);

        // Check for user input
        SDL_RenderPresent(renderer);
        while(SDL_PollEvent(&event)){
            if(event.type == SDL_QUIT){
                done = 1;
            }
            const Uint8 *state = SDL_GetKeyboardState(NULL);
            if(state[SDL_SCANCODE_UP] && robot.direction != DOWN){
                robot.direction = UP;
            }
            if(state[SDL_SCANCODE_DOWN] && robot.direction != UP){
                robot.direction = DOWN;
            }
            if(state[SDL_SCANCODE_LEFT] && robot.direction != RIGHT){
                robot.direction = LEFT;
            }
            if(state[SDL_SCANCODE_RIGHT] && robot.direction != LEFT){
                robot.direction = RIGHT;
            }
            if(state[SDL_SCANCODE_SPACE]){
                setup_robot(&robot);
            }
            if(state[SDL_SCANCODE_RETURN]){
                robot.auto_mode = 1;
                start_time = clock();
            }
        }

        SDL_Delay(120);
    }
    SDL_DestroyRenderer(renderer);
    SDL_DestroyWindow(window);
    printf("DEAD\n");
}