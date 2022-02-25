import { InjectCore } from "modloader64_api/CoreInjection";
import { IModLoaderAPI, IPlugin } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { MK64Core, mk64Events, mk64Player } from "./MK64CORE";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { EventHandler, EventServerJoined, EventServerLeft, EventsServer } from "modloader64_api/EventHandler";
import { mk64mp_PlayerPacket } from "./Packets";
import { ServerNetworkHandler } from "modloader64_api/NetworkHandler";

export class mk64mpServer {
    @InjectCore()
    core!: MK64Core;
    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;
    @ParentReference()
    parent!: IPlugin;
    //@SidedProxy(ProxySide.SERVER, OotOnline_ServerModules)
   // modules!: OotOnline_ServerModules;

    private players = [];

    setup(): void {
        
    }

   @EventHandler(EventsServer.ON_LOBBY_CREATE)
   onLobbyCreated(lobby: string) {
       try {
           //this.ModLoader.lobbyManager.createLobbyStorage(lobby, this.parent, new OotOnlineStorage());
           //let storage: OotOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
               //lobby,
            //   this.parent
           //) as OotOnlineStorage;
           //if (storage === null) {
           //    return;
           //}
           //storage.saveManager = new OotOSaveData(this.core.OOT!, this.ModLoader);
       }
       catch (err: any) {
           this.ModLoader.logger.error(err);
       }
   }
   @EventHandler(EventsServer.ON_LOBBY_JOIN)
   onPlayerJoin_server(evt: EventServerJoined) {
    this.ModLoader.logger.info("PLAYER JOINED!!");
    if (this.players.length >= 8) {
        // DC 9th player.
        return;
    }
    this.players[evt.player.uuid];
       //let storage: OotOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
      //     evt.lobby,
      //     this.parent
      // ) as OotOnlineStorage;
       //if (storage === null) {
       //    return;
       //}
       //storage.players[evt.player.uuid] = -1;
      // storage.networkPlayerInstances[evt.player.uuid] = evt.player;
   }
   @EventHandler(EventsServer.ON_LOBBY_LEAVE)
   onPlayerLeft_server(evt: EventServerLeft) {
       //let storage: OotOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
       //    evt.lobby,
        //   this.parent
       //) as OotOnlineStorage;
       //if (storage === null) {
       //    return;
       //}
       delete this.players[evt.player.uuid];
       //delete storage.players[evt.player.uuid];
       //delete storage.networkPlayerInstances[evt.player.uuid];
   }
   @ServerNetworkHandler(mk64Events.ON_PLAYER_UPDATE)
    onPlayerUpdate(packet: mk64mp_PlayerPacket) {
        this.ModLoader.logger.info("Server: packet received");
        this.ModLoader.logger.info(packet.localPlayer.posX.toString(16));
    }

   //@ServerNetworkHandler('Z64O_DownloadRequestPacket')
    //onDownloadPacket_server(packet: Z64O_DownloadRequestPacket) {
        //let storage: OotOnlineStorage = this.ModLoader.lobbyManager.getLobbyStorage(
        //    packet.lobby,
        //    this.parent
        //) as OotOnlineStorage;
        //if (storage === null) {
        //    return;
        //}
        //if (typeof storage.worlds[packet.player.data.world] === 'undefined') {
        //    this.ModLoader.logger.info(`Creating world ${packet.player.data.world} for lobby ${packet.lobby}.`);
        //    storage.worlds[packet.player.data.world] = new OotOnlineSave_Server();
        //}
        //let world = storage.worlds[packet.player.data.world];
        //if (world.saveGameSetup) {
            // Game is running, get data.
        //    let resp = new Z64O_DownloadResponsePacket(packet.lobby, false);
        //    Z64Serialize.serialize(world.save).then((buf: Buffer) => {
        //        resp.save = buf;
        //        resp.keys = world.keys;
        //        this.ModLoader.serverSide.sendPacketToSpecificPlayer(resp, packet.player);
        //    }).catch(() => { });
        //} else {
            // Game is not running, give me your data.
        //    Z64Serialize.deserialize(packet.save).then((data: any) => {
        //        Object.keys(data).forEach((key: string) => {
        //            let obj = data[key];
        //            world.save[key] = obj;
         //       });
        //        world.saveGameSetup = true;
        //        let resp = new Z64O_DownloadResponsePacket(packet.lobby, true);
        //        this.ModLoader.serverSide.sendPacketToSpecificPlayer(resp, packet.player);
        //    });
        //}
    //}

}
