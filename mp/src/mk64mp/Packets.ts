import {
    Packet
  } from 'modloader64_api/ModLoaderDefaultImpls';
import {mk64Player} from "./MK64Core";

export class mk64mp_PlayerPacket extends Packet {
    players: mk64Player;
    
    constructor(lobby: string, players: mk64Player) {
        super('Z64O_ScenePacket', 'Z64Online', lobby, true);
        this.players = mk64Player;
    }
}

export class ConnectedPlayers {
    networkPlayerInstances: any = {};
    players: any = {};
}
