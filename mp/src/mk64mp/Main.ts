import {IPlugin, IModLoaderAPI} from 'modloader64_api/IModLoaderAPI';
import {MK64Core, Player} from './MK64CORE';
import {InjectCore} from 'modloader64_api/CoreInjection';
import IMemory from 'modloader64_api/IMemory';


class mk64mp implements IPlugin {


    ModLoader!: IModLoaderAPI;
    //pluginName?: "mk64mp";
    @InjectCore()
    core!: MK64Core;

    public pointerTableAddress: number = 0x800DC4DC;
    public pointerTable: Array<number> = [];
    public coords;
    public table_end = 0xB8000000
    public begin: boolean = false;

    preinit(): void {
    }
    init(): void {
        this.ModLoader.logger.info("mk64mp initialized.");
        this.coords = 0x800DC4DC;
    }
    postinit(): void {
        
        setTimeout(() => {
            if (this.getPointerTable()) {
                this.coords = this.ModLoader.emulator.rdramRead32(this.pointerTable[0]);
                this.ModLoader.logger.info("player coords: " + this.coords);
                this.ModLoader.ImGui.begin("DisplayValues", [true]);
                this.ModLoader.ImGui.text("test");
                this.ModLoader.ImGui.end();
                this.begin = true;
                
                this.ModLoader.logger.info("addr:");
                this.ModLoader.logger.info((this.pointerTable[0]+0x14).toString(16));
        
                let Player1 = new Player();
                let Player2 = new Player();
                let Player3 = new Player();
                let Player4 = new Player();
                let Player5 = new Player();
                let Player6 = new Player();
                let Player7 = new Player();
                let Player8 = new Player();
        
                this.ModLoader.logger.info(this.pointerTable[0].toString(16));
                setInterval(() => {
                    Player1.posX = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x14);
                    Player1.posY = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x18);
                    Player1.posZ = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x1C);
                    Player1.rotX = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x20);
                    Player1.rotY = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x24);
                    Player1.rotZ = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x28);
                    this.ModLoader.logger.info(Player1.posX.toString(16)+" | "+Player1.posY.toString(16)+" | "+Player1.posZ.toString(16));
                    
                }, 100);
            }
        }, 1000);
    }
    onTick(frame: number): void {
        if (this.begin) {
            //this.ModLoader.ImGui.text(
            this.ModLoader.emulator.rdramRead32(this.pointerTableAddress[0] + 0x14).toString(16);
        }
    }
    
    private getPointerTable() {
        let offset = 0x0;
        let value;
        this.ModLoader.logger.info(this.ModLoader.emulator.rdramRead32(0x800DC4DC).toString(16));
        do {
            value = this.ModLoader.emulator.rdramRead32(this.pointerTableAddress + offset)
            this.pointerTable.push(value);
            offset += 0x4;
            
        } while(value != this.table_end && offset < 0x20); // Limited to prevent infinite loop
        return this.verifyPointerTable();
    }

    private verifyPointerTable(): boolean {
        this.ModLoader.logger.info("Verifying pointer table");
        for (let i = 0; i < this.pointerTable.length; i++) {
            //this.ModLoader.logger.info(this.pointerTable[i].toString());
            if (this.pointerTable[i] < 0x80000000 || this.pointerTable[i] > 0x90000000) {
                if (0) {return false;}
            }
        }
        
        return true;
    }

}

module.exports = mk64mp;