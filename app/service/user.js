'use strict';

const Service = require('egg').Service;

class UserService extends Service {

  async oauthRegister(user) {
    const service = await this.ctx.model.Service.findOne({
      where: {
        uid: user.id,
        provider: user.provider,
      },
    });
    if (!service) {
      const siteUser = await this.ctx.model.User.create({
        name: user.name,
        email: `${user.provider}_${user.id}@devhub.io`,
        password: '',
        last_activated_at: new Date(),
        avatar: user.photo,
      });

      await this.ctx.model.Service.create({
        user_id: siteUser.id,
        uid: user.id,
        provider: user.provider,
        name: user.provider,
        token: user.accessToken,
        secret: '',
        refresh_token: user.refreshToken || '',
        options: JSON.stringify(user),
      });
      return siteUser;
    }
    const existsUser = await this.ctx.model.User.findOne({
      where: {
        id: service.user_id,
      },
    });
    if (existsUser) {
      service.access_token = user.accessToken;
      service.save();
      existsUser.last_activated_at = new Date();
      existsUser.save();
      return existsUser;
    }
    return false;
  }

}

module.exports = UserService;