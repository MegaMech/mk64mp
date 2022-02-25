import {
    Packet
  } from 'modloader64_api/ModLoaderDefaultImpls';
import {mk64Player} from "./MK64Core";



export class mk64mp_PlayerPacket extends Packet {
    localPlayer: mk64Player;
    
    constructor(lobby: string, localPlayer: mk64Player) {
        super('mk64mp_PlayerPacket', 'mk64mp', lobby, true);
        this.localPlayer = localPlayer;
    }
}

export class ConnectedPlayers {
    networkPlayerInstances: any = {};
    players: any = {};
}
