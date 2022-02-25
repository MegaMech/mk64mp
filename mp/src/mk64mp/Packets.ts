import {
    Packet
  } from 'modloader64_api/ModLoaderDefaultImpls';
import {mk64Events, mk64Player} from "./MK64Core";



export class mk64mp_PlayerPacket extends Packet {
    localPlayer: mk64Player;
    foward = true;
    
    constructor(lobby: string, localPlayer: mk64Player) {
        super(mk64Events.ON_PLAYER_UPDATE, 'mk64mp', lobby, true);
        this.localPlayer = localPlayer;
    }
}

export class packet_PlayerRecord extends Packet {
    players: Record<string, number>;
    
    constructor(lobby: string, players: Record<string, number>) {
        super(mk64Events.ON_PLAYER_RECORD, 'mk64mp', lobby);
        this.players = players;
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
