import type { Core } from '@strapi/strapi';

const service = ({ strapi }: { strapi: Core.Strapi }) => ({

  getWelcomeMessage() {
    return 'Welcome to Strapi 🚀';
  },

  /**
   * Gọi khi user login thành công (local + OAuth)
   */
  async afterUserLogin(user: any) {
    // Ví dụ: cập nhật lastLogin
    await strapi.db.query('plugin::users-permissions.user').update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    strapi.log.info(
      `[user-profile-hooks] afterUserLogin executed for ${user.email} (ID: ${user.id})`
    );
  },

});

export default service;
