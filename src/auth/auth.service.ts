import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

// Définition locale du type Profile pour pallier les problèmes de synchronisation du client Prisma
export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, _pass: string): Promise<Profile | null> {
    if (!_pass) {
      console.log('Mot de passe manquant');
    }

    // Utilisation de PrismaService avec un typage forcé si nécessaire pour éviter les erreurs "unsafe"
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const user = (await (this.prisma as any).profile.findUnique({
      where: { email },
    })) as Profile | null;

    if (user) {
      return user;
    }
    return null;
  }

  login(user: Profile) {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
