import { InjectCore } from "modloader64_api/CoreInjection"
import { IPlugin, IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { MK64Core, mk64Events, Player } from "./MK64CORE"
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
    
export class mk64Client {
    @InjectCore()
    core!: MK64Core;

    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;

    @ParentReference()
    parent!: IPlugin;

    //LobbyConfig: mk64mpLobbyConfig = {} as mk64mpLobbyConfig;
    //config!: mk64mpConfigCategory;

    //@SidedProxy(ProxySide.UNIVERSAL, OotOnline_ClientModules)
    //modules!: OotOnline_ClientModules

    // note that you do not receive packets sent by yourself, unless you are not forwarding the packet, and the server sends it back to you

    @EventHandler(EventsClient.ON_SERVER_CONNECTION)
    onConnect() {
        this.ModLoader.logger.debug("Connected to server.");
        //this.clientStorage.first_time_sync = false;
    }

    @EventHandler(EventsClient.ON_LOBBY_JOIN)
    onJoinedLobby(lobby: LobbyData): void {
        //this.clientStorage.first_time_sync = false;
        //this.LobbyConfig.actor_syncing = lobby.data['OotOnline:actor_syncing'];
        //this.LobbyConfig.data_syncing = lobby.data['OotOnline:data_syncing'];
        //this.LobbyConfig.key_syncing = lobby.data['OotOnline:key_syncing'];
        //this.ModLoader.logger.info('OotOnline settings inherited from lobby.');
        if (lobby.data.hasOwnProperty("mk64Property")) {

        }
    }
    @EventHandler(mk64Events.ON_PLAYER_UPDATE)
    onPlayerUpdate(players: mk64Player) {
        this.ModLoader.clientSide.sendPacket(
            new Z64O_ScenePacket(
                this.ModLoader.clientLobby,
                this.core.OOT!.global.scene,
                age
            )
        );
    }
       
}