#include <ultra64.h>
#include <defines.h>
#include <common_structs.h>
#include "kart_attributes.h"
#include "main.h"

extern Player *gPlayers;
extern struct Controller *gControllers;
extern u16 *D_800DC510;
extern s32 *gModeSelection;
extern s32 *gCCSelection;
extern s32 *gGlobalTimer;
extern s8 *gCharacterGridSelections[];
extern s8 *gCharacterSelections[];


extern s8 *gCupCourseSelection;
extern u8 *gCupSelectionByCourseId;
extern s16 *gCurrentCourseId;
extern s8 *gCupSelection;
extern s32 *gMenuSelection;
extern s16 D_80165560[]; // Character model to use 
extern s16 D_80165270[]; // Player positioning

extern void spawn_player();
extern void func_80039F44(f32 *arg0, f32 *arg1, f32 arg2);
//extern s16 D_80165560[];
//extern u16 D_800E3890[];
s16 netPlayerPositions[8] = {0, 1, 2, 3, 4, 5, 6, 7};
s16 netCharacterSelections[8] = {0, 1, 2, 3, 4, 5, 6, 7};

void *pointerTable[18] = {
    &gPlayers, &gControllers, &D_800DC510, &gModeSelection,
    &gCCSelection, &gGlobalTimer, &gCharacterGridSelections, &gCharacterSelections,
    &gCupCourseSelection, &gCupSelectionByCourseId, &gCurrentCourseId, &gCupSelection,
    &gMenuSelection, &D_80165270, &D_80165560, &netPlayerPositions, &netCharacterSelections
};

//void starting_lineup_override(f32 *arg0, f32 *arg1, f32 arg2) {
//    func_80039F44(ag0, arg1, ag2);
//}

/*
   D_8016556E = 0;
    if (D_800DC51C == 1) {
        spawn_player(gPlayerOneCopy, 0, arg0[D_80165270[0]], arg1[D_80165270[0]], arg2, 32768.0f, gCharacterSelections[0], PLAYER_HUMAN_AND_CPU);
        spawn_player(gPlayerTwo, 1, arg0[D_80165270[1]], arg1[D_80165270[1]], arg2, 32768.0f, D_80165560[0], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        spawn_player(gPlayerThree, 2, arg0[D_80165270[2]], arg1[D_80165270[2]], arg2, 32768.0f, D_80165560[1], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        spawn_player(gPlayerFour, 3, arg0[D_80165270[3]], arg1[D_80165270[3]], arg2, 32768.0f, D_80165560[2], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        spawn_player(gPlayerFive, 4, arg0[D_80165270[4]], arg1[D_80165270[4]], arg2, 32768.0f, D_80165560[3], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        spawn_player(gPlayerSix, 5, arg0[D_80165270[5]], arg1[D_80165270[5]], arg2, 32768.0f, D_80165560[4], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        spawn_player(gPlayerSeven, 6, arg0[D_80165270[6]], arg1[D_80165270[6]], arg2, 32768.0f, D_80165560[5], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        spawn_player(gPlayerEight, 7, arg0[D_80165270[7]], arg1[D_80165270[7]], arg2, 32768.0f, D_80165560[6], PLAYER_EXISTS | PLAYER_CPU | PLAYER_START_SEQUENCE);
        D_80164A28 = 0;
    } else {
        spawn_player(gPlayerOneCopy, 0, arg0[D_80165270[0]], arg1[D_80165270[0]] + 250.0f, arg2, 32768.0f, gCharacterSelections[0], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_HUMAN);
        spawn_player(gPlayerTwo, 1, arg0[D_80165270[1]], arg1[D_80165270[1]] + 250.0f, arg2, 32768.0f, D_80165560[0], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        spawn_player(gPlayerThree, 2, arg0[D_80165270[3]], arg1[D_80165270[2]] + 250.0f, arg2, 32768.0f, D_80165560[1], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        spawn_player(gPlayerFour, 3, arg0[D_80165270[2]], arg1[D_80165270[3]] + 250.0f, arg2, 32768.0f, D_80165560[2], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        spawn_player(gPlayerFive, 4, arg0[D_80165270[5]], arg1[D_80165270[4]] + 250.0f, arg2, 32768.0f, D_80165560[3], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        spawn_player(gPlayerSix, 5, arg0[D_80165270[4]], arg1[D_80165270[5]] + 250.0f, arg2, 32768.0f, D_80165560[4], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        spawn_player(gPlayerSeven, 6, arg0[D_80165270[7]], arg1[D_80165270[6]] + 250.0f, arg2, 32768.0f, D_80165560[5], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        spawn_player(gPlayerEight, 7, arg0[D_80165270[6]], arg1[D_80165270[7]] + 250.0f, arg2, 32768.0f, D_80165560[6], PLAYER_EXISTS | PLAYER_STAGING | PLAYER_START_SEQUENCE | PLAYER_CPU);
        D_80164A28 = 1;
    }
    func_80039AE4();
*/
