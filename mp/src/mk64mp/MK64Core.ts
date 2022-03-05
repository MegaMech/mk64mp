import { ICore, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { IRomHeader } from 'modloader64_api/IRomHeader';
import { ModLoaderAPIInject } from 'modloader64_api/ModLoaderAPIInjector';
import { Defines }  from './Defines';


export class MK64Core implements ICore {
    header: string | string[] = "NKT";
    ModLoader!: IModLoaderAPI;
    rom_header?: IRomHeader | undefined;
    heap_start: number = 0x0; // 0x81000000
    heap_size: number = 0x0; // 0x2E00000;
  
    preinit(): void { }
    init(): void {}
    postinit(): void { }
    onTick(frame?: number | undefined): void { }
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

export class helperFuncs {
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    //private pointerTable;
    public coords;
    public table_end = 0xB8000000
    public begin: boolean = false;

    //Constructor(pointerTable: Array<number>) {
    //    this.pointerTable = pointerTable;
   // }

    public getPointerTable(pointerTable) {
        let offset = 0x0;
        let value;
        //this.ModLoader.logger.info(this.ModLoader.emulator.rdramRead32(0x800DC4DC).toString(16));
        do {
            value = this.ModLoader.emulator.rdramRead32(Defines.prototype.pointerTable + offset)
            pointerTable.push(value);
            offset += 0x4;
            
        } while(value != this.table_end && offset < 0x20); // Limited to prevent infinite loop
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
}