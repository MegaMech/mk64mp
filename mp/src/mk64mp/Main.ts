import {IPlugin, IModLoaderAPI} from 'modloader64_api/IModLoaderAPI';
import {MK64Core, mk64Player} from './MK64Core';
import {InjectCore} from 'modloader64_api/CoreInjection';
import IMemory from 'modloader64_api/IMemory';
import { ProxySide, SidedProxy } from 'modloader64_api/SidedProxy/SidedProxy';
import path from 'path';
import { mk64mpClient } from './Client';
import { mk64mpServer } from './Server';
import { Init, Preinit } from "modloader64_api/PluginLifecycle";

class mk64mp implements IPlugin {
    ModLoader!: IModLoaderAPI;
    pluginName?: "mk64mp";
    @InjectCore()
    core!: MK64Core;
    @SidedProxy(ProxySide.CLIENT, mk64mpClient)
    client!: any;
    @SidedProxy(ProxySide.SERVER, mk64mpServer)
    server!: any;

    //@Preinit()
    preinit(): void {
        this.ModLoader.logger.info("CORE: "+this.core.header);
        //this.server.setup();
    }
    @Init()
    init(): void {
        this.ModLoader.logger.info("mk64mp initialized.");
        //this.server.ModLoader.logger.info("TIOEJIJOSGFJIOSDGIJOSDFOJIDFJIOSDFJIOSDFIOJSDFJIOSDFJIOSDFJIOSDFIO");
    }
    postinit(): void {
        this.client.setup();
    }
    onTick(frame: number): void {
    }
}

module.exports = mk64mp;