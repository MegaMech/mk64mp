import { InjectCore } from "modloader64_api/CoreInjection"
import { IPlugin, IModLoaderAPI } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { INetwork, INetworkPlayer, LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { helperFuncs, MK64Core, mk64Events, mk64Player} from "MK64Core"
import PlayerData from "MK64Core";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { mk64mp_PlayerPacket, packet_LobbyFull, packet_PlayerRecord, packet_SelectedCharacter } from "./Packets";
import { onTick, onViUpdate } from "modloader64_api/PluginLifecycle";
import { bool_ref } from "modloader64_api/Sylvain/ImGui";
    
export class mk64mpClient {

    // debug
        isDebugWindowOpen: bool_ref = [true]
    // debug_end

    private localPlayer = new mk64Player();
    private pointerTable: Array<number> = [];
    private helperFunc = new helperFuncs();
    private beginRead: boolean = false;



    private players: Record<string, PlayerData> = {};
    private localUUID: string = "";
    private alreadySet: boolean = false;
    private alreadySet2: boolean = false;
    private isHost: boolean = false;

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
            this.ModLoader.logger.info("gPlayers:");
            this.ModLoader.logger.info(this.helperFunc.defines.gPlayer1.toString(16));
            this.ModLoader.logger.info(this.helperFunc.defines.gPlayer2.toString(16));
            this.ModLoader.logger.info(this.helperFunc.defines.gPlayer3.toString(16));
            this.ModLoader.logger.info(this.helperFunc.defines.gPlayer4.toString(16));
            this.ModLoader.logger.info("RUNNING");
            this.ModLoader.logger.info(this.helperFunc.defines.gPlayer1.toString(16));
            if (this.pointerTable.length === 0) {return;}
            this.beginRead = true;
            
        }, 1000);
    }
    @onTick()
    onTick(frame: number): void {
         if (this.beginRead) {
             this.localPlayer.posX = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x14, 32);
             this.localPlayer.posY = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x18, 32);
             this.localPlayer.posZ = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x1C, 32);
             this.localPlayer.rotX = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x20, 32);
             this.localPlayer.rotY = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x24, 32);
             this.localPlayer.rotZ = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x28, 32);
             this.localPlayer.turn = this.helperFunc.read(this.helperFunc.defines.gPlayer1 + 0x2E, 32);
             this.ModLoader.clientSide.sendPacket(
                 new mk64mp_PlayerPacket(
                     this.ModLoader.clientLobby, 
                     this.localPlayer,   
                 )
             );
         }
        if (this.helperFunc.read(this.helperFunc.defines.D_800DC510, 32) == 3 && !this.alreadySet) {
            this.alreadySet = true;
            // 800DC510
            setTimeout(() => {
                this.setPlayersHuman();
            }, 20);
        }
        if (this.helperFunc.read(this.helperFunc.defines.gMenuSelection, 32) == 0xD && !this.alreadySet2) {
            this.alreadySet2 = true;
            let myCharacter = this.helperFunc.read(this.helperFunc.defines.gCharacterGridSelections, 8);
            this.ModLoader.clientSide.sendPacket(
                new packet_SelectedCharacter (
                    this.ModLoader.clientLobby, 
                    myCharacter,
                )
            );
            this.players[this.ModLoader.me.uuid].characterTableIndex = myCharacter;
            let i = 1;
            for (let id in this.players) {
                if (this.ModLoader.me.uuid == id) {
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.netPlayerPositions, this.players[id].index);
                    continue;
                }
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.netPlayerPositions + (2 * i), this.players[id].index);

                i++;
            }
        }
    }

    @onViUpdate()
    onViUpdate() {
        if (typeof this.players[this.ModLoader.me.uuid] == "undefined") { return;}
        this.ModLoader.ImGui.begin("Client "+this.players[this.ModLoader.me.uuid].index.toString()+" Debug", this.isDebugWindowOpen); {
            //let client = this.players[this.ModLoader.me.uuid];
            Object.entries(this.players).forEach((e, t) => {
                this.ModLoader.ImGui.text(`index: ${this.players[e[0]].index}`)
                this.ModLoader.ImGui.separator()
                this.ModLoader.ImGui.text(`character: ${this.players[e[0]].characterTableIndex}`)
                this.ModLoader.ImGui.separator()
            });
                let str = "";
                for (let i = 0; i < 8; i++) {
                    str += this.helperFunc.read(this.helperFunc.defines.netPlayerPositions + (i * 2),16).toString(16)+" "
                }
                this.ModLoader.ImGui.text("netPlayerPos: "+ str);
                this.ModLoader.ImGui.separator()
                let stri = "";
                for (let i = 0; i < 8; i++) {
                    stri += this.helperFunc.read(this.helperFunc.defines.netCharacterSelections + (i * 2),16).toString(16)+" "
                }
                this.ModLoader.ImGui.text("netCharacterSel: "+ stri);
                this.ModLoader.ImGui.separator()
                //counter = this.ModLoader.emulator.rdramRead32(this.someCounterPointer)
        } this.ModLoader.ImGui.end()

    }

    setPlayersHuman(): void {
        
        Object.keys(this.players).forEach((id) => {
            switch(this.players[id].index) {
                case 0:
                    //this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer1, 0xC010);
                    break;
                case 1:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer2, 0xC010);
                    this.ModLoader.logger.info(this.helperFunc.defines.gPlayer2.toString(16));
                    break;
                case 2:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer3, 0xC010);
                    this.ModLoader.logger.info(this.helperFunc.defines.gPlayer3.toString(16));
                    break;
                case 3:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer4, 0xC010);
                    break;
                case 4:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer5, 0xC010);
                    break;
                case 5:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer6, 0xC010);
                    break;
                case 6:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer7, 0xC010);
                    break;
                case 7:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer8, 0xC010);
                    break;
            }
            this.ModLoader.logger.info("Set Player Index "+this.players[id].index+" to human");
            this.ModLoader.logger.info("Client: MY INDEX IS "+this.players[id].index.toString());
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

        Object.keys(this.players).forEach(item => {
            if (this.ModLoader.me.uuid === item)
            {
                if (this.players[item].index == 0) {
                    this.isHost = true;
                    this.ModLoader.logger.info("ISHOST TRUE");
                }
            }
        })


        //this.setPlayersHuman();
    }

    @NetworkHandler(mk64Events.ON_SELECTED_CHARACTER)
    OnSelectedCharacter(packet: packet_SelectedCharacter) {
        this.players[packet.player.uuid].characterTableIndex = packet.character;
        this.ModLoader.emulator.rdramWrite8(this.helperFunc.defines.gCharacterGridSelections+this.players[packet.player.uuid].index + 1, packet.character);
        
        //this.players
        //0x0254
    }

    @NetworkHandler(mk64Events.ON_PLAYER_UPDATE)
    onPlayerUpdate(packet: mk64mp_PlayerPacket) {
        let offset;
        if (this.ModLoader.me.uuid === packet.player.uuid) {
            return;
        }
        offset = (this.players[packet.player.uuid].index + 1) * this.helperFunc.defines.playerStructSize;
        this.ModLoader.emulator.rdramWrite32(this.helperFunc.defines.gPlayer1+offset+0x14, packet.localPlayer.posX);
        this.ModLoader.emulator.rdramWrite32(this.helperFunc.defines.gPlayer1+offset+0x18, packet.localPlayer.posY);
        this.ModLoader.emulator.rdramWrite32(this.helperFunc.defines.gPlayer1+offset+0x1C, packet.localPlayer.posZ);
        this.ModLoader.emulator.rdramWrite32(this.helperFunc.defines.gPlayer1+offset+0x20, packet.localPlayer.rotX);
        this.ModLoader.emulator.rdramWrite32(this.helperFunc.defines.gPlayer1+offset+0x24, packet.localPlayer.rotY);
        this.ModLoader.emulator.rdramWrite32(this.helperFunc.defines.gPlayer1+offset+0x28, packet.localPlayer.rotZ);
        this.ModLoader.emulator.rdramWrite16(this.helperFunc.defines.gPlayer1+offset+0x2E, packet.localPlayer.turn);
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