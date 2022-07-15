import { helperFuncs} from "MK64Core"

const gCharacterGridSelections = 0x8018EE64;
const gMainMenuSelectionDepth  = 0x8018EE6d;
const D_8018EDF3 = 0x8018EE73;
const gMenuSelection = 0x800E8720;
const D_800E86B0 = 0x800E8730;
const gScreenModeSelection = 0x800DC5B0;
const gPlayerCountSelection1 = 0x800DC5B8;
const gCCSelection = 0x800DC5C8;

export function clearChecksum(rom: any) {
    rom.writeInt32BE(0x00000000, 0x668);
    rom.writeInt32BE(0x00000000, 0x66B);
    rom.writeInt32BE(0x00000000, 0x66F);
    rom.writeInt32BE(0x00000000, 0x674);
    rom.writeInt32BE(0x00000000, 0x677);
    rom.writeInt32BE(0x00000000, 0x67B);
    rom.writeInt32BE(0x00000000, 0x688);
}

export function skipMenusRom(evt: any, helperFunc: helperFuncs) {
    
    let rom: Buffer = evt.rom;
   
    // This needs to be set in rom prior to game launch
    // However, this only works on a stock rom as
    // modifications result in rom shifts.
    if (false) {
        let gMenuSelection = 0xE92A3; // rom offset
        rom.writeInt8(12, gMenuSelection);
    }


}

export function skipMenusRam(ml: any) {
        ml.emulator.rdramWrite8(D_800E86B0, 2);
        ml.emulator.rdramWrite32(gScreenModeSelection, 0);
        ml.emulator.rdramWrite32(gPlayerCountSelection1, 1);
        ml.emulator.rdramWrite32(gCCSelection, 2);
        ml.emulator.rdramWrite8(gCharacterGridSelections, 1);
        ml.emulator.rdramWrite8(gMainMenuSelectionDepth, 3);
        ml.emulator.rdramWrite8(D_8018EDF3, 1);
}