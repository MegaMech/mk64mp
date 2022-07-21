import { mk64Cpu, mk64Player } from "MK64Core";
import { mk64mp_CpuPacket, mk64mp_PlayerPacket } from "./Packets";

// Make sure a race is in-progress and not in menus.
export var SendLocalPlayerStruct = function(this) {
    if (this.isHost) {
        this.localPlayer.posX = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x14);
        this.localPlayer.posY = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x18);
        this.localPlayer.posZ = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x1C);
        this.localPlayer.rotX = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x20);
        this.localPlayer.rotY = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x24);
        this.localPlayer.rotZ = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x28);
        this.localPlayer.turn = this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer1.p + 0x2E);
        this.ModLoader.clientSide.sendPacket(
            new mk64mp_PlayerPacket(
                this.ModLoader.clientLobby, 
                this.localPlayer,   
            )
        );

    let continu;
    // i = 1 to skip iterating over local player
    for (let i = 1; i < 8; i++) {
    
        Object.keys(this.players).forEach((id) => {
            if (this.players[id].index == i) {
                continu = true;
                return;
            }
        });
        if (continu) {
            continu = false;
            continue;
        }
        
        let pPlayer = this.helperFunc.GetPlayerPointer(i);
        
        // 0x90 = CPU flag
        if (this.ModLoader.emulator.rdramRead8(pPlayer.p) == 0x90) {
            let ply = new mk64Cpu();
            ply.index = i;
            ply.posX = this.ModLoader.emulator.rdramReadF32(pPlayer.p + 0x14);
            ply.posY = this.ModLoader.emulator.rdramReadF32(pPlayer.p + 0x18);
            ply.posZ = this.ModLoader.emulator.rdramReadF32(pPlayer.p + 0x1C);
            ply.rotX = this.ModLoader.emulator.rdramReadF32(pPlayer.p + 0x20);
            ply.rotY = this.ModLoader.emulator.rdramReadF32(pPlayer.p + 0x24);
            ply.rotZ = this.ModLoader.emulator.rdramReadF32(pPlayer.p + 0x28);
            ply.turn = this.ModLoader.emulator.rdramRead16(pPlayer.p + 0x2E);
            this.ModLoader.clientSide.sendPacket(
                new mk64mp_CpuPacket(
                    this.ModLoader.clientLobby, 
                    ply,   
                )
            );
        }
    }


    } else {
        if (this.helperFunc.read(this.helperFunc.syms.gGamestate) == 4) { 
            if (this.isInitPointerTable) {
                this.localPlayer.posX = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x14);
                this.localPlayer.posY = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x18);
                this.localPlayer.posZ = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x1C);
                this.localPlayer.rotX = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x20);
                this.localPlayer.rotY = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x24);
                this.localPlayer.rotZ = this.ModLoader.emulator.rdramReadF32(this.helperFunc.syms.gPlayer1.p + 0x28);
                this.localPlayer.turn = this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer1.p + 0x2E);
                this.ModLoader.clientSide.sendPacket(
                    new mk64mp_PlayerPacket(
                        this.ModLoader.clientLobby, 
                        this.localPlayer,   
                    )
                );
            }
        }
    }
};

export var nSetIndexes = function(this) {

    for (let i = 0; i < 8; i++) {
        this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + (0x2 * i), this.playerStartOrder[i]);
    }


    /*
    for (let id in this.players) {
        if (this.ModLoader.me.uuid == id) {
            this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p, this.players[id].index);
            this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p, this.players[id].characterTableIndex);
            continue;
        }
        switch(this.players[id].index) {
            case 0:
                //this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.netCharacterSelections + (2 * i), this.players[id].index);
                break;
            case 1:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x2, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x2, this.players[id].characterTableIndex);
                break;
            case 2:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x4, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x4, this.players[id].characterTableIndex);
                break;
            case 3:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x6, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x6, this.players[id].characterTableIndex);
                break;
            case 4:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x8, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x8, this.players[id].characterTableIndex);
                break;
            case 5:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0xA, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0xA, this.players[id].characterTableIndex);
                break;
            case 6:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0xC, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0xC, this.players[id].characterTableIndex);
                break;
            case 7:
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0xE, this.players[id].index);
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0xE, this.players[id].characterTableIndex);
                break;
        }
    }
    */
};