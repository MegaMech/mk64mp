import { InjectCore } from "modloader64_api/CoreInjection"
import { IPlugin, IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { INetwork, INetworkPlayer, LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { helperFuncs, MK64Core, mk64Events, mk64Player} from "./MK64CORE"
import PlayerData from "./MK64CORE";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { mk64mp_PlayerPacket, packet_LobbyFull, packet_PlayerRecord, packet_SelectedCharacter } from "./Packets";
import { onTick, onViUpdate } from "modloader64_api/PluginLifecycle";
    
export class mk64mpClient {

    private localPlayer = new mk64Player();
    private pointerTable: Array<number> = [];
    private helperFunc = new helperFuncs();
    private beginRead: boolean = false;



    private players: Record<string, PlayerData> = {};
    private playerStructOffset = 0xDD8;
    private localUUID: string = "";
    private alreadySet: boolean = false;
    private alreadySet2: boolean = false;

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
            this.localPlayer.turn = this.ModLoader.emulator.rdramReadS16(this.pointerTable[0] + 0x2E);
            this.ModLoader.clientSide.sendPacket(
                new mk64mp_PlayerPacket(
                    this.ModLoader.clientLobby, 
                    this.localPlayer,   
                )
            );
        }
        if (this.ModLoader.emulator.rdramRead32(0x800DC510) == 3 && !this.alreadySet) {
            this.alreadySet = true;
            // 800DC510
            setTimeout(() => {
                this.setPlayersHuman();
            }, 20);
        }
        if (this.ModLoader.emulator.rdramRead32(0x800E86A0) == 0xD && !this.alreadySet2) {
            this.alreadySet2 = true;
            this.ModLoader.clientSide.sendPacket(
                new packet_SelectedCharacter (
                    this.ModLoader.clientLobby, 
                    this.ModLoader.emulator.rdramRead8(0x8018EDE4),
                )
            );
        }
    }

    @onViUpdate()
    onViUpdate() {

    }

    setPlayersHuman(): void {
        Object.entries(this.players).forEach((e, t) => {
            if (this.ModLoader.me.uuid !== e[0]) {
                let offset = (this.players[e[0]].index + 1) * this.playerStructOffset;
                this.ModLoader.logger.info("OFFSET: "+(offset+this.pointerTable[0]).toString(16));
                this.ModLoader.emulator.rdramWrite16(this.pointerTable[0]+offset, 0xC010);
            }
        });
    }

    //LobbyConfig: mk64mpLobbyConfig = {} as mk64mpLobbyConfig;
    //config!: mk64mpConfigCategory;

    //@SidedProxy(ProxySide.UNIVERSAL, OotOnline_ClientModules)
    //modules!: OotOnline_ClientModules

    // note that you do not receive packets sent by yourself, unless you are not forwarding the packet, and the server sends it back to you

    @EventHandler(EventsClient.ON_SERVER_CONNECTION)
    onConnect(player: INetworkPlayer) {
        this.ModLoader.logger.info("Client: Connected to server. SFDIO");
        
        //this.clientStorage.first_time_sync = false;
    }

    @EventHandler(EventsClient.ON_LOBBY_JOIN)
    onLobbyJoined_client(lobby: LobbyData, player: INetworkPlayer): void {
        //this.ModLoader.logger.info("Client: Joined lobby FSDSDF");
        
        //this.ModLoader.logger.info(player.uuid);
        
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
        //this.setPlayersHuman();
    }

    @NetworkHandler(mk64Events.ON_SELECTED_CHARACTER)
    OnSelectedCharacter(packet: packet_SelectedCharacter) {
        this.players[packet.player.uuid].characterTableIndex = packet.character;
        this.players[packet.player.uuid]
        this.ModLoader.emulator.rdramWrite8(0x8018EDE4+this.players[packet.player.uuid].index + 1, packet.character);
    }

    @NetworkHandler(mk64Events.ON_PLAYER_UPDATE)
    onPlayerUpdate(packet: mk64mp_PlayerPacket) {
        let offset;
        if (this.ModLoader.me.uuid === packet.player.uuid) {
            return;
        }
        offset = (this.players[packet.player.uuid].index + 1) * this.playerStructOffset;
        this.ModLoader.emulator.rdramWrite32(this.pointerTable[0]+offset+0x14, packet.localPlayer.posX);
        this.ModLoader.emulator.rdramWrite32(this.pointerTable[0]+offset+0x18, packet.localPlayer.posY);
        this.ModLoader.emulator.rdramWrite32(this.pointerTable[0]+offset+0x1C, packet.localPlayer.posZ);
        this.ModLoader.emulator.rdramWrite32(this.pointerTable[0]+offset+0x20, packet.localPlayer.rotX);
        this.ModLoader.emulator.rdramWrite32(this.pointerTable[0]+offset+0x24, packet.localPlayer.rotY);
        this.ModLoader.emulator.rdramWrite32(this.pointerTable[0]+offset+0x28, packet.localPlayer.rotZ);
        this.ModLoader.emulator.rdramWrite16(this.pointerTable[0]+offset+0x2E, packet.localPlayer.turn);
        //this.ModLoader.logger.info(packet.localPlayer.posX.toString(16)+
        //                        " | "+packet.localPlayer.posY.toString(16)+" | "+
        //                        packet.localPlayer.posZ.toString(16));
        //packet.player.uuid.toString();
 
    }
    @NetworkHandler(mk64Events.ON_LOBBY_FULL)
    onLobbyFull(packet: packet_LobbyFull) {
        process.exit(0);
    }
}
