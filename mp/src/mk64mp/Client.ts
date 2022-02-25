import { InjectCore } from "modloader64_api/CoreInjection"
import { IPlugin, IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { INetworkPlayer, LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { helperFuncs, MK64Core, mk64Events, mk64Player } from "./MK64CORE"
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { mk64mp_PlayerPacket, packet_GetPlayerIndex, packet_LobbyFull, packet_PlayerRecord } from "./Packets";
import { onTick, onViUpdate } from "modloader64_api/PluginLifecycle";
    
export class mk64mpClient {

    private localPlayer = new mk64Player();
    private pointerTable: Array<number> = [];
    private helperFunc = new helperFuncs();
    private beginRead: boolean = false;

    private players: Record<string, number> = {};
    private playerStructOffset = 0xDD8;

    @InjectCore()
    core!: MK64Core;

    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;

    @ParentReference()
    parent!: IPlugin;
    //constructor(private helperFunc: helperFuncs) { }

    setup(): void {
        setTimeout(() => {
            this.pointerTable = this.helperFunc.getPointerTable(this.pointerTable)
            if (this.pointerTable.length === 0) {return;}
            this.beginRead = true;
            
        }, 1000);
    }
    @onTick()
    onTick(frame: number): void {
        if (this.beginRead) {
            this.localPlayer.posX = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x14);
            this.localPlayer.posY = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x18);
            this.localPlayer.posZ = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x1C);
            this.localPlayer.rotX = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x20);
            this.localPlayer.rotY = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x24);
            this.localPlayer.rotZ = this.ModLoader.emulator.rdramRead32(this.pointerTable[0] + 0x28);
            this.ModLoader.clientSide.sendPacket(
                new mk64mp_PlayerPacket(
                    this.ModLoader.clientLobby, 
                    this.localPlayer,   
                )
            );
        }
    }

    @onViUpdate()
    onViUpdate() {

    }

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
    onLobbyJoined_client(lobby: LobbyData): void {
        this.ModLoader.logger.debug("Client: Joined lobby");
        //this.clientStorage.first_time_sync = false;
        //this.LobbyConfig.actor_syncing = lobby.data['OotOnline:actor_syncing'];
        //this.LobbyConfig.data_syncing = lobby.data['OotOnline:data_syncing'];
        //this.LobbyConfig.key_syncing = lobby.data['OotOnline:key_syncing'];
        //this.ModLoader.logger.info('OotOnline settings inherited from lobby.');
        if (lobby.data.hasOwnProperty("mk64Property")) {

        }
    }
    @EventHandler(EventsClient.ON_PLAYER_JOIN)
    onPlayerJoin_client(player: INetworkPlayer): void {

    }
    @NetworkHandler(mk64Events.ON_PLAYER_RECORD)
    OnPlayerRecord(packet: packet_PlayerRecord) {
        this.players = packet.players;
    }
    @NetworkHandler(mk64Events.ON_PLAYER_UPDATE)
    onPlayerUpdate(packet: mk64mp_PlayerPacket) {
        this.players[packet.player.uuid] * this.playerStructOffset;
        this.ModLoader.logger.info(packet.localPlayer.posX.toString(16)+
                                " | "+packet.localPlayer.posY.toString(16)+" | "+
                                packet.localPlayer.posZ.toString(16));
        packet.player.uuid.toString();
 
    }
    @NetworkHandler(mk64Events.ON_LOBBY_FULL)
    onLobbyFull(packet: packet_LobbyFull) {
        process.exit(0);
    }
}
