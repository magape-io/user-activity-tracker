/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
export interface Env {
	DB: D1Database;
}

export default {
	async fetch(request, env): Promise<Response> {
		// 添加CORS headers的辅助函数
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};

		// 处理 OPTIONS 预检请求
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders
			});
		}

		const { pathname, searchParams } = new URL(request.url);

		// 写入用户活动数据
		if (pathname === '/api/activities' && request.method === 'POST') {
			try {
				const data:any = await request.json();

				// 首先检查是否存在相同的 session_id
				const existingRecord = await env.DB.prepare(
					'SELECT session_id FROM user_activities WHERE session_id = ?'
				).bind(data.session_id).first();

				let stmt;
				if (existingRecord) {
					// 如果记录存在，只更新 active_time
					stmt = await env.DB.prepare(`
						UPDATE user_activities
						SET active_time = ?
						WHERE session_id = ?
					`).bind(
						data.active_time,
						data.session_id
					);
				} else {
					// 如果记录不存在，插入新记录
					stmt = await env.DB.prepare(`
						INSERT INTO user_activities (
							session_id, game_id, game_name, user_ip,
							login_time, active_time, is_window_focused,
							has_recent_interaction, os, os_version,
							browser, browser_version, device_type,
							device_model, screen_width, screen_height,
							color_depth, pixel_ratio, viewport_width,
							viewport_height, hardware_cores,
							hardware_memory, hardware_platform,
							language, timezone, timestamp
						) VALUES (
							?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
							?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
							?, ?, ?, ?, ?, ?
						)
					`).bind(
						data.session_id,
						data.game_id,
						data.game_name,
						data.user_ip,
						data.login_time,
						data.active_time,
						data.is_window_focused ? 1 : 0,
						data.has_recent_interaction ? 1 : 0,
						data.os,
						data.os_version,
						data.browser,
						data.browser_version,
						data.device_type,
						data.device_model,
						data.screen_width,
						data.screen_height,
						data.color_depth,
						data.pixel_ratio,
						data.viewport_width,
						data.viewport_height,
						data.hardware_cores,
						data.hardware_memory,
						data.hardware_platform,
						data.language,
						data.timezone,
						data.timestamp
					);
				}

				await stmt.run();
				return Response.json(
					{ success: true, message: '数据操作成功' },
					{ headers: corsHeaders }
				);
			} catch (error) {
				return Response.json(
					{ success: false, error: error.message },
					{ status: 400, headers: corsHeaders }
				);
			}
		}

		// 查询用户活动数据
		if (pathname === '/api/activities' && request.method === 'GET') {
			try {
				let query = 'SELECT * FROM user_activities WHERE 1=1';
				const params = [];

				// 支持的过滤条件
				const filters = {
					game_id: searchParams.get('game_id'),
					device_type: searchParams.get('device_type'),
					session_id: searchParams.get('session_id'),
					user_ip: searchParams.get('user_ip'),
					start_time: searchParams.get('start_time'),
					end_time: searchParams.get('end_time')
				};

				if (filters.game_id) {
					query += ' AND game_id = ?';
					params.push(filters.game_id);
				}

				if (filters.device_type) {
					query += ' AND device_type = ?';
					params.push(filters.device_type);
				}

				if (filters.session_id) {
					query += ' AND session_id = ?';
					params.push(filters.session_id);
				}

				if (filters.user_ip) {
					query += ' AND user_ip = ?';
					params.push(filters.user_ip);
				}

				if (filters.start_time) {
					query += ' AND timestamp >= ?';
					params.push(filters.start_time);
				}

				if (filters.end_time) {
					query += ' AND timestamp <= ?';
					params.push(filters.end_time);
				}

				// 添加排序
				query += ' ORDER BY timestamp DESC';

				const { results } = await env.DB.prepare(query).bind(...params).all();
				return Response.json(results, { headers: corsHeaders });
			} catch (error) {
				return Response.json(
					{ success: false, error: error.message },
					{ status: 400, headers: corsHeaders }
				);
			}
		}

		return new Response(
			'请使用以下接口：\n- POST /api/activities 写入数据\n- GET /api/activities 查询数据',
			{ headers: corsHeaders }
		);
	},
} satisfies ExportedHandler<Env>;
