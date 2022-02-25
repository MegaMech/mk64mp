import {IPlugin, IModLoaderAPI} from 'modloader64_api/IModLoaderAPI';
import {MK64Core, mk64Player} from './MK64CORE';
import {InjectCore} from 'modloader64_api/CoreInjection';
import IMemory from 'modloader64_api/IMemory';
import { ProxySide, SidedProxy } from 'modloader64_api/SidedProxy/SidedProxy';
import path from 'path';
import { mk64mpClient } from './Client';
import { mk64mpServer } from './Server';
import { Preinit } from "modloader64_api/PluginLifecycle";

class mk64mp implements IPlugin {


    ModLoader!: IModLoaderAPI;
    pluginName?: "mk64mp";
    @InjectCore()
    core!: MK64Core;
    @SidedProxy(ProxySide.CLIENT, mk64mpClient)
    client!: any;
    @SidedProxy(ProxySide.SERVER, mk64mpServer)
    server!: any;

    //public pointerTableAddress: number = 0x800DC4DC;
    //public pointerTable: Array<number> = [];
    //public coords;
    //public table_end = 0xB8000000
    //public begin: boolean = false;
    @Preinit()
    preinit(): void {
        this.server.setup();
    }
    init(): void {
        this.ModLoader.logger.info("mk64mp initialized.");
        this.server.ModLoader.logger.info("TIOEJIJOSGFJIOSDGIJOSDFOJIDFJIOSDFJIOSDFIOJSDFJIOSDFJIOSDFJIOSDFIO");
    }
    postinit(): void {
        
       
    }
    onTick(frame: number): void {
    }
}

module.exports = mk64mp;
