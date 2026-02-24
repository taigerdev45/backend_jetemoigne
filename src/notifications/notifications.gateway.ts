import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
    namespace: 'notifications',
})
export class NotificationsGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('NotificationsGateway');

    constructor(private readonly jwtService: JwtService) { }

    afterInit(server: Server) {
        this.logger.log('Notifications Gateway Initialized');
    }

    async handleConnection(client: Socket, ...args: any[]) {
        const token = client.handshake.auth.token || client.handshake.headers.authorization;

        if (!token) {
            this.logger.warn(`Client ${client.id} tried to connect without token`);
            client.disconnect();
            return;
        }

        try {
            // Découper "Bearer <token>" si nécessaire
            const actualToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
            const payload = this.jwtService.verify(actualToken);

            // On vérifie si l'utilisateur est admin/staff pour les notifications sensibles
            if (!['admin', 'super_admin', 'manager', 'accountant'].includes(payload.role)) {
                this.logger.warn(`User ${payload.email} is not authorized for notifications`);
                // On peut soit déconnecter, soit restreindre les "rooms"
            }

            client.data.user = payload;
            this.logger.log(`Client connected: ${client.id} (User: ${payload.email})`);

            // On rejoint une room "admins" si nécessaire
            if (['admin', 'super_admin', 'manager'].includes(payload.role)) {
                client.join('admins');
            }
        } catch (err) {
            this.logger.error(`Connection failed for client ${client.id}: ${err.message}`);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);
    }

    /**
     * Émettre une notification à tous les administrateurs
     */
    notifyAdmins(event: string, payload: any) {
        if (this.server) {
            this.server.to('admins').emit(event, payload);
        } else {
            console.warn('Notification Gateway: Server not initialized, skipping emit.');
        }
    }

    /**
     * Émettre une notification à tout le monde
     */
    notifyAll(event: string, payload: any) {
        this.server.emit(event, payload);
    }
}
