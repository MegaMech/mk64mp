import { ICore, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';

var STOCK_GAME: boolean = false;


export class MK64Core implements ICore {
    header: string | string[] = "NKT";
    ModLoader!: IModLoaderAPI;
    //rom_header: IRomHeader = {
        //    name: "MARIOKART64",
        //    country_code: "E",
        //    revision: 0,
        //    id: "NKT"
        //};
    heap_start: number = -1; // 0x81000000
    heap_size: number = -1; // 0x2E00000;
    
    
    preinit(): void {
    }
    init(): void {}
    postinit(): void { }
    onTick(frame?: number): void { }
}

// Note: All of these are addresses. Not values!

export interface Defines {
    pointerTable;
    playerStructSize;
    gPlayer1;
    gPlayer2;
    gPlayer3;
    gPlayer4;
    gPlayer5;
    gPlayer6;
    gPlayer7;
    gPlayer8;

    controllerStructSize;
    gController1;
    gController2;
    gController3;
    gController4;

    D_800DC510;
    gModeSelection;
    gCCSelection;
    gGlobalTimer;
    gCharacterGridSelections;
    gMainMenuSelectionDepth;

    D_8018EDF3;
    D_800E86B0;
    gScreenModeSelection;
    gPlayerCountSelection1;

    gCharacterSelections;
    gCupCourseSelection;
    gCupSelectionByCourseId;
    gCurrentCourseId;
    gCupSelection;
    gMenuSelection;
    playerPositions;
    characterModel;
    netPlayerPositions;
    netCharacterSelections;
    gGamestate;


}

export enum types {
    s8 = 0,
    s16 = 1,
    s32 = 2,
    s64 = 3,
}

/**
 * If number is null, assume is struct.
 **/
export type pointer = {
    p: number; // address
    s?: types; // size
}

//let pointerTable:pointer = {p: 0x0, s: types.s32}; 

export class SymbolTable implements Defines {
    pointerTable: pointer;
    playerStructSize: number;
    gPlayer1: pointer;
    gPlayer2: pointer;
    gPlayer3: pointer;
    gPlayer4: pointer;
    gPlayer5: pointer;
    gPlayer6: pointer;
    gPlayer7: pointer;
    gPlayer8: pointer;

    controllerStructSize: number;
    gController1: pointer;
    gController2: pointer;
    gController3: pointer;
    gController4: pointer;
    gController5: pointer;
    gController6: pointer;
    gController7: pointer;
    gController8: pointer;

    D_800DC510: pointer;
    gModeSelection: pointer;
    gCCSelection: pointer;
    gGlobalTimer: pointer;
    gCharacterGridSelections: pointer;
    gMainMenuSelectionDepth: pointer;

    D_8018EDF3: pointer;
    D_800E86B0: pointer;
    gScreenModeSelection: pointer;
    gPlayerCountSelection1: pointer;

    gCharacterSelections: pointer;
    gCupCourseSelection: pointer;
    gCupSelectionByCourseId: pointer;
    gCurrentCourseId: pointer;
    gCupSelection: pointer;
    gMenuSelection: pointer;
    playerPositions: pointer;
    characterModel: pointer;
    netPlayerPositions: pointer;
    netCharacterSelections: pointer;
    gGamestate: pointer;

    constructor() {
        this.pointerTable = {p: 0x80700020, s: types.s32};
        //this.pointerTable.s = types.s32;
        this.playerStructSize = 0xDD8;
        this.controllerStructSize = 0x10;
        this.gModeSelection = {p: 0x800DC53C, s: types.s32};
        this.gCCSelection = {p: 0x800DC548, s: types.s32};
        this.gGlobalTimer = {p: 0x800DC54C, s: types.s32};
        this.D_800DC510 = {p: 0x800DC510, s: types.s32};
        this.gCharacterGridSelections = {p: 0x8018EDE4, s: types.s8};
        this.gMainMenuSelectionDepth = {p: 0x8018EDED, s: types.s8};
        this.gScreenModeSelection = {p: 0x800DC530, s: types.s32};
        this.gPlayerCountSelection1 = {p: 0x800DC538, s: types.s32};
        this.D_8018EDF3 = {p: 0x8018EDF3, s: types.s8};
        this.D_800E86B0 = {p: 0x800E86B0, s: types.s8};
        this.gCharacterSelections = {p: 0x800E86A8, s: types.s32};
        this.gCupCourseSelection = {p: 0x8018EE0B, s: types.s8};
        this.gCupSelectionByCourseId = {p: 0x800E7664, s: types.s8}; // unsigned
        this.gCurrentCourseId = {p: 0x800DC5A0, s: types.s16};
        this.gCupSelection = {p: 0x8018EE09, s: types.s8};
        this.gMenuSelection = {p: 0x800E86A0, s: types.s32};
        this.playerPositions = {p: 0x80165270, s: types.s16};
        this.characterModel = {p: 0x80165560, s: types.s16};
        this.netPlayerPositions = {p: 0x00000000, s: types.s16};
        this.netCharacterSelections = {p: 0x00000000, s: types.s16};
        this.gPlayer1 = {p: 0x800F6990};
        this.gPlayer2 = {p: 0x800F7768};
        this.gPlayer3 = {p: 0x800F8540};
        this.gPlayer4 = {p: 0x800F9318};
        this.gPlayer5 = {p: 0x800FA0F0};
        this.gPlayer6 = {p: 0x800FAEC8};
        this.gPlayer7 = {p: 0x800FBCA0};
        this.gPlayer8 = {p: 0x800FCA78};
        this.gController1 = {p: 0x800F6910};
        this.gController2 = {p: 0x800F6920};
        this.gController3 = {p: 0x800F6930};
        this.gController4 = {p: 0x800F6940};
        this.gController5 = {p: 0x800F6950};
        this.gController6 = {p: 0x800F6960};
        this.gController7 = {p: 0x800F6970};
        this.gController8 = {p: 0x800F6980};
        this.gGamestate = {p: 0x800DC50C, s: types.s32};
    }
}

export enum mk64Events {
    ON_PLAYER_UPDATE = "onPlayerUpdate",
    ON_CPU_UPDATE    = "onCpuUpdate",
    ON_PLAYER_RECORD = "onPlayerRecord",
    ON_LOBBY_FULL = "onLobbyFull",
    ON_SELECTED_CHARACTER = "onSelectedCharacter",
    ON_RANDOMIZED_PROPERTIES = "onRandomizedProperties",
}

export default interface PlayerData {
    index: number;
    characterTableIndex: number;
}

export class mk64Player {
    posX: number = 0;
    posY: number = 0;
    posZ: number = 0;
    rotX: number = 0;
    rotY: number = 0;
    rotZ: number = 0;
    turn: number = 0;
}

/**
 * Technically, this should just be mk64Player.
 * However, I needed to add an index and a new packet.
 **/
 export class mk64Cpu extends mk64Player {
    index: number = 0;
}

enum pointerNames {
    players = 0,
    controllers = 1,
}

export class helperFuncs {
    
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    //private pointerTable;
    public coords;
    private table_end = 0xFFFFFFFF;
    public begin: boolean = false;
    public syms: SymbolTable = new SymbolTable();

    public isStockGame() {
        return STOCK_GAME;
    }

    /**
     * @param index player index.
     **/
    public GetPlayerPointer(index: any): pointer {
        return this.syms[`gPlayer${index+1}`];
    }

    public initPointerTable() {
        //if (!this.syms) { return; }
        let ptrAddr = this.syms.pointerTable.p; // 0x80700020;
        let pointerTable: Array<number> = [];
        let i = 0;
        let value: number;
        //this.ModLoader.logger.info(this.ModLoader.emulator.rdramRead32(0x800DC4DC).toString(16));
        do {
        //this.ModLoader.logger.info("PTRADDR");
        value = this.ModLoader.emulator.rdramRead32(ptrAddr);

        this.ModLoader.logger.info(value.toString(16)+" | "+ptrAddr.toString(16));
           if (value == this.table_end) {break;}
           
           switch(i) {
               case 0:
                    this.syms.playerStructSize = this.ModLoader.emulator.rdramRead32(value);
                    this.syms.controllerStructSize = this.ModLoader.emulator.rdramRead32(value + 0x4);
               case 1:
                    this.syms.gPlayer1.p = value;
                    this.syms.gPlayer2.p = value + this.syms.playerStructSize;
                    this.syms.gPlayer3.p = value + (this.syms.playerStructSize * 2);
                    this.syms.gPlayer4.p = value + (this.syms.playerStructSize * 3);
                    this.syms.gPlayer5.p = value + (this.syms.playerStructSize * 4);
                    this.syms.gPlayer6.p = value + (this.syms.playerStructSize * 5);
                    this.syms.gPlayer7.p = value + (this.syms.playerStructSize * 6);
                    this.syms.gPlayer8.p = value + (this.syms.playerStructSize * 7);
                    break;
                case 2:
                    this.syms.gController1.p = value;
                    this.syms.gController2.p = value + this.syms.controllerStructSize;
                    this.syms.gController3.p = value + (this.syms.controllerStructSize * 2);
                    this.syms.gController4.p = value + (this.syms.controllerStructSize * 3);
                    this.syms.gController5.p = value + (this.syms.controllerStructSize * 4);
                    this.syms.gController6.p = value + (this.syms.controllerStructSize * 5);
                    this.syms.gController7.p = value + (this.syms.controllerStructSize * 6);
                    this.syms.gController8.p = value + (this.syms.controllerStructSize * 7);
                    break;
                case 3:
                    this.syms.D_800DC510.p = value;
                    //console.log(this.syms.D_800DC510.p);
                    break;
                case 4:
                    this.syms.gModeSelection.p = value;
                    break;
                case 5:
                    this.syms.gCCSelection.p = value;
                    break;
                case 6:
                    this.syms.gGlobalTimer.p = value;
                    break;
                case 7:
                    this.syms.gCharacterGridSelections.p = value;
                    break;
                case 8:
                    this.syms.gCharacterSelections.p = value;
                    break;
                case 9:
                    this.syms.gCupCourseSelection.p = value;
                    break;
                case 10:
                    this.syms.gCupSelectionByCourseId.p = value;
                    break;
                case 11:
                    this.syms.gCurrentCourseId.p = value;
                    break;
                case 12:
                    this.syms.gCupSelection.p = value;
                    break;
                case 13:
                    this.syms.gMenuSelection.p = value;
                    break;
                case 14:
                    this.syms.playerPositions.p = value;
                    break;
                case 15:
                    this.syms.characterModel.p = value;
                    break;
                case 16:
                    this.syms.netPlayerPositions.p = value;
                    break;
                case 17:
                    this.syms.netCharacterSelections.p = value;
                    break;
                case 18:
                    this.syms.D_8018EDF3.p = value;
                    break;
                case 19:
                    this.syms.gMainMenuSelectionDepth.p = value;
                    break;
                case 20:
                    this.syms.D_800E86B0.p = value;
                    break;
                case 21:
                    this.syms.gScreenModeSelection.p = value;
                    break;
                case 22:
                    this.syms.gPlayerCountSelection1.p = value;
                    break;
                case 23:
                    this.syms.gGamestate.p = value;
                    break;
            }
            if (i > 1) {
                pointerTable.push(value);
            }
            i++;
            ptrAddr += 0x4;
        } while(value != this.table_end); // Limited to prevent infinite loop
        if (this.verifyPointerTable(pointerTable)) {
            return pointerTable;
        }
        return [];
    }

    public verifyPointerTable(pointerTable): boolean {
        this.ModLoader.logger.info("Verifying pointer table");
        for (let i = 0; i < pointerTable.length; i++) {            //this.ModLoader.logger.info(this.pointerTable[i].toString());
            if (pointerTable[i] < 0x80000000 || pointerTable[i] > 0x90000000) {
                this.ModLoader.logger.info("Failure!");
                return false
            }
        }
        this.ModLoader.logger.info("Verified!");
        return true;
    }


    /**
     * Returns emulator read value
     * @param define from enum Defines or ptr addr
     * Must have .s set as its used to figure out symbol size.
     * @param offset Pointer math.
     */
    public read(define: pointer, offset?: number): number {
        let temp;
        if (offset)
        {
            temp = define.p + offset;
        } else {
            temp = define.p;
        }

        switch(define.s) {
            case 0:
                return this.ModLoader.emulator.rdramRead8(temp);
            case 1:
                return this.ModLoader.emulator.rdramRead16(temp);
            case 2:
                return this.ModLoader.emulator.rdramRead32(temp);
            case 3:
                return this.ModLoader.emulator.rdramRead64(temp);
        }
        return 0;
    }
    /**
     * Shuffle an array
     * @param array 
     * @returns arr
     */
    public shuffle(array): number[] {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle...
        while (currentIndex != 0) {
      
          // Pick a remaining element...
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
    }
}