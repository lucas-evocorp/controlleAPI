import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { IUserAuth as IUserAuthResponse } from 'src/core/interfaces/user-auth.interface';
import { Ipayload } from '../interfaces/payload.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: Ipayload): Promise<IUserAuthResponse> {
    return { userId: payload.sub, username: payload.username };
  }
}
