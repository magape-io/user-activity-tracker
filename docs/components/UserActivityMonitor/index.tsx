import React, { useState, useEffect, useRef } from 'react';
import { UserActivityMonitor } from './UserActivityMonitor';
import styles from './styles.module.css';

const ActivityMonitor = () => {
    const [monitorData, setMonitorData] = useState({
        isActive: true,
        activeTime: 0,
        pauseReason: null,
        userInfo: null
    });
    
    const monitorRef = useRef(null);

    useEffect(() => {
        monitorRef.current = new UserActivityMonitor({
            inactiveThreshold: 30000,
            noActivityThreshold: 10000,
            sendInterval: 10000,
            endpoint: 'http://localhost:8787/api/activities',
            gameId: 'game_001',
            gameName: 'Super Mario'
        });

        const updateInterval = setInterval(() => {
            if (monitorRef.current) {
                const userInfo = monitorRef.current.getUserInfo();
                setMonitorData({
                    isActive: userInfo.isActive,
                    activeTime: monitorRef.current.getActiveTime(),
                    pauseReason: userInfo.pauseReason,
                    userInfo: userInfo
                });
            }
        }, 1000);

        return () => clearInterval(updateInterval);
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.wrapper}>
                <div className={styles.card}>
                    <h1 className={styles.title}>
                        用户活动监控面板
                    </h1>
                    
                    <div className={styles.cardGrid}>
                        {/* 活跃时间卡片 */}
                        <div className={`${styles.infoCard} ${styles.activeTimeCard}`}>
                            <h2 className={styles.cardTitle}>活跃时间</h2>
                            <div className={styles.activeTime}>
                                {monitorData.activeTime} 秒
                            </div>
                        </div>

                        {/* 状态卡片 */}
                        <div className={`${styles.infoCard} ${
                            monitorData.isActive ? styles.statusCardActive : styles.statusCardInactive
                        }`}>
                            <h2 className={styles.cardTitle}>当前状态</h2>
                            <div className={monitorData.isActive ? styles.statusActive : styles.statusInactive}>
                                {monitorData.isActive ? '活跃' : '不活跃'}
                            </div>
                            {monitorData.pauseReason && (
                                <div className={styles.pauseReason}>
                                    原因: {monitorData.pauseReason}
                                </div>
                            )}
                        </div>

                        {/* 详细信息卡片 */}
                        <div className={`${styles.infoCard} ${styles.detailsCard}`}>
                            <h2 className={styles.cardTitle}>详细信息</h2>
                            <pre className={styles.preBlock}>
                                {JSON.stringify(monitorData.userInfo || {}, null, 2)}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityMonitor;