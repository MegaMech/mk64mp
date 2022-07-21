import {
    Packet
  } from 'modloader64_api/ModLoaderDefaultImpls';
import {mk64Cpu, mk64Events, mk64Player} from "MK64Core";
import PlayerData from "MK64Core";

export class packet_RandomizedProperties extends Packet {
    playerStartOrder: number[];
    constructor(lobby: string, playerStartOrder: number[]) {
        super(mk64Events.ON_RANDOMIZED_PROPERTIES, "mk64mp", lobby);
        this.playerStartOrder = playerStartOrder;
    }
}

export class mk64mp_PlayerPacket extends Packet {
    localPlayer: mk64Player;
    foward = true;
    
    constructor(lobby: string, localPlayer: mk64Player) {
        super(mk64Events.ON_PLAYER_UPDATE, 'mk64mp', lobby, true);
        this.localPlayer = localPlayer;
    }
}

export class mk64mp_CpuPacket extends Packet {
    CPU: mk64Cpu;
    foward = true;
    
    constructor(lobby: string, CPU: mk64Cpu) {
        super(mk64Events.ON_CPU_UPDATE, 'mk64mp', lobby, true);
        this.CPU = CPU;
    }
}

export class packet_PlayerRecord extends Packet {
    players: Record<string, PlayerData>;
    
    constructor(lobby: string, players: Record<string, PlayerData>) {
        super(mk64Events.ON_PLAYER_RECORD, 'mk64mp', lobby);
        this.players = players;
    }
}

export class packet_SelectedCharacter extends Packet {
    character: number;

    constructor(lobby: string, character: number) {
        super(mk64Events.ON_SELECTED_CHARACTER, 'mk64mp', lobby)
        this.character = character;
    }
}

export class packet_LobbyFull extends Packet {;
    constructor(lobby: string) {
        super(mk64Events.ON_LOBBY_FULL, 'mk64mp', lobby);    }
}

export class ConnectedPlayers {
    networkPlayerInstances: any = {};
    players: any = {};
}