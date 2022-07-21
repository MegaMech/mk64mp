import { InjectCore } from "modloader64_api/CoreInjection"
import { IPlugin, IModLoaderAPI, ModLoaderEvents } from "modloader64_api/IModLoaderAPI";
import { ModLoaderAPIInject } from "modloader64_api/ModLoaderAPIInjector";
import { EventHandler, PrivateEventHandler, EventsClient, bus } from "modloader64_api/EventHandler";
import { INetwork, INetworkPlayer, LobbyData, NetworkHandler } from "modloader64_api/NetworkHandler";
import { helperFuncs, MK64Core, mk64Events, mk64Player, pointer} from "MK64Core"
import PlayerData from "MK64Core";
import { ParentReference, SidedProxy, ProxySide } from "modloader64_api/SidedProxy/SidedProxy";
import { mk64mp_CpuPacket, mk64mp_PlayerPacket, packet_LobbyFull, packet_PlayerRecord, packet_RandomizedProperties, packet_SelectedCharacter } from "./Packets";
import { onTick, onViUpdate } from "modloader64_api/PluginLifecycle";
import { bool_ref } from "modloader64_api/Sylvain/ImGui";
import { skipMenusRom, skipMenusRam } from "./Skip_Menus";
import { nSetIndexes, SendLocalPlayerStruct } from "./Read";

export class mk64mpClient {
    private isInitPointerTable: boolean = false;
    // debug
        isDebugWindowOpen: bool_ref = [true]
    // debug_end

    private localPlayer = new mk64Player();
    private pointerTable: Array<number> = [];
    private helperFunc = new helperFuncs();
    private beginRead: boolean = false;

    
    private players: Record<string, PlayerData> = {};
    private playerStartOrder: number[] = [];
    private localUUID: string = "";
    private alreadySet: boolean = false;
    private alreadySet2: boolean = false;
    private alreadySet3: boolean = false;
    private isHost: boolean = false;
    private ctx: any = this;
    
    @InjectCore()
    core!: MK64Core;

    @ModLoaderAPIInject()
    ModLoader!: IModLoaderAPI;

    @ParentReference()
    parent!: IPlugin;
    //constructor(private helperFunc: helperFuncs) { }

    @EventHandler(ModLoaderEvents.ON_ROM_PATCHED)
    onRom(evt: any) {
        skipMenusRom(evt, this.helperFunc);
    }
    
    //initPointerTable before we do anything.
    // @EventHandler(EventsClient.ON_HEAP_READY)
    // onInject(evt: any) {
    //     console.log("RUN TABLE");
    //     console.log("RUN TABLE");
    //     console.log("RUN TABLE");
    //     console.log("RUN TABLE");
    //     console.log("RUN TABLE");
    //     //.setupa();
    // }
    
    setup(): void {
        setTimeout(() => {
            skipMenusRam(this.ModLoader);
            // Jump straight to player select screen
        }, 250);
        
        setTimeout(() => {
            //this.ModLoader.logger.info("getting table:");
            if (true) {
                this.pointerTable = this.helperFunc.initPointerTable();
                this.isInitPointerTable = true;
                //this.pointerTable = this.helperFunc.initPointerTable(this.pointerTable);
            }
            //this.ModLoader.logger.info("gPlayers:");
            this.ModLoader.logger.info(this.helperFunc.syms.gPlayer1.p.toString(16));
            this.ModLoader.logger.info(this.helperFunc.syms.gPlayer2.p.toString(16));
            this.ModLoader.logger.info(this.helperFunc.syms.gPlayer3.p.toString(16));
            this.ModLoader.logger.info(this.helperFunc.syms.gPlayer4.p.toString(16));
            this.ModLoader.logger.info("RUNNING");
            if (this.pointerTable.length === 0) {return;}
            this.beginRead = true;
            
        }, 500);
    }
    @onTick()
    onTick(frame: number): void {
        // Wait until the pointer table is initiated.
        //if (!STOCK_GAME) {
            if (!this.isInitPointerTable) { return; }
        //}
        
        
        if (this.helperFunc.read(this.helperFunc.syms.D_800DC510) == 3) {

            SendLocalPlayerStruct.call(this.ctx);
        
            if (!this.alreadySet) {
                this.alreadySet = true;
                // 800DC510
                setTimeout(() => {
                    this.setPlayersHuman();
                }, 20);
            }
        }

        if (this.helperFunc.read(this.helperFunc.syms.gMenuSelection) == 0xD && !this.alreadySet2) {
            this.alreadySet2 = true;

            let myCharacter = this.helperFunc.read(this.helperFunc.syms.gCharacterGridSelections);
            this.ModLoader.clientSide.sendPacket(
                new packet_SelectedCharacter (
                    this.ModLoader.clientLobby, 
                    myCharacter,
                )
            );
            this.players[this.ModLoader.me.uuid].characterTableIndex = myCharacter;
            //let i = 1;
            if (this.isHost) {
                setTimeout(() => {
                    // Randomization code here.
                    this.playerStartOrder = this.helperFunc.shuffle(
                        [0, 1, 2, 3, 4, 5, 6, 7]);
                    for (let i = 0; i < 8; i++) {
                        this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + (0x2 * i), this.playerStartOrder[i]);
                    }                    
                    this.ModLoader.clientSide.sendPacket(
                        new packet_RandomizedProperties (
                            this.ModLoader.clientLobby,
                            this.playerStartOrder,
                        )
                    );

                    

                    //nSetIndexes.call(this.ctx);
                }, 2000);
            }
        }

