CREATE TABLE user_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    game_id TEXT NOT NULL,
    game_name TEXT NOT NULL,
    user_ip TEXT,
    login_time DATETIME NOT NULL,
    active_time INTEGER NOT NULL,  -- 以毫秒为单位的活跃时间
    is_window_focused BOOLEAN,
    has_recent_interaction BOOLEAN,

    -- 设备信息
    os TEXT,
    os_version TEXT,
    browser TEXT,
    browser_version TEXT,
    device_type TEXT,
    device_model TEXT,

    -- 屏幕信息
    screen_width INTEGER,
    screen_height INTEGER,
    color_depth INTEGER,
    pixel_ratio FLOAT,

    -- 视口信息
    viewport_width INTEGER,
    viewport_height INTEGER,

    -- 硬件信息
    hardware_cores TEXT,
    hardware_memory TEXT,
    hardware_platform TEXT,

    -- 其他信息
    language TEXT,
    timezone TEXT,

    timestamp DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 建议添加索引以提高查询性能
CREATE INDEX idx_session_id ON user_activities(session_id);
CREATE INDEX idx_game_id ON user_activities(game_id);
CREATE INDEX idx_timestamp ON user_activities(timestamp);
CREATE INDEX idx_user_ip ON user_activities(user_ip);
