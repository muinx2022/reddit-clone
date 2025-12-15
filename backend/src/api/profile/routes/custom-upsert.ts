export default {
    routes: [
        {
            method: 'POST',
            path: '/profile/upsert',
            handler: async (ctx) => {
                const user = ctx.state.user;

                if (!user) {
                    ctx.status = 401;
                    ctx.body = { error: 'Unauthorized', message: 'Bạn cần đăng nhập để thực hiện hành động này' };
                    return;
                }

                try {
                    // Sử dụng 'where' thay vì 'filters' (cú pháp đúng Strapi v5)
                    let profile = await strapi.db.query('api::profile.profile').findOne({
                        where: { user: { id: user.id } },
                        // Nếu cần populate (avatar, posts, v.v.) sau này, dùng:
                        // populate: { avatar: { fields: ['name', 'url', 'alternativeText'] } },
                    });

                    // Nếu chưa có profile → tạo mới
                    if (!profile) {
                        profile = await strapi.db.query('api::profile.profile').create({
                            data: {
                                user: user.id,
                                email: user.email,
                                username: user.username || user.email.split('@')[0],
                                oauthProvider: user.provider || 'none',
                                // Các field default khác nếu cần
                                score: 0,
                                roles: ['member'],
                            },
                            // populate: { avatar: true }, // nếu cần
                        });
                    }

                    ctx.body = profile;
                    ctx.status = 200;
                } catch (error) {
                    console.error('[Profile Upsert Error]', error);
                    ctx.status = 500;
                    ctx.body = {
                        error: 'Internal Server Error',
                        message: error instanceof Error ? error.message : 'Unknown error',
                    };
                }
            },
            config: {
                auth: { scope: [] },
                policies: [],
                middlewares: [],
            },
        },

        // GET để test route
        {
            method: 'GET',
            path: '/profile/upsert',
            handler: (ctx) => {
                ctx.body = {
                    message: 'Route /api/profile/upsert đang hoạt động. Dùng POST + JWT để upsert profile.',
                };
            },
            config: {
                auth: false,
            },
        },
    ],
};