        //if (this.helperFunc.read(this.helperFunc.syms.gMenuSelection) == 0xE) {
        //    D_80165270
        //}

    }

    @onViUpdate()
    onViUpdate() {
        if (!this.isInitPointerTable) { return; }
        //if (typeof this.helperFunc.syms.netPlayerPositions === "undefined") { return; }
        if (typeof this.players[this.ModLoader.me.uuid] == "undefined") { return;}
        let titleStr = "Client";
        if (this.isHost) {
            titleStr = "Host";
        }

        if (this.ModLoader.ImGui.beginMainMenuBar()) {
            if (this.ModLoader.ImGui.beginMenu(titleStr)) {
                this.ModLoader.ImGui.endMenu();
            }
            this.ModLoader.ImGui.endMainMenuBar();
        }

        this.ModLoader.ImGui.begin(titleStr+" "+this.players[this.ModLoader.me.uuid].index.toString()+" Debug", this.isDebugWindowOpen); {
            //let client = this.players[this.ModLoader.me.uuid];
            Object.entries(this.players).forEach((e, t) => {
                this.ModLoader.ImGui.text(`index: ${this.players[e[0]].index}`)
                this.ModLoader.ImGui.separator()
                this.ModLoader.ImGui.text(`character: ${this.players[e[0]].characterTableIndex}`)
                this.ModLoader.ImGui.separator()
            });
                let str = "";
                //this.ModLoader.logger.info(this.helperFunc.syms.netPlayerPositions.p.toString(16));
                for (let i = 0; i < 8; i++) {
                    str += this.helperFunc.read(this.helperFunc.syms.netPlayerPositions, (i * 2)).toString()+" "
                }
                this.ModLoader.ImGui.text("netPlayerPos: "+str);
                this.ModLoader.ImGui.separator()
                let stri = "";
                for (let i = 0; i < 8; i++) {
                    stri += this.helperFunc.read(this.helperFunc.syms.netCharacterSelections, (i * 2)).toString()+" "
                }
                this.ModLoader.ImGui.text("netCharacterSel: "+stri);
                this.ModLoader.ImGui.separator()

                this.ModLoader.ImGui.text("Player 1: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer1.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 2: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer2.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 3: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer3.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 4: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer4.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 5: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer5.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 6: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer6.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 7: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer7.p).toString(16).toUpperCase()));
                this.ModLoader.ImGui.text("Player 8: "+this.getPlayerType(this.ModLoader.emulator.rdramRead16(this.helperFunc.syms.gPlayer8.p).toString(16).toUpperCase()));

                //counter = this.ModLoader.emulator.rdramRead32(this.someCounterPointer)
        } this.ModLoader.ImGui.end()
    }

    getPlayerType(type: string): string {
        switch(type) {
            case "C010":
                return "PLAYER";
            case "9010":
                return "CPU";
            case "E010":
                return "STAGING";
        }
        return type;
    }

    /**
     * Set players that are not connected to CPU.
     **/
    setPlayersHuman(): void {
        if (this.isHost) {

            let continu = false;
            for (let i = 0; i < 8; i++) {
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
                // 0x90 CPU bitflag.
                this.ModLoader.emulator.rdramWrite8(this.helperFunc.GetPlayerPointer(i).p, 0x90);
            }
        }
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
    @NetworkHandler(mk64Events.ON_RANDOMIZED_PROPERTIES)
    onRandomizedProperties(packet: packet_RandomizedProperties): void {

        // We need to resort the array. The local player uses the index: zero.
        // As such, the zero in 1, 0, 4, 6, technically refers to the host here.
        // if we do a this.ModLoader.me.uuid check an index from player connections will be returned.
        // Therefore, when we write this array into the game, we need to our networked index to become zero.
        // Swapping zero with our networked index.

        this.ModLoader.logger.info(this.isHost.toString());

        if (this.isHost == false) {
            let arr: number[] = packet.playerStartOrder;

            const zero = arr.indexOf(0);
            const networkedIndex = arr.indexOf(this.players[this.ModLoader.me.uuid].index);
            
            // swap
            arr[zero] = arr[networkedIndex];
            arr[networkedIndex] = 0;
            this.ModLoader.logger.info("RAN");
            this.ModLoader.logger.info(arr.toString());

            
            for (let i = 0; i < 8; i++) {
                this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + (0x2 * i), arr[i]);
            }
        }


/*
        this.playerStartOrder = packet.playerStartOrder;
        Object.keys(this.players).forEach((id) => {
            switch(this.players[id].index) {
                case 0:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p, this.playerStartOrder[this.players[id].index]);
                    break;
                case 1:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x2, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x2, this.players[id].characterTableIndex);
                    break;
                case 2:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x4, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x4, this.players[id].characterTableIndex);
                    break;
                case 3:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x6, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x6, this.players[id].characterTableIndex);
                    break;
                case 4:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0x8, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0x8, this.players[id].characterTableIndex);
                    break;
                case 5:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0xA, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0xA, this.players[id].characterTableIndex);
                    break;
                case 6:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0xC, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0xC, this.players[id].characterTableIndex);
                    break;
                case 7:
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netPlayerPositions.p + 0xE, this.playerStartOrder[this.players[id].index]);
                    this.ModLoader.emulator.rdramWrite16(this.helperFunc.syms.netCharacterSelections.p + 0xE, this.players[id].characterTableIndex);
                    break;

            }
        });
        */
        
    }

    @NetworkHandler(mk64Events.ON_PLAYER_RECORD)
    OnPlayerRecord(packet: packet_PlayerRecord): void {
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
        this.ModLoader.emulator.rdramWrite8(this.helperFunc.syms.gCharacterGridSelections.p + this.players[packet.player.uuid].index + 1, packet.character);
        
        //this.players
        //0x0254
    }

    @NetworkHandler(mk64Events.ON_PLAYER_UPDATE)
    onPlayerUpdate(packet: mk64mp_PlayerPacket) {
        //let offset;
        if (this.ModLoader.me.uuid === packet.player.uuid) {
            return;
        }
        //offset = (this.players[packet.player.uuid].index + 1) * this.helperFunc.syms.playerStructSize;

        let pPlayer = this.helperFunc.GetPlayerPointer(this.players[packet.player.uuid].index);

        if (pPlayer.p == this.helperFunc.syms.gPlayer1.p) {
            pPlayer = this.helperFunc.syms.gPlayer2;
        }

        this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x14, packet.localPlayer.posX);
        this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x18, packet.localPlayer.posY);
        this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x1C, packet.localPlayer.posZ);
        this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x20, packet.localPlayer.rotX);
        this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x24, packet.localPlayer.rotY);
        this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x28, packet.localPlayer.rotZ);
        this.ModLoader.emulator.rdramWrite16(pPlayer.p + 0x2E, packet.localPlayer.turn);
        
        //this.ModLoader.logger.info(packet.localPlayer.posX.toString(16)+
        //                        " | "+packet.localPlayer.posY.toString(16)+" | "+
        //                        packet.localPlayer.posZ.toString(16));
        //packet.player.uuid.toString();
 
    }

    @NetworkHandler(mk64Events.ON_CPU_UPDATE)
    onCpuUpdate(packet: mk64mp_CpuPacket) {
        if (!this.isHost) {
            let pPlayer = this.helperFunc.GetPlayerPointer(packet.CPU.index);

            this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x14, packet.CPU.posX);
            this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x18, packet.CPU.posY);
            this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x1C, packet.CPU.posZ);
            this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x20, packet.CPU.rotX);
            this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x24, packet.CPU.rotY);
            this.ModLoader.emulator.rdramWriteF32(pPlayer.p + 0x28, packet.CPU.rotZ);
            this.ModLoader.emulator.rdramWrite16(pPlayer.p + 0x2E, packet.CPU.turn);
        }
    }

    @NetworkHandler(mk64Events.ON_LOBBY_FULL)
    onLobbyFull(packet: packet_LobbyFull) {
        process.exit(0);
    }
}