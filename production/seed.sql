INSERT INTO user_activities (
    session_id,
    game_id,
    game_name,
    user_ip,
    login_time,
    active_time,
    is_window_focused,
    has_recent_interaction,
    os,
    os_version,
    browser,
    browser_version,
    device_type,
    device_model,
    screen_width,
    screen_height,
    color_depth,
    pixel_ratio,
    viewport_width,
    viewport_height,
    hardware_cores,
    hardware_memory,
    hardware_platform,
    language,
    timezone,
    timestamp
) VALUES
(
    'sess_123456',
    'game_001',
    '超级马里奥',
    '192.168.1.1',
    '2024-03-20 10:00:00',
    300000,
    true,
    true,
    'Windows',
    '11',
    'Chrome',
    '122.0.0',
    'desktop',
    'PC',
    1920,
    1080,
    24,
    1.5,
    1800,
    900,
    '8',
    '16GB',
    'Win32',
    'zh-CN',
    'Asia/Shanghai',
    '2024-03-20 10:05:00'
),
(
    'sess_789012',
    'game_002',
    '俄罗斯方块',
    '192.168.1.2',
    '2024-03-20 11:00:00',
    240000,
    true,
    true,
    'MacOS',
    'Sonoma',
    'Safari',
    '17.0',
    'desktop',
    'MacBook Pro',
    2560,
    1600,
    32,
    2.0,
    2400,
    1500,
    '10',
    '32GB',
    'MacIntel',
    'en-US',
    'America/New_York',
    '2024-03-20 11:04:00'
),
(
    'sess_345678',
    'game_003',
    '贪吃蛇',
    '192.168.1.3',
    '2024-03-20 12:00:00',
    180000,
    false,
    false,
    'iOS',
    '17.4',
    'Mobile Safari',
    '17.0',
    'mobile',
    'iPhone 15',
    390,
    844,
    32,
    3.0,
    390,
    844,
    '6',
    '8GB',
    'iPhone',
    'zh-CN',
    'Asia/Tokyo',
    '2024-03-20 12:03:00'
);
