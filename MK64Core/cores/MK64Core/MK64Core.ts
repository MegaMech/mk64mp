import { ICore, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
//import { Defines }  from './Defines';


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
export class Defines {
    public pointerTable = 0x80700020;
    public playerStructSize = 0xDD8;
    public gPlayer1 = 0;
    public gPlayer2 = 0;
    public gPlayer3 = 0;
    public gPlayer4 = 0;
    public gPlayer5 = 0;
    public gPlayer6 = 0;
    public gPlayer7 = 0;
    public gPlayer8 = 0;
    
    public controllerStructSize = 0x10;
    public gController1 = 0;
    public gController2 = 0;
    public gController3 = 0;
    public gController4 = 0;

    public D_800DC510 = 0;
    public gModeSelection = 0;
    public gCCSelection = 0;
    public gGlobalTimer = 0;
    public gCharacterGridSelections = 0;
    public gCharacterSelections = 0;
    public gCupCourseSelection = 0;
    public gCupSelectionByCourseId = 0;
    public gCurrentCourseId = 0;
    public gCupSelection = 0;
    public gMenuSelection = 0;
    public playerPositions = 0;
    public characterModel = 0;
    public netPlayerPositions = 0;
    public netCharacterSelections = 0;
}

export enum mk64Events {
    ON_PLAYER_UPDATE = "onPlayerUpdate",
    ON_PLAYER_RECORD = "onPlayerRecord",
    ON_LOBBY_FULL = "onLobbyFull",
    ON_SELECTED_CHARACTER = "onSelectedCharacter",
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

enum pointerNames {
    players = 0,
    controllers = 1,
}

export class helperFuncs {
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    //private pointerTable;
    public coords;
    public table_end = 0xB8000000
    public begin: boolean = false;
    public defines: Defines = new Defines();
    
    //Constructor(pointerTable: Array<number>) {
        //    this.pointerTable = pointerTable;
   // }
   
   public getPointerTable(pointerTable) {
       let ptrAddr = this.defines.pointerTable; // 0x80700020;
       let i = 0;
       let value;
       //this.ModLoader.logger.info(this.ModLoader.emulator.rdramRead32(0x800DC4DC).toString(16));
       do {
           value = this.ModLoader.emulator.rdramRead32(ptrAddr);
           if (value == 0 || value == 0xFFFFFFFF) {break;}
           
           switch(i) {
               case pointerNames.players:
                    this.defines.gPlayer1 = value;
                    this.defines.gPlayer2 = value + this.defines.playerStructSize;
                    this.defines.gPlayer3 = value + (this.defines.playerStructSize * 2);
                    this.defines.gPlayer4 = value + (this.defines.playerStructSize * 3);
                    this.defines.gPlayer5 = value + (this.defines.playerStructSize * 4);
                    this.defines.gPlayer6 = value + (this.defines.playerStructSize * 5);
                    this.defines.gPlayer7 = value + (this.defines.playerStructSize * 6);
                    this.defines.gPlayer8 = value + (this.defines.playerStructSize * 7);
                    break;
                case pointerNames.controllers:
                    this.defines.gPlayer1 = value;
                    this.defines.gPlayer2 = value + this.defines.controllerStructSize;
                    this.defines.gPlayer3 = value + (this.defines.controllerStructSize * 2);
                    this.defines.gPlayer4 = value + (this.defines.controllerStructSize * 3);
                    break;
                case 2:
                    this.defines.D_800DC510 = value;
                    break;
                case 3:
                    this.defines.gModeSelection = value;
                    break;
                case 4:
                    this.defines.gCCSelection = value;
                    break;
                case 5:
                    this.defines.gGlobalTimer = value;
                    break;
                case 6:
                    this.defines.gCharacterGridSelections = value;
                    break;
                case 7:
                    this.defines.gCharacterSelections = value;
                    break;
                case 8:
                    this.defines.gCupCourseSelection = value;
                    break;
                case 9:
                    this.defines.gCupSelectionByCourseId = value;
                    break;
                case 10:
                    this.defines.gCurrentCourseId = value;
                    break;
                case 11:
                    this.defines.gCupSelection = value;
                    break;
                case 12:
                    this.defines.gMenuSelection = value;
                    break;
                case 13:
                    this.defines.playerPositions = value;
                    break;
                case 14:
                    this.defines.characterModel = value;
                    break;
                case 15:
                    this.defines.netPlayerPositions = value;
                    break;
                case 16:
                    this.defines.netCharacterSelections = value;
                    break;
            }
            if (i > 1) {
                pointerTable.push(value);
            }
            i++;
            ptrAddr += 0x4;
        } while(value != 0xFFFFFFFF); // Limited to prevent infinite loop
        if (this.verifyPointerTable(pointerTable)) {
            return pointerTable
        }
        return [];
    }

    public verifyPointerTable(pointerTable): boolean {
        this.ModLoader.logger.info("Verifying pointer table");
        for (let i = 0; i < pointerTable.length; i++) {            //this.ModLoader.logger.info(this.pointerTable[i].toString());
            if (pointerTable[i] < 0x80000000 || pointerTable[i] > 0x90000000) {
                if (0) {return false;}
            }
        }
        
        return true;
    }


    /**
     * Returns emulator read value
     * @param define from enum Defines or ptr addr
     * @param type typecast accepted values: 8, 16, 32
     */
    read(define: number, type: number): number {
        if (type === 8) {
            return this.ModLoader.emulator.rdramRead8(define);
        } else if (type === 16) {
            return this.ModLoader.emulator.rdramRead16(define);
        } else if (type === 32) {
            return this.ModLoader.emulator.rdramRead32(define);
        } else {
            return 0;
        }
    }
}