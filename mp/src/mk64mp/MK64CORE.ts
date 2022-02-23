import { ICore, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { IRomHeader } from 'modloader64_api/IRomHeader';

export class MK64Core implements ICore {
    header = ["US"];
    ModLoader!: IModLoaderAPI;
    rom_header?: IRomHeader | undefined;
    heap_start: number = 0x0; // 0x81000000
    heap_size: number = 0x0; // 0x2E00000;
  
    preinit(): void { }
  
    init(): void { }
  
    postinit(): void { }
  
    onTick(frame?: number | undefined): void { }
  }

export enum mk64Events {
    ON_PLAYER_UPDATE = "onPlayerUpdate",
}

export class mk64Player {
    posX: number = 0;
    posY: number = 0;
    posZ: number = 0;
    rotX: number = 0;
    rotY: number = 0;
    rotZ: number = 0;
}